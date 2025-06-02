import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side için Supabase client oluştur
function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

interface GitWebhookPayload {
  ref: string
  commits: Array<{
    id: string
    message: string
    author: {
      name: string
      email: string
    }
    timestamp: string
  }>
  repository: {
    name: string
    full_name: string
  }
  pusher: {
    name: string
    email: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: GitWebhookPayload = await request.json()
    const supabase = getServerSupabaseClient()
    
    // Extract branch name from ref (refs/heads/main -> main)
    const branch = payload.ref.replace('refs/heads/', '')
    const latestCommit = payload.commits[0]
    
    if (!latestCommit) {
      return NextResponse.json({ error: 'No commits found' }, { status: 400 })
    }

    console.log(`🔄 Git webhook received: ${branch} - ${latestCommit.message}`)

    // Create new pipeline for the push
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .insert([{
        branch,
        commit_sha: latestCommit.id.substring(0, 8),
        author: latestCommit.author.name,
        message: latestCommit.message,
        status: 'pending',
        environment: getEnvironmentFromBranch(branch),
        started_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (pipelineError) {
      console.error('Pipeline creation error:', pipelineError)
      return NextResponse.json({ error: 'Failed to create pipeline' }, { status: 500 })
    }

    console.log(`📋 Created pipeline ${pipeline.id} for ${branch}`)

    // Create pipeline jobs
    const jobs = generatePipelineJobs(branch, pipeline.id)
    const { error: jobsError } = await supabase
      .from('pipeline_jobs')
      .insert(jobs)

    if (jobsError) {
      console.error('Jobs creation error:', jobsError)
    } else {
      console.log(`✅ Created ${jobs.length} jobs for pipeline ${pipeline.id}`)
    }

    // Start pipeline execution simulation
    await simulatePipelineExecution(pipeline.id, supabase)

    // Create merge request if it's a feature branch
    if (branch.startsWith('feature/') || branch.startsWith('hotfix/')) {
      await createMergeRequest(branch, latestCommit, supabase)
    }

    // Send webhook response
    return NextResponse.json({
      success: true,
      pipeline_id: pipeline.id,
      message: `Pipeline created for ${branch}`
    })

  } catch (error) {
    console.error('Git webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

function getEnvironmentFromBranch(branch: string): string {
  if (branch === 'main' || branch === 'master') return 'production'
  if (branch === 'develop' || branch === 'staging') return 'staging'
  return 'development'
}

function generatePipelineJobs(branch: string, pipelineId: string) {
  const baseJobs = [
    { name: 'Lint & Type Check', order: 1 },
    { name: 'Unit Tests', order: 2 },
    { name: 'Build Applications', order: 3 },
    { name: 'Integration Tests', order: 4 }
  ]

  const environment = getEnvironmentFromBranch(branch)
  
  // Add deployment job for main/staging branches
  if (environment === 'production') {
    baseJobs.push({ name: 'Deploy to Production', order: 5 })
  } else if (environment === 'staging') {
    baseJobs.push({ name: 'Deploy to Staging', order: 5 })
  }

  return baseJobs.map(job => ({
    pipeline_id: pipelineId,
    name: job.name,
    status: 'pending'
  }))
}

async function simulatePipelineExecution(pipelineId: string, supabase: any) {
  // Start pipeline
  await supabase
    .from('pipelines')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', pipelineId)

  // Simulate job execution with delays
  setTimeout(async () => {
    await executeJobsSequentially(pipelineId, supabase)
  }, 1000)
}

async function executeJobsSequentially(pipelineId: string, supabase: any) {
  try {
    const { data: jobs } = await supabase
      .from('pipeline_jobs')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .order('created_at')

    for (const job of jobs || []) {
      // Start job
      await supabase
        .from('pipeline_jobs')
        .update({ 
          status: 'running', 
          started_at: new Date().toISOString() 
        })
        .eq('id', job.id)

      // Simulate job duration (random between 30s-2min)
      const duration = Math.floor(Math.random() * 90) + 30
      
      await new Promise(resolve => setTimeout(resolve, duration * 1000))

      // Random success/failure (90% success rate)
      const success = Math.random() > 0.1
      const status = success ? 'success' : 'failed'
      
      await supabase
        .from('pipeline_jobs')
        .update({ 
          status,
          finished_at: new Date().toISOString(),
          duration,
          logs: generateJobLogs(job.name, success, duration)
        })
        .eq('id', job.id)

      // If job failed, fail the entire pipeline
      if (!success) {
        await supabase
          .from('pipelines')
          .update({ 
            status: 'failed', 
            finished_at: new Date().toISOString() 
          })
          .eq('id', pipelineId)
        return
      }
    }

    // All jobs succeeded
    await supabase
      .from('pipelines')
      .update({ 
        status: 'success', 
        finished_at: new Date().toISOString() 
      })
      .eq('id', pipelineId)

  } catch (error) {
    console.error('Job execution error:', error)
    await supabase
      .from('pipelines')
      .update({ 
        status: 'failed', 
        finished_at: new Date().toISOString() 
      })
      .eq('id', pipelineId)
  }
}

function generateJobLogs(jobName: string, success: boolean, duration: number): string {
  const logs = [
    `🚀 Starting ${jobName}...`,
    `⏳ Setting up environment...`,
    `📦 Installing dependencies...`,
    `🔧 Running ${jobName.toLowerCase()}...`
  ]

  if (success) {
    logs.push(`✅ ${jobName} completed successfully in ${duration}s`)
  } else {
    logs.push(`❌ ${jobName} failed after ${duration}s`)
    logs.push(`💥 Error: ${getRandomError()}`)
  }

  return logs.join('\n')
}

function getRandomError(): string {
  const errors = [
    'Build process exited with code 1',
    'Test suite failed: 3 of 45 tests failed',
    'TypeScript compilation error in src/components/Dashboard.tsx',
    'Linting failed: 5 errors found',
    'Deployment timeout: Could not connect to server'
  ]
  return errors[Math.floor(Math.random() * errors.length)]
}

async function createMergeRequest(branch: string, commit: any, supabase: any) {
  const targetBranch = branch.startsWith('hotfix/') ? 'main' : 'develop'
  
  await supabase
    .from('merge_requests')
    .insert([{
      title: `${branch.replace('feature/', '').replace('hotfix/', '').replace(/-/g, ' ')}: ${commit.message}`,
      description: `Auto-generated merge request from ${branch}`,
      author: commit.author.name,
      source_branch: branch,
      target_branch: targetBranch,
      status: 'open',
      approvals: 0,
      required_approvals: targetBranch === 'main' ? 2 : 1,
      conflicts: Math.random() > 0.8, // 20% chance of conflicts
      pipeline_status: 'running',
      additions: Math.floor(Math.random() * 200) + 50,
      deletions: Math.floor(Math.random() * 50) + 5,
      files_changed: Math.floor(Math.random() * 10) + 2
    }])
} 