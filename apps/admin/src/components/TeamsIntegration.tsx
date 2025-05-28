'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  AlertTriangle,
  Shield,
  Bell,
  Zap,
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
  approvers: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  teamsMessageId?: string
}

export default function TeamsIntegration() {
  const [connections, setConnections] = useState<TeamsConnection[]>([])
  const [notifications, setNotifications] = useState<TeamsNotification[]>([])
  const [approvals, setApprovals] = useState<TeamsApproval[]>([])
  const [activeTab, setActiveTab] = useState<'connections' | 'notifications' | 'approvals' | 'settings'>('connections')
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectForm, setConnectForm] = useState({
    organizationName: '',
    adminEmail: '',
    description: '',
    channels: [] as string[]
  })

  useEffect(() => {
    loadTeamsData()
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
        const formattedConnections = connectionsData.connections.map((conn: any) => ({
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
      }
    } catch (error) {
      console.error('Failed to load Teams data:', error)
      // Fallback to mock data if API fails
      setConnections([
        {
          id: '1',
          name: 'HRMS Development Team',
          tenantId: 'abc123-def456',
          status: 'connected',
          connectedAt: new Date(Date.now() - 86400000).toISOString(),
          lastSync: new Date(Date.now() - 3600000).toISOString(),
          channelCount: 5,
          memberCount: 12,
          permissions: ['read_messages', 'send_messages', 'manage_webhooks']
        }
      ])
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
    try {
      const response = await fetch('/api/teams/approvals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: approvalId,
          action,
          approver: 'current-user', // Gerçek implementasyonda kullanıcı bilgisinden gelecek
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
        
        alert(result.message || `İşlem ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`)
      } else {
        alert(result.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Approval action failed:', error)
      alert('İşlem başarısız')
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
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
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
              onClick={() => setActiveTab(tab.id as any)}
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

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{approval.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{approval.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Talep eden: {approval.requester}</span>
                      <span>Onaylayanlar: {approval.approvers.join(', ')}</span>
                      <span>{new Date(approval.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(approval.status)}`}>
                      {approval.status}
                    </span>
                  </div>
                </div>
                
                {approval.status === 'pending' && (
                  <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleApproval(approval.id, 'reject')}
                      className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    >
                      Reddet
                    </button>
                    <button
                      onClick={() => handleApproval(approval.id, 'approve')}
                      className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                    >
                      Onayla
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Entegrasyon Ayarları</h3>
            
            <div className="space-y-6">
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