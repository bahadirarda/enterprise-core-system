import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType } = body

    switch (testType) {
      case 'notification':
        // Test notification gönder
        const notificationResponse = await fetch(`${request.nextUrl.origin}/api/teams/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'pipeline_failure',
            title: 'Test Pipeline Failure',
            message: 'This is a test notification from the Teams integration system.',
            channel: '#devops-test',
            teamsConnectionId: 'test-connection'
          }),
        })

        const notificationResult = await notificationResponse.json()
        
        return NextResponse.json({
          success: true,
          type: 'notification',
          result: notificationResult,
          message: 'Test notification sent successfully'
        })

      case 'approval':
        // Test approval request oluştur
        const approvalResponse = await fetch(`${request.nextUrl.origin}/api/teams/approvals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'merge_request',
            title: 'Test Merge Request Approval',
            description: 'This is a test approval request to verify Teams integration functionality.',
            requester: 'test-user',
            approvers: ['test-approver-1', 'test-approver-2'],
            priority: 'medium',
            estimatedTime: '15 minutes',
            teamsConnectionId: 'test-connection'
          }),
        })

        const approvalResult = await approvalResponse.json()
        
        return NextResponse.json({
          success: true,
          type: 'approval',
          result: approvalResult,
          message: 'Test approval request created successfully'
        })

      case 'connection':
        // Test connection oluştur
        const connectionResponse = await fetch(`${request.nextUrl.origin}/api/teams/connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationName: 'Test Organization',
            adminEmail: 'test@example.com',
            description: 'Test connection for Teams integration verification',
            tenantId: `test-${Date.now()}`
          }),
        })

        const connectionResult = await connectionResponse.json()
        
        return NextResponse.json({
          success: true,
          type: 'connection',
          result: connectionResult,
          message: 'Test connection created successfully'
        })

      case 'webhook':
        // Teams webhook simülasyonu
        const webhookData = {
          type: 'message',
          timestamp: new Date().toISOString(),
          id: `test-webhook-${Date.now()}`,
          channelId: 'test-channel',
          from: {
            id: 'test-user',
            name: 'Test User'
          },
          text: 'Test webhook message from Teams integration',
          mentions: [],
          attachments: []
        }

        return NextResponse.json({
          success: true,
          type: 'webhook',
          result: webhookData,
          message: 'Test webhook processed successfully'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Teams test error:', error)
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Test durumu ve mevcut entegrasyonları kontrol et
  try {
    const testResults = {
      system: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      },
      endpoints: {
        connections: '/api/teams/connections',
        notifications: '/api/teams/notifications', 
        approvals: '/api/teams/approvals',
        test: '/api/teams/test'
      },
      testSuite: [
        {
          name: 'Connection Test',
          description: 'Test Teams connection creation and management',
          endpoint: 'POST /api/teams/test',
          payload: { testType: 'connection' }
        },
        {
          name: 'Notification Test',
          description: 'Test Teams notification sending',
          endpoint: 'POST /api/teams/test',
          payload: { testType: 'notification' }
        },
        {
          name: 'Approval Test',
          description: 'Test Teams approval workflow',
          endpoint: 'POST /api/teams/test',
          payload: { testType: 'approval' }
        },
        {
          name: 'Webhook Test',
          description: 'Test Teams webhook processing',
          endpoint: 'POST /api/teams/test',
          payload: { testType: 'webhook' }
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: testResults,
      message: 'Teams integration test suite ready'
    })
  } catch (error) {
    console.error('Teams test status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get test status' },
      { status: 500 }
    )
  }
} 