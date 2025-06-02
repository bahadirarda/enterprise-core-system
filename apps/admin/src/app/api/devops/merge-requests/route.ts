import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // open, merged, closed
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('merge_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: mergeRequests, error } = await query;

    if (error) {
      console.error('Error fetching merge requests:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch merge requests'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      merge_requests: mergeRequests || [],
      count: mergeRequests?.length || 0,
      source: 'database'
    });

  } catch (error) {
    console.error('Merge requests fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch merge requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      author,
      source_branch,
      target_branch,
      external_id
    } = body;

    if (!title || !author || !source_branch || !target_branch) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, author, source_branch, target_branch'
      }, { status: 400 });
    }

    const { data: mergeRequest, error } = await supabase
      .from('merge_requests')
      .insert([
        {
          external_id,
          title,
          description,
          author,
          source_branch,
          target_branch,
          status: 'open',
          approvals: 0,
          required_approvals: 1,
          conflicts: false,
          pipeline_status: 'pending',
          additions: 0,
          deletions: 0,
          files_changed: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating merge request:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create merge request'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      merge_request: mergeRequest,
      message: 'Merge request created successfully'
    });

  } catch (error) {
    console.error('Merge request creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create merge request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvals } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing merge request ID'
      }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (approvals !== undefined) updateData.approvals = approvals;

    const { data: mergeRequest, error } = await supabase
      .from('merge_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating merge request:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update merge request'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      merge_request: mergeRequest,
      message: 'Merge request updated successfully'
    });

  } catch (error) {
    console.error('Merge request update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update merge request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 