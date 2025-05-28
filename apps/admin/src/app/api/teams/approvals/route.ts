import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data - gerçek implementasyonda veritabanından gelecek
    const approvals = [
      {
        id: '1',
        type: 'merge_request',
        title: 'Merge feature/teams-integration to main',
        description: 'Teams integration with approval workflow and notifications. This includes new components, API endpoints, and database schema changes.',
        requester: 'bahadirarda',
        approvers: ['tech-lead', 'senior-dev'],
        status: 'pending',
        createdAt: new Date().toISOString(),
        teamsMessageId: 'msg_123456',
        priority: 'high',
        estimatedTime: '2 hours'
      },
      {
        id: '2',
        type: 'deployment',
        title: 'Deploy to production environment',
        description: 'Deploy HRMS v2.1.0 with new Teams integration feature to production.',
        requester: 'devops-team',
        approvers: ['product-owner', 'tech-lead'],
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        teamsMessageId: 'msg_789012',
        priority: 'medium',
        estimatedTime: '30 minutes'
      },
      {
        id: '3',
        type: 'feature_flag',
        title: 'Enable Teams integration for all users',
        description: 'Rollout Teams integration feature flag to 100% of users.',
        requester: 'product-team',
        approvers: ['tech-lead'],
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 82800000).toISOString(),
        teamsMessageId: 'msg_345678',
        priority: 'low',
        estimatedTime: '5 minutes'
      }
    ]

    return NextResponse.json({ 
      success: true, 
      approvals 
    })
  } catch (error) {
    console.error('Teams approvals fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Teams approvals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type, 
      title, 
      description, 
      requester, 
      approvers, 
      priority = 'medium',
      estimatedTime,
      teamsConnectionId 
    } = body

    if (!type || !title || !description || !requester || !approvers) {
      return NextResponse.json(
        { success: false, error: 'Type, title, description, requester, and approvers are required' },
        { status: 400 }
      )
    }

    const approval = {
      id: Date.now().toString(),
      type,
      title,
      description,
      requester,
      approvers: Array.isArray(approvers) ? approvers : [approvers],
      status: 'pending',
      createdAt: new Date().toISOString(),
      priority,
      estimatedTime,
      teamsConnectionId,
      teamsMessageId: `msg_${Math.random().toString(36).substr(2, 9)}`
    }

    // Microsoft Teams'e onay mesajı gönderme simülasyonu
    // Gerçek implementasyonda burada Microsoft Graph API kullanılacak
    console.log('Creating Teams approval request:', approval)

    // Teams kanalına adaptive card gönderimi simülasyonu
    const teamsMessage = {
      type: 'AdaptiveCard',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              text: title,
              weight: 'Bolder',
              size: 'Medium'
            },
            {
              type: 'TextBlock',
              text: description,
              wrap: true
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Requester:', value: requester },
                { title: 'Priority:', value: priority },
                { title: 'Estimated Time:', value: estimatedTime || 'N/A' }
              ]
            }
          ],
          actions: [
            {
              type: 'Action.Http',
              title: 'Approve',
              method: 'POST',
              url: `/api/teams/approvals/${approval.id}/approve`,
              style: 'positive'
            },
            {
              type: 'Action.Http',
              title: 'Reject',
              method: 'POST',
              url: `/api/teams/approvals/${approval.id}/reject`,
              style: 'destructive'
            }
          ]
        }
      }]
    }

    console.log('Teams adaptive card:', JSON.stringify(teamsMessage, null, 2))

    return NextResponse.json({ 
      success: true, 
      approval,
      teamsMessage,
      message: 'Approval request sent to Teams successfully' 
    })
  } catch (error) {
    console.error('Teams approval creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create Teams approval request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, approver, comments } = body

    if (!id || !action || !approver) {
      return NextResponse.json(
        { success: false, error: 'Approval ID, action, and approver are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    const approval = {
      id,
      status: action === 'approve' ? 'approved' : 'rejected',
      approver,
      actionTime: new Date().toISOString(),
      comments
    }

    // Teams mesajını güncelleme simülasyonu
    console.log(`Approval ${id} ${action}d by ${approver}`, approval)

    // Teams kanalına sonuç mesajı gönderimi
    const resultMessage = `✅ Approval ${action}d by ${approver}${comments ? `\nComments: ${comments}` : ''}`
    console.log('Teams result message:', resultMessage)

    return NextResponse.json({ 
      success: true, 
      approval,
      message: `Approval ${action}d successfully` 
    })
  } catch (error) {
    console.error('Teams approval update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update approval status' },
      { status: 500 }
    )
  }
} 