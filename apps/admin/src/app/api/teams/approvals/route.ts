import { NextRequest, NextResponse } from 'next/server'

// Gerçek kullanıcı hiyerarşi sistemi
const USER_HIERARCHY = {
  'bahadirarda96@icloud.com': {
    name: 'Bahadir Arda',
    role: 'Software Engineer',
    level: 2,
    manager: 'senior-dev@company.com',
    team: 'Frontend Development',
    canApprove: ['feature_flag', 'minor_changes']
  },
  'senior-dev@company.com': {
    name: 'Senior Developer',
    role: 'Senior Software Engineer', 
    level: 3,
    manager: 'tech-lead@company.com',
    team: 'Frontend Development',
    canApprove: ['merge_request', 'feature_flag', 'minor_changes']
  },
  'tech-lead@company.com': {
    name: 'Tech Lead',
    role: 'Technical Lead',
    level: 4,
    manager: 'cto@company.com',
    team: 'Engineering',
    canApprove: ['merge_request', 'deployment', 'feature_flag', 'architecture_changes']
  },
  'cto@company.com': {
    name: 'CTO',
    role: 'Chief Technology Officer',
    level: 5,
    manager: null,
    team: 'Leadership',
    canApprove: ['deployment', 'security_changes', 'infrastructure']
  }
}

export async function GET() {
  try {
    // Gerçek approval data'sı
    const approvals = [
      {
        id: Date.now().toString(),
        type: 'merge_request',
        title: 'Enhance Teams Integration with User Hierarchy',
        description: 'Add real user hierarchy system and approval workflow to Teams integration. This includes role-based permissions and multi-level approval process.',
        requester: 'bahadirarda96@icloud.com',
        requesterName: 'Bahadir Arda',
        approvers: ['senior-dev@company.com', 'tech-lead@company.com'],
        approverNames: ['Senior Developer', 'Tech Lead'],
        status: 'pending',
        createdAt: new Date().toISOString(),
        teamsMessageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
        priority: 'high',
        estimatedTime: '1-2 hours',
        changedFiles: [
          'apps/admin/src/app/api/teams/approvals/route.ts',
          'apps/admin/src/components/TeamsIntegration.tsx'
        ],
        linesAdded: 45,
        linesRemoved: 8,
        branch: 'feature/enhance-teams-notifications',
        pullRequestNumber: 1
      },
      {
        id: (Date.now() - 3600000).toString(),
        type: 'feature_flag',
        title: 'Enable Advanced Teams Notifications',
        description: 'Enable advanced notification features for all users including rich cards and interactive buttons.',
        requester: 'bahadirarda96@icloud.com',
        requesterName: 'Bahadir Arda',
        approvers: ['tech-lead@company.com'],
        approverNames: ['Tech Lead'],
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        teamsMessageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
        priority: 'medium',
        estimatedTime: '30 minutes'
      }
    ]

    return NextResponse.json({ 
      success: true, 
      approvals,
      userHierarchy: USER_HIERARCHY
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
      requester = 'bahadirarda96@icloud.com',
      priority = 'medium',
      estimatedTime,
      teamsConnectionId,
      changedFiles = [],
      branch
    } = body

    if (!type || !title || !description) {
      return NextResponse.json(
        { success: false, error: 'Type, title, and description are required' },
        { status: 400 }
      )
    }

    // Hiyerarşik onay sistemi - kim onaylamalı?
    const requesterInfo = USER_HIERARCHY[requester as keyof typeof USER_HIERARCHY]
    let approvers: string[] = []
    
    if (!requesterInfo) {
      return NextResponse.json(
        { success: false, error: 'Requester not found in hierarchy' },
        { status: 400 }
      )
    }

    // Onay kuralları
    switch (type) {
      case 'merge_request':
        // Manager + Tech Lead onayı gerekli
        if (requesterInfo.manager) {
          approvers.push(requesterInfo.manager)
        }
        if (!approvers.includes('tech-lead@company.com')) {
          approvers.push('tech-lead@company.com')
        }
        break
        
      case 'deployment':
        // Tech Lead + CTO onayı gerekli
        approvers = ['tech-lead@company.com', 'cto@company.com']
        break
        
      case 'feature_flag':
        // Manager onayı yeterli
        if (requesterInfo.manager) {
          approvers.push(requesterInfo.manager)
        }
        break
    }

    const approval = {
      id: Date.now().toString(),
      type,
      title,
      description,
      requester,
      requesterName: requesterInfo.name,
      approvers,
      approverNames: approvers.map(email => USER_HIERARCHY[email as keyof typeof USER_HIERARCHY]?.name || email),
      status: 'pending',
      createdAt: new Date().toISOString(),
      priority,
      estimatedTime,
      teamsConnectionId,
      teamsMessageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
      changedFiles,
      branch
    }

    // Teams adaptive card oluştur
    const teamsMessage = {
      type: 'AdaptiveCard',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'Container',
              items: [
                {
                  type: 'TextBlock',
                  text: `🔔 ${title}`,
                  weight: 'Bolder',
                  size: 'Medium',
                  color: priority === 'high' ? 'Attention' : 'Default'
                },
                {
                  type: 'TextBlock',
                  text: description,
                  wrap: true,
                  spacing: 'Medium'
                }
              ]
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Requester:', value: `${requesterInfo.name} (${requesterInfo.role})` },
                { title: 'Priority:', value: priority.toUpperCase() },
                { title: 'Estimated Time:', value: estimatedTime || 'N/A' },
                { title: 'Required Approvers:', value: approval.approverNames.join(', ') },
                { title: 'Branch:', value: branch || 'N/A' }
              ]
            }
          ],
          actions: [
            {
              type: 'Action.Http',
              title: '✅ Approve',
              method: 'POST',
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'}/api/teams/approvals/${approval.id}/approve`,
              style: 'positive'
            },
            {
              type: 'Action.Http',
              title: '❌ Reject',
              method: 'POST', 
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'}/api/teams/approvals/${approval.id}/reject`,
              style: 'destructive'
            },
            {
              type: 'Action.OpenUrl',
              title: '📋 View Details',
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'}/?tab=teams-integration`
            }
          ]
        }
      }]
    }

    console.log('📋 New approval request created:', {
      id: approval.id,
      requester: approval.requesterName,
      approvers: approval.approverNames,
      type: approval.type
    })

    return NextResponse.json({ 
      success: true, 
      approval,
      teamsMessage,
      message: `Approval request sent to Teams. Required approvers: ${approval.approverNames.join(', ')}` 
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

    // Onaylayan kişinin yetkisini kontrol et
    const approverInfo = USER_HIERARCHY[approver as keyof typeof USER_HIERARCHY]
    if (!approverInfo) {
      return NextResponse.json(
        { success: false, error: 'Approver not found in hierarchy' },
        { status: 403 }
      )
    }

    const approval = {
      id,
      status: action === 'approve' ? 'approved' : 'rejected',
      approver,
      approverName: approverInfo.name,
      approverRole: approverInfo.role,
      actionTime: new Date().toISOString(),
      comments
    }

    console.log(`🎯 Approval ${action}d:`, {
      id,
      approver: approverInfo.name,
      role: approverInfo.role,
      action
    })

    // Teams kanalına sonuç mesajı
    const resultMessage = `${action === 'approve' ? '✅' : '❌'} **${approverInfo.name}** (${approverInfo.role}) ${action}d the request${comments ? `\n💬 Comments: ${comments}` : ''}`

    return NextResponse.json({ 
      success: true, 
      approval,
      resultMessage,
      message: `Request ${action}d by ${approverInfo.name}` 
    })
  } catch (error) {
    console.error('Teams approval update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update approval status' },
      { status: 500 }
    )
  }
} 