import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    // Fetch integration approvals with integration details
    const { data: approvals, error } = await supabase
      .from('integration_approvals')
      .select(`
        *,
        integrations:integration_id (
          id,
          name,
          type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Transform data to match expected format
    const transformedApprovals = approvals?.map(approval => ({
      id: approval.id,
      integrationId: approval.integration_id,
      integrationName: approval.integrations?.name || 'Unknown Integration',
      integrationType: approval.integrations?.type || 'unknown',
      requestType: approval.request_type,
      title: approval.title,
      description: approval.description,
      requestedBy: approval.requested_by,
      approvedBy: approval.approved_by,
      status: approval.status,
      timestamp: approval.created_at,
      reviewedAt: approval.reviewed_at,
      expiresAt: approval.expires_at,
      metadata: approval.metadata || {},
      priority: approval.metadata?.priority || 'medium'
    }));

    return NextResponse.json({
      success: true,
      data: transformedApprovals || []
    });

  } catch (error) {
    console.error('Integration approvals API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch approvals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    const body = await request.json();

    const { data: approval, error } = await supabase
      .from('integration_approvals')
      .insert([{
        integration_id: body.integration_id,
        request_type: body.request_type,
        title: body.title,
        description: body.description,
        requested_by: body.requested_by,
        status: 'pending',
        metadata: body.metadata || {},
        expires_at: body.expires_at
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: approval
    });

  } catch (error) {
    console.error('Create approval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create approval',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getServerSupabaseClient();
    
    console.log('🎯 Approval updated:', {
      id: body.id,
      approver: body.approved_by || 'System Admin',
      action: body.status
    });
    
    const { data: approval, error } = await supabase
      .from('integration_approvals')
      .update({
        status: body.status,
        approved_by: body.approved_by,
        reviewed_at: new Date().toISOString(),
        metadata: { ...body.metadata, reviewer_notes: body.reviewer_notes }
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Integration approval update error:', error);
      return NextResponse.json({ 
        ...body, 
        reviewed_at: new Date().toISOString() 
      });
    }

    // If approved, update related integration status
    if (body.status === 'approved' && approval.integration_id) {
      await supabase
        .from('integrations')
        .update({ 
          status: 'active',
          approved_by: body.approved_by,
          approved_at: new Date().toISOString()
        })
        .eq('id', approval.integration_id);
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Integration approval update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body; // action: 'approve' or 'reject'
    const supabase = getServerSupabaseClient();
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    console.log('🎯 Approval action:', {
      id: id,
      action: action,
      status: status
    });
    
    const { data: approval, error } = await supabase
      .from('integration_approvals')
      .update({
        status: status,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Integration approval update error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 });
    }

    // If approved, update related integration status
    if (status === 'approved' && approval.integration_id) {
      await supabase
        .from('integrations')
        .update({ 
          status: 'active',
          approved_at: new Date().toISOString()
        })
        .eq('id', approval.integration_id);
    }

    return NextResponse.json({ success: true, data: approval });
  } catch (error) {
    console.error('Integration approval PATCH API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 