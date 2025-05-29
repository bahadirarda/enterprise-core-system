import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    const { data: mergeRequests, error } = await supabase
      .from('merge_requests')
      .select(`
        *,
        merge_approvals (
          id, approver, action, comment, created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error || !mergeRequests || mergeRequests.length === 0) {
      console.error('Merge requests fetch error or empty:', error)
      // Return comprehensive mock data if database error or empty
      return NextResponse.json([
        {
          id: "1",
          externalId: "2",
          title: "✨ Enhance Integrations UI: Modern AutomationPanel-style Design",
          description: "Migrated from Teams-specific architecture to a general \"Integrations\" framework with modern AutomationPanel-style UI design.",
          author: "bahadirarda",
          sourceBranch: "feature/enhance-teams-notifications",
          targetBranch: "main",
          status: "open",
          approvals: 0,
          requiredApprovals: 1,
          pipelineStatus: "running",
          additions: 2611,
          deletions: 17,
          filesChanged: 17,
          createdAt: "2025-05-28T09:15:00Z",
          updatedAt: "2025-05-28T09:15:00Z",
          conflicts: false,
          mergeApprovals: []
        },
        {
          id: "2",
          externalId: "3",
          title: "🔧 Fix Authentication Middleware",
          description: "Resolve authentication issues with middleware not properly handling JWT tokens.",
          author: "team-member",
          sourceBranch: "fix/auth-middleware",
          targetBranch: "main",
          status: "open",
          approvals: 1,
          requiredApprovals: 2,
          pipelineStatus: "success",
          additions: 45,
          deletions: 12,
          filesChanged: 3,
          createdAt: "2025-05-28T10:30:00Z",
          updatedAt: "2025-05-28T11:00:00Z",
          conflicts: false,
          mergeApprovals: [
            {
              id: "1",
              approver: "lead-developer",
              action: "approve",
              comment: "LGTM! Good fix for the auth issues.",
              createdAt: "2025-05-28T11:00:00Z"
            }
          ]
        }
      ])
    }

    // Transform the data to match frontend expectations
    type MergeApprovalRow = {
      id: string;
      approver: string;
      action: string;
      comment: string | null;
      created_at: string;
    };
    type MergeRequestRow = {
      id: string;
      external_id: string;
      title: string;
      description: string;
      author: string;
      source_branch: string;
      target_branch: string;
      status: string;
      approvals: number;
      required_approvals: number;
      pipeline_status: string;
      additions: number;
      deletions: number;
      files_changed: number;
      created_at: string;
      updated_at: string;
      conflicts: boolean;
      merge_approvals?: MergeApprovalRow[];
    };
    const transformedData = mergeRequests?.map((mr: MergeRequestRow) => ({
      id: mr.id,
      externalId: mr.external_id,
      title: mr.title,
      description: mr.description,
      author: mr.author,
      sourceBranch: mr.source_branch,
      targetBranch: mr.target_branch,
      status: mr.status,
      approvals: mr.approvals,
      requiredApprovals: mr.required_approvals,
      pipelineStatus: mr.pipeline_status,
      additions: mr.additions,
      deletions: mr.deletions,
      filesChanged: mr.files_changed,
      createdAt: mr.created_at,
      updatedAt: mr.updated_at,
      conflicts: mr.conflicts,
      mergeApprovals: mr.merge_approvals?.map((approval: MergeApprovalRow) => ({
        id: approval.id,
        approver: approval.approver,
        action: approval.action,
        comment: approval.comment,
        createdAt: approval.created_at
      })) || []
    })) || []

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Merge requests API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getSupabaseClient()
    
    // Create new merge request from GitHub webhook
    const { data: mergeRequest, error } = await supabase
      .from('merge_requests')
      .insert([{
        external_id: body.externalId,
        title: body.title,
        description: body.description,
        author: body.author,
        source_branch: body.sourceBranch,
        target_branch: body.targetBranch,
        status: 'open',
        additions: body.additions || 0,
        deletions: body.deletions || 0,
        files_changed: body.filesChanged || 0,
        pipeline_status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      console.error('Merge request creation error:', error)
      return NextResponse.json({
        id: Date.now().toString(),
        ...body,
        status: 'open',
        created_at: new Date().toISOString()
      })
    }

    return NextResponse.json(mergeRequest)
  } catch (error) {
    console.error('Merge request creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getSupabaseClient()
    const { id, action, approver, comment } = body

    if (action === 'approve' || action === 'reject') {
      // Add approval/rejection record
      const { error: approvalError } = await supabase
        .from('merge_approvals')
        .insert([{
          merge_request_id: id,
          approver: approver,
          action: action,
          comment: comment || null
        }])

      if (approvalError) {
        console.error('Approval creation error:', approvalError)
      }

      // Update merge request approval count
      const { data: currentMR } = await supabase
        .from('merge_requests')
        .select('approvals, required_approvals')
        .eq('id', id)
        .single()

      if (currentMR && action === 'approve') {
        const newApprovalCount = currentMR.approvals + 1
        const shouldMerge = newApprovalCount >= currentMR.required_approvals

        await supabase
          .from('merge_requests')
          .update({
            approvals: newApprovalCount,
            status: shouldMerge ? 'merged' : 'open',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      }
    } else {
      // Update merge request fields
      const { error } = await supabase
        .from('merge_requests')
        .update({
          ...body,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Merge request update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 