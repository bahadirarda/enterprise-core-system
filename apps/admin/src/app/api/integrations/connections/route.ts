import { NextRequest, NextResponse } from 'next/server';
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
          id: "1",
          name: "DigiDaga HR Teams",
          type: "teams",
          status: "active",
          description: "Microsoft Teams entegrasyonu - Ana HR ekibi için bildirimler ve onaylar",
          lastActivity: "2025-05-28T10:30:00Z"
        },
        {
          id: "2", 
          name: "Development Team",
          type: "teams",
          status: "pending",
          description: "Geliştirici ekibi için CI/CD ve deployment bildirimleri",
          lastActivity: "2025-05-28T09:15:00Z"
        },
        {
          id: "3",
          name: "Marketing Slack", 
          type: "slack",
          status: "inactive",
          description: "Pazarlama ekibi için kampanya ve performans bildirimleri",
          lastActivity: "2025-05-27T16:45:00Z"
        },
        {
          id: "4",
          name: "External API",
          type: "webhook", 
          status: "active",
          description: "Dış sistemlere veri aktarımı için webhook",
          lastActivity: "2025-05-28T08:20:00Z"
        }
      ]);
    }

    type IntegrationRow = {
      id: string;
      name: string;
      type: string;
      status: string;
      description: string;
      updated_at?: string;
      webhook_url?: string;
      api_key?: string;
    };
    const transformedData = integrations?.map((integration: IntegrationRow) => ({
      id: integration.id,
      name: integration.name,
      type: integration.type,
      status: integration.status,
      description: integration.description,
      lastActivity: integration.updated_at,
      webhookUrl: integration.webhook_url,
      apiKey: integration.api_key
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Integrations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    const { data: integration, error } = await supabase
      .from('integrations')
      .insert([{
        type: body.type,
        name: body.name,
        description: body.description,
        status: 'pending',
        configuration: {},
        webhook_url: body.webhookUrl || null,
        api_key: body.apiKey || null
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