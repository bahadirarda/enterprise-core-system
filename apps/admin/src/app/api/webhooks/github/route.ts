import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'dev-secret'

function verifySignature(payload: string, signature: string): boolean {
  if (!signature) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expectedSignature}`),
    Buffer.from(signature)
  )
}

async function createPipeline(data: Record<string, unknown>) {
  if (typeof data.ref !== 'string' || typeof data.head_commit !== 'object' || !data.head_commit) {
    throw new Error('Invalid push event payload')
  }
  const head_commit = data.head_commit as { id: string; author: { name: string }; message: string }
  const supabase = getSupabaseClient()

  const defaultJobs = [
    'Lint & Type Check',
    'Unit Tests', 
    'Build Applications',
    'Integration Tests',
    'Deploy to Environment'
  ]

  const { data: pipeline, error } = await supabase
    .from('pipelines')
    .insert({
      branch: data.ref.replace('refs/heads/', ''),
      commit_sha: head_commit.id,
      author: head_commit.author.name,
      message: head_commit.message,
      environment: data.ref.includes('main') ? 'production' : 
                   data.ref.includes('staging') ? 'staging' : 'development',
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create pipeline:', error)
    return null
  }

  // Create pipeline jobs
  const jobsData = defaultJobs.map(jobName => ({
    pipeline_id: pipeline.id,
    name: jobName,
    status: 'pending'
  }))

  await supabase
    .from('pipeline_jobs')
    .insert(jobsData)

  return pipeline
}

async function handlePullRequest(data: Record<string, unknown>) {
  const action = data.action as string
  const pull_request = data.pull_request as {
    number: number;
    title: string;
    body?: string;
    user: { login: string };
    head: { ref: string };
    base: { ref: string };
    draft?: boolean;
    additions?: number;
    deletions?: number;
    changed_files?: number;
    merged?: boolean;
  }
  const supabase = getSupabaseClient()

  if (action === 'opened' || action === 'reopened') {
    // Create new merge request
    const { data: mergeRequest, error } = await supabase
      .from('merge_requests')
      .insert({
        external_id: pull_request.number.toString(),
        title: pull_request.title,
        description: pull_request.body || '',
        author: pull_request.user.login,
        source_branch: pull_request.head.ref,
        target_branch: pull_request.base.ref,
        status: pull_request.draft ? 'draft' : 'open',
        required_approvals: pull_request.base.ref === 'main' ? 2 : 1,
        additions: pull_request.additions || 0,
        deletions: pull_request.deletions || 0,
        files_changed: pull_request.changed_files || 0,
        conflicts: false // This would need to be checked via GitHub API
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create merge request:', error)
      return null
    }

    // Create notification for team
    await supabase
      .from('automation_notifications')
      .insert({
        type: 'merge_request',
        title: 'New merge request requires approval',
        message: `"${pull_request.title}" by ${pull_request.user.login} needs review`,
        recipient: 'team',
        metadata: { 
          merge_request_id: mergeRequest.id,
          github_pr_number: pull_request.number,
          target_branch: pull_request.base.ref
        }
      })

    return mergeRequest

  } else if (action === 'closed') {
    // Update merge request status
    const status = pull_request.merged ? 'merged' : 'closed'
    
    await supabase
      .from('merge_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('external_id', pull_request.number.toString())

  } else if (action === 'synchronize') {
    // Update merge request with new changes
    await supabase
      .from('merge_requests')
      .update({
        additions: pull_request.additions || 0,
        deletions: pull_request.deletions || 0,
        files_changed: pull_request.changed_files || 0,
        updated_at: new Date().toISOString()
      })
      .eq('external_id', pull_request.number.toString())
  }

  return null
}

async function handleWorkflowRun(data: Record<string, unknown>) {
  const action = data.action as string
  const workflow_run = data.workflow_run as {
    status: string;
    conclusion?: string;
    run_started_at?: string;
    head_sha: string;
    pull_requests?: { number: number }[]
  }
  const supabase = getSupabaseClient()
  
  if (action === 'completed' || action === 'requested' || action === 'in_progress') {
    // Update pipeline status based on workflow
    const status = workflow_run.status === 'completed' 
      ? workflow_run.conclusion === 'success' ? 'success' : 'failed'
      : workflow_run.status === 'in_progress' ? 'running' : 'pending'

    await supabase
      .from('pipelines')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'running' ? { started_at: workflow_run.run_started_at } : {}),
        ...(status === 'success' || status === 'failed' ? { finished_at: new Date().toISOString() } : {})
      })
      .eq('commit_sha', workflow_run.head_sha)

    // Update related merge request pipeline status if exists
    if (workflow_run.pull_requests && workflow_run.pull_requests.length > 0) {
      const prNumber = workflow_run.pull_requests[0].number.toString()
      await supabase
        .from('merge_requests')
        .update({
          pipeline_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('external_id', prNumber)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-hub-signature-256') || ''
    const eventType = request.headers.get('x-github-event') || ''

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production' && !verifySignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(payload)
    let result = null
    const supabase = getSupabaseClient()

    switch (eventType) {
      case 'push':
        // Create pipeline for push events
        if (data.ref && data.head_commit && !data.deleted) {
          result = await createPipeline(data)
          
          // Create notification for push to main/staging
          if (data.ref.includes('main') || data.ref.includes('staging')) {
            await supabase
              .from('automation_notifications')
              .insert({
                type: 'pipeline',
                title: 'New pipeline triggered',
                message: `Push to ${data.ref.replace('refs/heads/', '')} by ${data.head_commit.author.name}`,
                recipient: 'team',
                metadata: { 
                  pipeline_id: result?.id,
                  branch: data.ref.replace('refs/heads/', ''),
                  commit: data.head_commit.id
                }
              })
          }
        }
        break

      case 'pull_request':
        result = await handlePullRequest(data)
        break

      case 'workflow_run':
        await handleWorkflowRun(data)
        break

      case 'pull_request_review':
        // Handle PR reviews for approval tracking
        const { action, review, pull_request } = data
        
        if (action === 'submitted' && review.state === 'approved') {
          // Update merge request approvals
          const { data: currentMR } = await supabase
            .from('merge_requests')
            .select('*')
            .eq('external_id', pull_request.number.toString())
            .single()

          if (currentMR) {
            const newApprovals = currentMR.approvals + 1
            const newStatus = newApprovals >= currentMR.required_approvals ? 'merged' : 'open'

            await supabase
              .from('merge_requests')
              .update({
                approvals: newApprovals,
                status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', currentMR.id)

            // Record the approval
            await supabase
              .from('merge_approvals')
              .insert({
                merge_request_id: currentMR.id,
                approver: review.user.login,
                action: 'approve',
                comment: review.body || ''
              })
          }
        }
        break

      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return NextResponse.json({
      success: true,
      event: eventType,
      processed: !!result,
      data: result
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle GitHub webhook ping
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'GitHub webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
} 