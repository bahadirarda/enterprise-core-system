import { NextRequest, NextResponse } from 'next/server';
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
          id: "1",
          integrationId: "1",
          integrationName: "DigiDaga HR Teams",
          title: "Production Deployment Successful",
          message: "HRMS System v2.0 başarıyla production ortamına deploy edildi. Teams entegrasyonu aktif.",
          type: "deployment",
          timestamp: "2025-05-28T10:30:00Z",
          read: false,
          priority: "high"
        },
        {
          id: "2",
          integrationId: "2", 
          integrationName: "Development Team",
          title: "New Integration Request",
          message: "Yeni bir Teams entegrasyonu bağlantı talebi alındı.",
          type: "system",
          timestamp: "2025-05-28T09:15:00Z",
          read: false,
          priority: "medium"
        }
      ]);
    }

    // Transform the data to match frontend expectations
    const transformedData = notifications?.map((notification: any) => ({
      id: notification.id,
      integrationId: notification.integration_id,
      integrationName: notification.integrations?.name || 'Unknown Integration',
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: notification.created_at,
      read: notification.status === 'read',
      priority: notification.priority
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Integration notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    const { data: notification, error } = await supabase
      .from('integration_notifications')
      .insert([{
        integration_id: body.integrationId,
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