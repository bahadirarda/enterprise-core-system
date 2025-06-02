'use client'

import React, { useState, useEffect } from 'react'
import { CheckSquare, Clock, CheckCircle, XCircle, User, Calendar, AlertTriangle, FileText, GitBranch, Settings, Search, Filter, MoreVertical, Eye, Check, X, Users, Building2, RefreshCw, Play, TrendingUp, Shield, Loader2 } from 'lucide-react'

interface ApprovalRequest {
  id: string
  type: 'project' | 'integration' | 'system_change' | 'deployment'
  title: string
  description: string
  requester: string
  requesterEmail: string
  companyName?: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  updatedAt: string
  reviewedBy?: string
  reviewedAt?: string
  metadata?: {
    projectName?: string
    integrationService?: string
    systemComponent?: string
    estimatedImpact?: string
    technicalDetails?: string
  }
}

export default function ApprovalsManagement() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadApprovals()
  }, [])

  const loadApprovals = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockApprovals: ApprovalRequest[] = [
        {
          id: '1',
          type: 'project',
          title: 'DevOps Pipeline Automation Project',
          description: 'Kurulum ve konfigürasyon için otomatik CI/CD pipeline sisteminin devreye alınması',
          requester: 'Ahmet Yılmaz',
          requesterEmail: 'ahmet.yilmaz@digidaga.com',
          companyName: 'DigiDaga Enterprise',
          status: 'pending',
          priority: 'high',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          metadata: {
            projectName: 'DevOps Automation Suite',
            estimatedImpact: 'Tüm geliştirme süreçlerini etkileyecek',
            technicalDetails: 'GitHub Actions, Docker, Kubernetes entegrasyonu gerekli'
          }
        },
        {
          id: '2',
          type: 'integration',
          title: 'SAP SuccessFactors Entegrasyonu',
          description: 'İK sistemleri ile SAP SuccessFactors arasında veri senkronizasyonu',
          requester: 'Zeynep Kaya',
          requesterEmail: 'zeynep.kaya@digidaga.com',
          status: 'under_review',
          priority: 'medium',
          createdAt: '2024-01-14T14:20:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
          metadata: {
            integrationService: 'SAP SuccessFactors',
            estimatedImpact: 'İK süreçlerinde iyileşme',
            technicalDetails: 'REST API entegrasyonu, OAuth 2.0 kimlik doğrulama'
          }
        },
        {
          id: '3',
          type: 'system_change',
          title: 'Veri Tabanı Schema Değişikliği',
          description: 'Kullanıcı yetkilendirme sisteminde güvenlik güncellemeleri',
          requester: 'Mehmet Demir',
          requesterEmail: 'mehmet.demir@digidaga.com',
          status: 'approved',
          priority: 'critical',
          createdAt: '2024-01-13T16:45:00Z',
          updatedAt: '2024-01-14T11:30:00Z',
          reviewedBy: 'Admin',
          reviewedAt: '2024-01-14T11:30:00Z',
          metadata: {
            systemComponent: 'Authentication System',
            estimatedImpact: 'Tüm kullanıcı oturumlarını etkileyecek',
            technicalDetails: 'PostgreSQL schema migration, user role restructuring'
          }
        },
        {
          id: '4',
          type: 'deployment',
          title: 'Production Environment Update',
          description: 'Üretim ortamında kritik güvenlik yamalarının uygulanması',
          requester: 'Ayşe Özkan',
          requesterEmail: 'ayse.ozkan@digidaga.com',
          status: 'rejected',
          priority: 'high',
          createdAt: '2024-01-12T09:00:00Z',
          updatedAt: '2024-01-13T15:20:00Z',
          reviewedBy: 'Admin',
          reviewedAt: '2024-01-13T15:20:00Z',
          metadata: {
            systemComponent: 'Production Infrastructure',
            estimatedImpact: 'Kısa süreli sistem kesintisi olabilir',
            technicalDetails: 'Security patches, dependency updates'
          }
        },
        {
          id: '5',
          type: 'integration',
          title: 'Microsoft Teams Bildirim Entegrasyonu',
          description: 'Sistem bildirimleri için Teams kanalı kurulumu',
          requester: 'Can Yıldırım',
          requesterEmail: 'can.yildirim@digidaga.com',
          status: 'pending',
          priority: 'low',
          createdAt: '2024-01-11T13:15:00Z',
          updatedAt: '2024-01-11T13:15:00Z',
          metadata: {
            integrationService: 'Microsoft Teams',
            estimatedImpact: 'Bildirim sisteminde iyileşme',
            technicalDetails: 'Webhook integration, Teams bot setup'
          }
        },
        {
          id: '6',
          type: 'project',
          title: 'Mobile App Development Phase 2',
          description: 'iOS ve Android uygulamaları için ikinci faz geliştirme',
          requester: 'Fatma Şahin',
          requesterEmail: 'fatma.sahin@digidaga.com',
          status: 'under_review',
          priority: 'medium',
          createdAt: '2024-01-10T11:20:00Z',
          updatedAt: '2024-01-14T16:45:00Z',
          metadata: {
            projectName: 'Mobile Platform v2.0',
            estimatedImpact: 'Mobil kullanıcı deneyiminde büyük iyileşme',
            technicalDetails: 'React Native, API v2.0 entegrasyonu'
          }
        }
      ]
      
      setApprovals(mockApprovals)
    } catch (error) {
      console.error('Failed to load approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadApprovals()
    setRefreshing(false)
  }

  const handleApprovalAction = async (approvalId: string, action: 'approve' | 'reject') => {
    setActionLoading(approvalId)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setApprovals(prev => prev.map(approval => 
        approval.id === approvalId 
          ? { 
              ...approval, 
              status: action === 'approve' ? 'approved' : 'rejected',
              reviewedBy: 'Admin',
              reviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : approval
      ))
      
      alert(`İstek başarıyla ${action === 'approve' ? 'onaylandı' : 'reddedildi'}!`)
    } catch (error) {
      console.error('Failed to process approval:', error)
      alert('İşlem sırasında hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setActionLoading(null)
    }
  }

  const getFilteredApprovals = () => {
    let filtered = approvals

    // Tab filtrelemesi
    if (activeTab !== 'all') {
      if (activeTab === 'pending') {
        filtered = filtered.filter(approval => approval.status === 'pending' || approval.status === 'under_review')
      } else {
        filtered = filtered.filter(approval => approval.status === activeTab)
      }
    }

    // Diğer filtreler
    if (searchTerm) {
      filtered = filtered.filter(approval => 
        approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.requester.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(approval => approval.type === typeFilter)
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(approval => approval.priority === priorityFilter)
    }
    
    return filtered
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'under_review':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'under_review':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Building2 className="w-4 h-4" />
      case 'integration':
        return <GitBranch className="w-4 h-4" />
      case 'system_change':
        return <Settings className="w-4 h-4" />
      case 'deployment':
        return <Play className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'Proje'
      case 'integration':
        return 'Entegrasyon'
      case 'system_change':
        return 'Sistem Değişikliği'
      case 'deployment':
        return 'Deployment'
      default:
        return 'Diğer'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı'
      case 'rejected':
        return 'Reddedildi'
      case 'under_review':
        return 'İnceleniyor'
      case 'pending':
        return 'Beklemede'
      default:
        return 'Bilinmiyor'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActiveTabClasses = (tabId: string) => {
    switch (tabId) {
      case 'pending':
        return 'border-yellow-500 text-yellow-600'
      case 'approved':
        return 'border-green-500 text-green-600'
      case 'rejected':
        return 'border-red-500 text-red-600'
      case 'all':
        return 'border-indigo-500 text-indigo-600'
      default:
        return ''
    }
  }

  const getActiveCountClasses = (tabId: string) => {
    switch (tabId) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'all':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return ''
    }
  }

  const getActiveGradientClasses = (tabId: string) => {
    switch (tabId) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 'approved':
        return 'bg-gradient-to-r from-green-400 to-green-600'
      case 'rejected':
        return 'bg-gradient-to-r from-red-400 to-red-600'
      case 'all':
        return 'bg-gradient-to-r from-indigo-400 to-indigo-600'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* DevOps Style Header - Approval Management */}
      <div className="relative bg-white shadow-sm border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Onay Yönetimi</h1>
                <p className="text-gray-600">Proje, entegrasyon ve sistem değişiklik onayları</p>
              </div>
            </div>
            
            {/* Real-time Stats Cards */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Bekleyen</p>
                    <p className="font-medium text-gray-900 text-sm">{approvals.filter(a => a.status === 'pending').length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">İnceleniyor</p>
                  <p className="font-bold text-blue-600 text-lg">{approvals.filter(a => a.status === 'under_review').length}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Onaylanan</p>
                  <p className="font-bold text-green-600 text-lg">{approvals.filter(a => a.status === 'approved').length}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Kritik</p>
                  <p className="font-bold text-red-600 text-lg">{approvals.filter(a => a.priority === 'critical').length}</p>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                title="Refresh approvals"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { 
                id: 'pending', 
                label: 'Bekleyen', 
                count: approvals.filter(a => a.status === 'pending' || a.status === 'under_review').length,
                icon: Clock
              },
              { 
                id: 'approved', 
                label: 'Onaylanan', 
                count: approvals.filter(a => a.status === 'approved').length,
                icon: CheckCircle
              },
              { 
                id: 'rejected', 
                label: 'Reddedilen', 
                count: approvals.filter(a => a.status === 'rejected').length,
                icon: XCircle
              },
              { 
                id: 'all', 
                label: 'Tümü', 
                count: approvals.length,
                icon: CheckSquare
              }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? getActiveTabClasses(tab.id)
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`py-0.5 px-2.5 rounded-full text-xs font-medium ${
                      isActive 
                        ? getActiveCountClasses(tab.id)
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${getActiveGradientClasses(tab.id)}`} />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="text-gray-600 font-medium">Loading approvals...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                  <span>Onay İstekleri</span>
                </h2>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">{approvals.filter(a => a.priority === 'critical').length} kritik</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">{approvals.filter(a => a.priority === 'high').length} yüksek</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">{approvals.filter(a => a.priority === 'medium').length} orta</span>
                  </div>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-indigo-600 font-semibold text-lg">{approvals.length}</p>
                  <p className="text-indigo-800 text-xs">Toplam İstek</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-yellow-600 font-semibold text-lg">{approvals.filter(a => a.status === 'pending').length}</p>
                  <p className="text-yellow-800 text-xs">Beklemede</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-green-600 font-semibold text-lg">{Math.round((approvals.filter(a => a.status === 'approved').length / (approvals.length || 1)) * 100)}%</p>
                  <p className="text-green-800 text-xs">Onay Oranı</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-orange-600 font-semibold text-lg">{new Set(approvals.map(a => a.type)).size}</p>
                  <p className="text-orange-800 text-xs">İstek Türü</p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="İstek ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Tüm Türler</option>
                  <option value="project">Proje</option>
                  <option value="integration">Entegrasyon</option>
                  <option value="system_change">Sistem Değişikliği</option>
                  <option value="deployment">Deployment</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Tüm Öncelikler</option>
                  <option value="critical">Kritik</option>
                  <option value="high">Yüksek</option>
                  <option value="medium">Orta</option>
                  <option value="low">Düşük</option>
                </select>
              </div>
            </div>

            {/* Approval Requests List */}
            {getFilteredApprovals().length > 0 ? (
              <div className="space-y-4">
                {getFilteredApprovals().map((approval) => (
                  <div key={approval.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          approval.type === 'project' ? 'bg-blue-100' :
                          approval.type === 'integration' ? 'bg-purple-100' :
                          approval.type === 'system_change' ? 'bg-orange-100' :
                          approval.type === 'deployment' ? 'bg-green-100' :
                          'bg-gray-100'
                        }`}>
                          <div className={`${
                            approval.type === 'project' ? 'text-blue-600' :
                            approval.type === 'integration' ? 'text-purple-600' :
                            approval.type === 'system_change' ? 'text-orange-600' :
                            approval.type === 'deployment' ? 'text-green-600' :
                            'text-gray-600'
                          }`}>
                            {getTypeIcon(approval.type)}
                          </div>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-lg">{approval.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(approval.priority)}`}>
                              {approval.priority.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {getTypeLabel(approval.type)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{approval.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 flex-wrap gap-y-1">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{approval.requester}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(approval.createdAt)}</span>
                            </div>
                            {approval.companyName && (
                              <div className="flex items-center space-x-1">
                                <Building2 className="w-3 h-3" />
                                <span>{approval.companyName}</span>
                              </div>
                            )}
                          </div>
                          
                          {approval.metadata && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Etki:</span> {approval.metadata.estimatedImpact}
                              </p>
                              {approval.metadata.technicalDetails && (
                                <p className="text-xs text-gray-600 mt-1">
                                  <span className="font-medium">Teknik:</span> {approval.metadata.technicalDetails}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-start items-end space-y-3 flex-shrink-0 w-auto max-w-xs">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium border whitespace-nowrap inline-flex items-center ${getStatusColor(approval.status)}`}>
                          {getStatusIcon(approval.status)}
                          <span className="ml-2">{getStatusLabel(approval.status)}</span>
                        </span>
                        
                        {approval.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprovalAction(approval.id, 'approve')}
                              disabled={actionLoading === approval.id}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-1 whitespace-nowrap"
                            >
                              {actionLoading === approval.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Onayla</span>
                            </button>
                            
                            <button
                              onClick={() => handleApprovalAction(approval.id, 'reject')}
                              disabled={actionLoading === approval.id}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-1 whitespace-nowrap"
                            >
                              <X className="w-3 h-3" />
                              <span>Reddet</span>
                            </button>
                          </div>
                        )}
                        
                        {approval.reviewedBy && approval.reviewedAt && (
                          <div className="text-xs text-gray-500 text-right">
                            <p className="whitespace-nowrap">Gözden geçiren: {approval.reviewedBy}</p>
                            <p className="whitespace-nowrap">{formatDate(approval.reviewedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {activeTab === 'pending' ? 'Bekleyen onay bulunamadı' :
                   activeTab === 'approved' ? 'Onaylanmış istek bulunamadı' :
                   activeTab === 'rejected' ? 'Reddedilen istek bulunamadı' :
                   'Onay isteği bulunamadı'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'Filtreleri değiştirerek tekrar deneyin.'
                    : 'Yeni onay istekleri burada görünecek.'}
                </p>
                {(searchTerm || typeFilter !== 'all' || priorityFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('')
                      setTypeFilter('all')
                      setPriorityFilter('all')
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 