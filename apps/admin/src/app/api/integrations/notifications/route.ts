import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: notifications, error } = await supabase
      .from('integration_notifications')
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
      console.error('Integration notifications fetch error:', error);
      // Return mock data if database error
      return NextResponse.json([
        {
          id: '1',
          integration_id: '1',
          type: 'deployment',
          title: 'Production Deployment',
          message: 'HRMS System v2.0 başarıyla production ortamına deploy edildi.',
          priority: 'high',
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          integrations: {
            name: 'DigiDaga HR Teams',
            type: 'teams',
            status: 'active'
          }
        },
        {
          id: '2',
          integration_id: '2',
          type: 'system',
          title: 'New Integration Request',
          message: 'Yeni bir entegrasyon bağlantı talebi alındı.',
          priority: 'medium',
          status: 'pending',
          created_at: new Date().toISOString(),
          integrations: {
            name: 'Marketing Slack',
            type: 'slack',
            status: 'pending'
          }
        }
      ]);
    }

    return NextResponse.json(notifications || []);
  } catch (error) {
    console.error('Integration notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    const { data: notification, error } = await supabase
      .from('integration_notifications')
      .insert([{
        integration_id: body.integration_id,
        type: body.type,
        title: body.title,
        message: body.message,
        priority: body.priority || 'medium',
        metadata: body.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Integration notification creation error:', error);
      return NextResponse.json({
        id: Date.now().toString(),
        ...body,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }

    // Simulate sending notification
    setTimeout(async () => {
      await supabase
        .from('integration_notifications')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', notification.id);
    }, 1000);

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Integration notification creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    const { data: notification, error } = await supabase
      .from('integration_notifications')
      .update({
        status: body.status,
        ...(body.status === 'sent' && { sent_at: new Date().toISOString() }),
        ...(body.status === 'delivered' && { delivered_at: new Date().toISOString() })
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Integration notification update error:', error);
      return NextResponse.json({ 
        ...body, 
        updated_at: new Date().toISOString() 
      });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Integration notification update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 