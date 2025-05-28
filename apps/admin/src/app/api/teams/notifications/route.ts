import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data - gerçek implementasyonda veritabanından gelecek
    const notifications = [
      {
        id: '1',
        type: 'merge_request',
        title: 'New merge request requires approval',
        message: 'Feature/teams-integration needs review by development team',
        channel: '#development',
        sentAt: new Date(Date.now() - 1800000).toISOString(),
        status: 'sent'
      },
      {
        id: '2', 
        type: 'pipeline_failure',
        title: 'Pipeline failed',
        message: 'Build failed on feature/admin-automation branch',
        channel: '#devops',
        sentAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'sent'
      },
      {
        id: '3',
        type: 'deployment',
        title: 'Deployment completed',
        message: 'Production deployment successful for HRMS v2.1.0',
        channel: '#deployment',
        sentAt: new Date(Date.now() - 7200000).toISOString(),
        status: 'sent'
      }
    ]

    return NextResponse.json({ 
      success: true, 
      notifications 
    })
  } catch (error) {
    console.error('Teams notifications fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Teams notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, channel, teamsConnectionId } = body

    if (!type || !title || !message || !channel) {
      return NextResponse.json(
        { success: false, error: 'Type, title, message, and channel are required' },
        { status: 400 }
      )
    }

    // Microsoft Teams'e mesaj gönderme simülasyonu
    // Gerçek implementasyonda burada Microsoft Graph API kullanılacak
    
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      channel,
      sentAt: new Date().toISOString(),
      status: 'sent',
      teamsConnectionId
    }

    // Webhook ile Teams'e gönderim simülasyonu
    console.log('Sending Teams notification:', notification)

    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Notification sent to Teams successfully' 
    })
  } catch (error) {
    console.error('Teams notification send error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send Teams notification' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Notification ID and status are required' },
        { status: 400 }
      )
    }

    // Bildirim durumunu güncelleme simülasyonu
    console.log(`Updating notification ${id} status to ${status}`)

    return NextResponse.json({ 
      success: true,
      message: 'Notification status updated successfully' 
    })
  } catch (error) {
    console.error('Teams notification update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification status' },
      { status: 500 }
    )
  }
} 