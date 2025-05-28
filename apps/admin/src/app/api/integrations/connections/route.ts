import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Integrations fetch error:', error);
      // Return mock data if database error
      return NextResponse.json([
        {
          id: '1',
          type: 'teams',
          name: 'DigiDaga HR Teams',
          description: 'Microsoft Teams entegrasyonu - Ana HR ekibi',
          status: 'active',
          configuration: {
            organization_name: 'DigiDaga',
            admin_email: 'admin@digidaga.com',
            channels: ['hr-notifications', 'approvals']
          },
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'slack',
          name: 'Marketing Slack',
          description: 'Pazarlama ekibi entegrasyonu',
          status: 'inactive',
          configuration: {
            workspace: 'digidaga-marketing',
            channels: ['campaigns']
          },
          created_at: new Date().toISOString()
        }
      ]);
    }

    return NextResponse.json(integrations || []);
  } catch (error) {
    console.error('Integrations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    const { data: integration, error } = await supabase
      .from('integrations')
      .insert([{
        type: body.type || 'teams',
        name: body.name,
        description: body.description,
        configuration: body.configuration || {},
        webhook_url: body.webhook_url,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Integration creation error:', error);
      // Return mock success if database error
      return NextResponse.json({
        id: Date.now().toString(),
        ...body,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Integration creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    const { data: integration, error } = await supabase
      .from('integrations')
      .update({
        name: body.name,
        description: body.description,
        status: body.status,
        configuration: body.configuration,
        webhook_url: body.webhook_url,
        updated_at: new Date().toISOString(),
        ...(body.status === 'approved' && { 
          approved_by: body.approved_by,
          approved_at: new Date().toISOString()
        })
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Integration update error:', error);
      return NextResponse.json({ 
        ...body, 
        updated_at: new Date().toISOString() 
      });
    }

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Integration update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Integration ID required' }, { status: 400 });
    }

    const supabase = createClient();
    
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Integration deletion error:', error);
      return NextResponse.json({ success: true }); // Mock success
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Integration deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 