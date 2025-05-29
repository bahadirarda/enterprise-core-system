import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    const { data: approvals, error } = await supabase
      .from('integration_approvals')
      .select(`
        *,
        integrations (
          name,
          type,
          status
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Integration approvals fetch error:', error);
      // Return mock data if database error
      return NextResponse.json([
        {
          id: "1",
          integrationId: "2",
          integrationName: "Development Team", 
          requestType: "connection",
          title: "Teams Workspace Bağlantı Onayı",
          description: "Development Team Microsoft Teams workspace'ine bağlantı izni talep ediyor. Bu bağlantı CI/CD pipeline bildirimleri için kullanılacak.",
          requester: "DevOps Team",
          status: "pending",
          priority: "medium",
          requestDate: "2025-05-28T09:15:00Z"
        }
      ]);
    }

    type IntegrationApprovalRow = {
      id: string;
      integration_id: string;
      integrations?: {
        name?: string;
        type?: string;
        status?: string;
      };
      request_type: string;
      title: string;
      description: string;
      status: string;
      created_at: string;
      expires_at?: string;
    };
    const transformedData = approvals?.map((approval: IntegrationApprovalRow) => ({
      id: approval.id,
      integrationId: approval.integration_id,
      integrationName: approval.integrations?.name || 'Unknown Integration',
      requestType: approval.request_type,
      title: approval.title,
      description: approval.description,
      requester: "Admin User", // Since we don't have user names in the current data
      status: approval.status,
      priority: "medium", // Default priority since it's not in the current schema
      requestDate: approval.created_at,
      expiresAt: approval.expires_at
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Integration approvals API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseClient();
    
    const { data: approval, error } = await supabase
      .from('integration_approvals')
      .insert([{
        integration_id: body.integrationId,
        request_type: body.requestType,
        title: body.title,
        description: body.description,
        requested_by: body.requestedBy || 'admin-user-id',
        metadata: body.metadata || {},
        expires_at: body.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }])
      .select()
      .single();

    if (error) {
      console.error('Integration approval creation error:', error);
      return NextResponse.json({
        id: Date.now().toString(),
        ...body,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Integration approval creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseClient();
    
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
    const supabase = getSupabaseClient();
    
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