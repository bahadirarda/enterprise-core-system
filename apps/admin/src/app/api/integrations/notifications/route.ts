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

    // Fetch integration notifications with integration details
    const { data: notifications, error } = await supabase
      .from('integration_notifications')
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
    const transformedNotifications = notifications?.map(notification => ({
      id: notification.id,
      integrationId: notification.integration_id,
      integrationName: notification.integrations?.name || 'Unknown Integration',
      integrationType: notification.integrations?.type || 'unknown',
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      status: notification.status,
      timestamp: notification.created_at,
      sentAt: notification.sent_at,
      deliveredAt: notification.delivered_at,
      metadata: notification.metadata || {},
      read: notification.status === 'read'
    }));

    return NextResponse.json({
      success: true,
      data: transformedNotifications || []
    });

  } catch (error) {
    console.error('Integration notifications API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notifications',
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

    const { data: notification, error } = await supabase
      .from('integration_notifications')
      .insert([{
        integration_id: body.integration_id,
        type: body.type,
        title: body.title,
        message: body.message,
        priority: body.priority || 'medium',
        status: 'pending',
        metadata: body.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = getServerSupabaseClient();
    
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