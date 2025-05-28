import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const targetBranch = searchParams.get('target_branch')
    const pendingApproval = searchParams.get('pending_approval')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('merge_requests')
      .select(`
        *,
        merge_approvals (
          id,
          approver,
          action,
          comment,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (targetBranch) {
      query = query.eq('target_branch', targetBranch)
    }

    if (pendingApproval === 'true') {
      query = query.eq('status', 'open').lt('approvals', 'required_approvals')
    }

    const { data: mergeRequests, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: mergeRequests,
      count: mergeRequests?.length || 0,
      pendingApprovals: mergeRequests?.filter(mr => 
        mr.status === 'open' && mr.approvals < mr.required_approvals
      ).length || 0
    })

  } catch (error) {
    console.error('Merge requests fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch merge requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      title,
      description,
      author,
      source_branch,
      target_branch,
      external_id,
      required_approvals = 1,
      additions = 0,
      deletions = 0,
      files_changed = 0
    } = body

    const { data: mergeRequest, error } = await supabase
      .from('merge_requests')
      .insert({
        title,
        description,
        author,
        source_branch,
        target_branch,
        external_id,
        required_approvals,
        additions,
        deletions,
        files_changed,
        status: 'open'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for pending approval
    await supabase
      .from('automation_notifications')
      .insert({
        type: 'merge_request',
        title: 'New merge request requires approval',
        message: `"${title}" needs review and approval`,
        recipient: 'team', // In production, this would be based on repo settings
        metadata: { merge_request_id: mergeRequest.id }
      })

    return NextResponse.json({
      success: true,
      data: mergeRequest
    })

  } catch (error) {
    console.error('Merge request creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create merge request' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, approver, comment } = body

    if (action === 'approve' || action === 'reject') {
      // Get current merge request
      const { data: mergeRequest, error: fetchError } = await supabase
        .from('merge_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !mergeRequest) {
        return NextResponse.json(
          { error: 'Merge request not found' },
          { status: 404 }
        )
      }

      if (mergeRequest.status !== 'open') {
        return NextResponse.json(
          { error: 'Merge request is not open for approval' },
          { status: 400 }
        )
      }

      // Record the approval/rejection
      const { error: approvalError } = await supabase
        .from('merge_approvals')
        .insert({
          merge_request_id: id,
          approver,
          action,
          comment
        })

      if (approvalError) {
        console.error('Failed to record approval:', approvalError)
      }

      let newStatus = mergeRequest.status
      let newApprovals = mergeRequest.approvals

      if (action === 'reject') {
        newStatus = 'closed'
      } else if (action === 'approve') {
        newApprovals = mergeRequest.approvals + 1
        if (newApprovals >= mergeRequest.required_approvals) {
          newStatus = 'merged'
        }
      }

      // Update merge request
      const { error: updateError } = await supabase
        .from('merge_requests')
        .update({
          status: newStatus,
          approvals: newApprovals,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Create notification
      const notificationTitle = action === 'approve' 
        ? newStatus === 'merged' 
          ? 'Merge request approved and merged'
          : 'Merge request approved'
        : 'Merge request rejected'

      await supabase
        .from('automation_notifications')
        .insert({
          type: 'merge_approval',
          title: notificationTitle,
          message: `"${mergeRequest.title}" has been ${action}ed by ${approver}`,
          recipient: mergeRequest.author,
          metadata: { 
            merge_request_id: id,
            action,
            approver,
            comment
          }
        })

      return NextResponse.json({
        success: true,
        message: `Merge request ${action}ed successfully`,
        data: {
          status: newStatus,
          approvals: newApprovals,
          action,
          approver
        }
      })

    } else {
      // Generic update
      const updates = { ...body }
      delete updates.id
      updates.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('merge_requests')
        .update(updates)
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Merge request updated successfully'
      })
    }

  } catch (error) {
    console.error('Merge request update error:', error)
    return NextResponse.json(
      { error: 'Failed to update merge request' },
      { status: 500 }
    )
  }
} 