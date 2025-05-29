'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  Shield,
  Bell,
  Link,
  Unlink,
  RefreshCw
} from 'lucide-react'

interface TeamsConnection {
  id: string
  name: string
  tenantId: string
  status: 'connected' | 'pending' | 'failed' | 'disconnected'
  connectedAt?: string
  lastSync?: string
  channelCount: number
  memberCount: number
  permissions: string[]
}

interface TeamsNotification {
  id: string
  type: 'merge_request' | 'pipeline_failure' | 'deployment' | 'approval_needed'
  title: string
  message: string
  channel: string
  sentAt: string
  status: 'sent' | 'failed' | 'pending'
}

interface TeamsApproval {
  id: string
  type: 'merge_request' | 'deployment' | 'feature_flag'
  title: string
  description: string
  requester: string
  requesterName?: string
  approvers: string[]
  approverNames?: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  teamsMessageId?: string
  priority?: string
  estimatedTime?: string
  changedFiles?: string[]
  branch?: string
  pullRequestNumber?: number
  linesAdded?: number
  linesRemoved?: number
}

// User hierarchy için interface
interface UserHierarchy {
  [email: string]: {
    name: string
    role: string
    level: number
    manager: string | null
    team: string
    canApprove: string[]
  }
}

export default function TeamsIntegration() {
  const [connections, setConnections] = useState<TeamsConnection[]>([])
  const [notifications, setNotifications] = useState<TeamsNotification[]>([])
  const [approvals, setApprovals] = useState<TeamsApproval[]>([])
  const [userHierarchy, setUserHierarchy] = useState<UserHierarchy>({})
  const [activeTab, setActiveTab] = useState<'connections' | 'notifications' | 'approvals' | 'settings'>('approvals')
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectForm, setConnectForm] = useState({
    organizationName: '',
    adminEmail: '',
    description: '',
    channels: [] as string[]
  })
  const [teamsEnabled, setTeamsEnabled] = useState(true)

  useEffect(() => {
    loadTeamsData()
    fetch('/api/integrations')
      .then(r => r.json())
      .then(d => setTeamsEnabled(d.integrations?.teams ?? true))
  }, [])

  const loadTeamsData = async () => {
    setIsLoading(true)
    try {
      // Gerçek API çağrıları
      const [connectionsRes, notificationsRes, approvalsRes] = await Promise.all([
        fetch('/api/teams/connections'),
        fetch('/api/teams/notifications'),
        fetch('/api/teams/approvals')
      ])

      const connectionsData = await connectionsRes.json()
      const notificationsData = await notificationsRes.json()
      const approvalsData = await approvalsRes.json()

      if (connectionsData.success) {
        // API'den gelen veriyi frontend formatına dönüştür
        const formattedConnections = connectionsData.connections.map((conn: Record<string, unknown>) => ({
          id: conn.id,
          name: conn.name,
          tenantId: conn.tenant_id,
          status: conn.status,
          connectedAt: conn.connected_at,
          lastSync: conn.last_sync || conn.connected_at,
          channelCount: conn.channel_count || 0,
          memberCount: conn.member_count || 0,
          permissions: conn.permissions || []
        }))
        setConnections(formattedConnections)
      }

      if (notificationsData.success) {
        setNotifications(notificationsData.notifications)
      }

      if (approvalsData.success) {
        setApprovals(approvalsData.approvals)
        if (approvalsData.userHierarchy) {
          setUserHierarchy(approvalsData.userHierarchy)
        }
      }
    } catch (error) {
      console.error('Failed to load Teams data:', error)
      // Show real data instead of fallback
      alert('Could not connect to Teams API. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!connectForm.organizationName || !connectForm.adminEmail) {
      alert('Lütfen gerekli alanları doldurun')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/teams/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationName: connectForm.organizationName,
          adminEmail: connectForm.adminEmail,
          description: connectForm.description,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Bağlantıyı listeye ekle
        const newConnection: TeamsConnection = {
          id: result.connection.id,
          name: result.connection.name,
          tenantId: result.connection.tenant_id,
          status: result.connection.status,
          connectedAt: result.connection.connected_at,
          lastSync: result.connection.last_sync,
          channelCount: result.connection.channel_count || 0,
          memberCount: result.connection.member_count || 0,
          permissions: result.connection.permissions || []
        }

        setConnections(prev => [...prev, newConnection])
        setShowConnectModal(false)
        setConnectForm({
          organizationName: '',
          adminEmail: '',
          description: '',
          channels: []
        })

        alert(result.message || 'Teams bağlantısı başarıyla oluşturuldu!')

        // Simulate approval process - gerçek durumda Microsoft'dan gelecek
        setTimeout(() => {
          setConnections(prev => 
            prev.map(conn => 
              conn.id === newConnection.id 
                ? { 
                    ...conn, 
                    status: 'connected' as const, 
                    connectedAt: new Date().toISOString(),
                    channelCount: Math.floor(Math.random() * 10) + 1,
                    memberCount: Math.floor(Math.random() * 50) + 5,
                    permissions: ['read_messages', 'send_messages', 'manage_webhooks']
                  }
                : conn
            )
          )
        }, 3000)
      } else {
        alert(result.error || 'Bağlantı oluşturulamadı')
      }
    } catch (error) {
      console.error('Connection failed:', error)
      alert('Bağlantı başarısız')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Bu Teams bağlantısını kaldırmak istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/teams/connections?id=${connectionId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setConnections(prev => 
          prev.map(conn => 
            conn.id === connectionId 
              ? { ...conn, status: 'disconnected' as const }
              : conn
          )
        )
        alert(result.message || 'Teams bağlantısı başarıyla kaldırıldı')
      } else {
        alert(result.error || 'Bağlantı kaldırılamadı')
      }
    } catch (error) {
      console.error('Disconnect failed:', error)
      alert('Bağlantı kaldırma işlemi başarısız')
    }
  }

  const handleApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    // Gerçek kullanıcı email'ini al (normalde authentication'dan gelecek)
    const currentUserEmail = 'senior-dev@company.com' // Bu gerçek uygulamada auth'dan gelecek
    
    try {
      const response = await fetch('/api/teams/approvals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: approvalId,
          action,
          approver: currentUserEmail,
          comments: action === 'reject' ? 'Need more testing before merge' : 'Code looks good, approved!'
        }),
      })

      const result = await response.json()

      if (result.success) {
        setApprovals(prev => 
          prev.map(approval => 
            approval.id === approvalId 
              ? { ...approval, status: action === 'approve' ? 'approved' : 'rejected' }
              : approval
          )
        )
        
        alert(`✅ ${result.message}`)
        
        // Sayfayı yenile ki güncel durumu görelim
        setTimeout(() => {
          loadTeamsData()
        }, 1000)
      } else {
        alert(`❌ ${result.error || 'İşlem başarısız'}`)
      }
    } catch (error) {
      console.error('Approval action failed:', error)
      alert('❌ İşlem başarısız - Network hatası')
    }
  }

  const triggerRealApprovalTest = async () => {
    try {
      const response = await fetch('/api/teams/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'merge_request',
          title: 'Real PR: Enhance Teams Integration UI',
          description: 'Add real-time approval tracking and user hierarchy display to admin panel. This change improves the user experience and shows actual approval workflow.',
          requester: 'bahadirarda96@icloud.com',
          priority: 'high',
          estimatedTime: '1 hour',
          changedFiles: [
            'apps/admin/src/components/TeamsIntegration.tsx'
          ],
          branch: 'feature/enhance-teams-notifications'
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`🚀 Real approval request created! Required approvers: ${result.approval.approverNames.join(', ')}`)
        loadTeamsData() // Reload to show new approval
      } else {
        alert(`❌ Failed to create approval: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to create approval:', error)
      alert('❌ Failed to create approval')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'sent':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'disconnected':
        return <Unlink className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'sent':
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'failed':
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'disconnected':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const toggleTeams = async () => {
    const newVal = !teamsEnabled
    setTeamsEnabled(newVal)
    await fetch('/api/integrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integration: 'teams', enabled: newVal })
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Microsoft Teams Entegrasyonu</h2>
            <p className="text-gray-600">DevOps süreçlerinizi Teams ile entegre edin</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadTeamsData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>
          
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Teams Bağla</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'connections', label: 'Bağlantılar', icon: Link, count: connections.filter(c => c.status === 'connected').length },
            { id: 'notifications', label: 'Bildirimler', icon: Bell, count: notifications.filter(n => n.status === 'sent').length },
            { id: 'approvals', label: 'Onaylar', icon: Shield, count: approvals.filter(a => a.status === 'pending').length },
            { id: 'settings', label: 'Ayarlar', icon: Settings, count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'connections' | 'notifications' | 'approvals' | 'settings')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(connection.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{connection.name}</h3>
                      <p className="text-sm text-gray-600">Tenant ID: {connection.tenantId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </span>
                    
                    {connection.status === 'connected' && (
                      <button
                        onClick={() => handleDisconnect(connection.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {connection.status === 'connected' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{connection.channelCount}</p>
                      <p className="text-xs text-gray-600">Kanal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{connection.memberCount}</p>
                      <p className="text-xs text-gray-600">Üye</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Bağlandı</p>
                      <p className="text-sm font-medium">{new Date(connection.connectedAt!).toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Son Senkronizasyon</p>
                      <p className="text-sm font-medium">{new Date(connection.lastSync!).toLocaleTimeString()}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(notification.status)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>#{notification.channel}</span>
                        <span>{new Date(notification.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(notification.status)}`}>
                    {notification.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approvals Tab - Enhanced with real data */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">🧪 Test Real Approval Workflow</h3>
                  <p className="text-sm text-blue-700 mt-1">Create a real approval request with your user hierarchy</p>
                </div>
                <button
                  onClick={triggerRealApprovalTest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  🚀 Create Test Approval
                </button>
              </div>
            </div>

            {approvals.map((approval) => (
              <div key={approval.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{approval.title}</h3>
                      {approval.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          approval.priority === 'high' ? 'bg-red-100 text-red-800' :
                          approval.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {approval.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{approval.description}</p>
                    
                    {/* Real User Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500">REQUESTER</p>
                        <p className="text-sm font-medium text-gray-900">
                          {approval.requesterName || userHierarchy[approval.requester]?.name || approval.requester}
                        </p>
                        <p className="text-xs text-gray-600">
                          {userHierarchy[approval.requester]?.role} • {userHierarchy[approval.requester]?.team}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500">REQUIRED APPROVERS</p>
                        <div className="space-y-1">
                          {approval.approverNames?.map((name, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{name}</span>
                              <span className="text-xs text-gray-500">
                                {userHierarchy[approval.approvers[index]]?.role}
                              </span>
                            </div>
                          )) || approval.approvers.map((email, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {userHierarchy[email]?.name || email}
                              </span>
                              <span className="text-xs text-gray-500">{userHierarchy[email]?.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <span>📅 {new Date(approval.createdAt).toLocaleString()}</span>
                      {approval.estimatedTime && <span>⏱️ {approval.estimatedTime}</span>}
                      {approval.branch && <span>🌿 {approval.branch}</span>}
                    </div>

                    {/* Changed Files */}
                    {approval.changedFiles && approval.changedFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">CHANGED FILES</p>
                        <div className="flex flex-wrap gap-1">
                          {approval.changedFiles.map((file, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {file.split('/').pop()}
                            </span>
                          ))}
                        </div>
                        {approval.linesAdded !== undefined && approval.linesRemoved !== undefined && (
                          <div className="flex space-x-3 mt-2 text-xs">
                            <span className="text-green-600">+{approval.linesAdded} additions</span>
                            <span className="text-red-600">-{approval.linesRemoved} deletions</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(approval.status)}`}>
                      {approval.status}
                    </span>
                  </div>
                </div>
                
                {approval.status === 'pending' && (
                  <div className="bg-gray-50 rounded-lg p-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      💼 You are signed in as: <span className="text-blue-600">Senior Developer</span>
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      As a Senior Developer, you can approve merge requests and feature flags.
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApproval(approval.id, 'reject')}
                        className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        ❌ Reject
                      </button>
                      <button
                        onClick={() => handleApproval(approval.id, 'approve')}
                        className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                      >
                        ✅ Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {approvals.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500">No approval requests found.</p>
                <button
                  onClick={triggerRealApprovalTest}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Test Approval
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Entegrasyon Ayarları</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Microsoft Teams Entegrasyonu</span>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-2 text-xs text-gray-500">{teamsEnabled ? 'Açık' : 'Kapalı'}</span>
                  <input type="checkbox" className="sr-only" checked={teamsEnabled} onChange={toggleTeams} />
                  <div className={`w-11 h-6 rounded-full ${teamsEnabled ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${teamsEnabled ? 'translate-x-5' : ''}`}></span>
                  </div>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-gray-700">Merge request bildirimleri</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-gray-700">Pipeline hata bildirimleri</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">Deployment bildirimleri</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-gray-700">Onay gerektiren işlemler</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Ayarları Kaydet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Teams Bağlantısı Ekle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organizasyon Adı *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={connectForm.organizationName}
                  onChange={(e) => setConnectForm(prev => ({ ...prev, organizationName: e.target.value }))}
                  placeholder="Şirket adınız"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin E-posta *
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={connectForm.adminEmail}
                  onChange={(e) => setConnectForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                  placeholder="admin@sirket.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={connectForm.description}
                  onChange={(e) => setConnectForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Bu bağlantının amacını açıklayın..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Bağlanıyor...' : 'Bağlan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 