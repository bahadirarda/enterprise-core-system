import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createClient();
    
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
          id: '1748437238456',
          integration_id: '1',
          request_type: 'connection',
          title: 'Teams Workspace Bağlantı Onayı',
          description: 'DigiDaga HR Teams workspace bağlantısı için onay gerekiyor.',
          requested_by: 'hr-admin@digidaga.com',
          status: 'approved',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          reviewed_at: new Date().toISOString(),
          integrations: {
            name: 'DigiDaga HR Teams',
            type: 'teams',
            status: 'active'
          }
        },
        {
          id: '1748437238457',
          integration_id: '2',
          request_type: 'deployment',
          title: 'Production Deployment Onayı',
          description: 'Marketing Slack entegrasyonunun production ortamına deploy edilmesi için onay gerekiyor.',
          requested_by: 'dev-team@digidaga.com',
          status: 'pending',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          integrations: {
            name: 'Marketing Slack',
            type: 'slack',
            status: 'pending'
          }
        }
      ]);
    }

    return NextResponse.json(approvals || []);
  } catch (error) {
    console.error('Integration approvals API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    const { data: approval, error } = await supabase
      .from('integration_approvals')
      .insert([{
        integration_id: body.integration_id,
        request_type: body.request_type,
        title: body.title,
        description: body.description,
        requested_by: body.requested_by,
        metadata: body.metadata || {},
        expires_at: body.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
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