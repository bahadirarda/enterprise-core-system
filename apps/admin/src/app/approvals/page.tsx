'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, Clock, CheckCircle, XCircle, User, Calendar, AlertTriangle, FileText, GitBranch, Settings, Search, Filter, MoreVertical, Eye, Check, X, Users, Building2 } from 'lucide-react'

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

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
        }
      ]
      
      setApprovals(mockApprovals)
    } catch (error) {
      console.error('Failed to load approvals:', error)
    } finally {
      setLoading(false)
    }
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
    return approvals.filter(approval => {
      const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           approval.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           approval.requester.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || approval.status === statusFilter
      const matchesType = typeFilter === 'all' || approval.type === typeFilter
      const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'under_review':
        return <Eye className="w-5 h-5 text-blue-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <GitBranch className="w-5 h-5 text-purple-500" />
      case 'integration':
        return <Building2 className="w-5 h-5 text-blue-500" />
      case 'system_change':
        return <Settings className="w-5 h-5 text-orange-500" />
      case 'deployment':
        return <CheckSquare className="w-5 h-5 text-green-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
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
        return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede'
      case 'under_review':
        return 'İnceleniyor'
      case 'approved':
        return 'Onaylandı'
      case 'rejected':
        return 'Reddedildi'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const statsData = [
    {
      label: 'Bekleyen',
      count: approvals.filter(a => a.status === 'pending').length,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      label: 'İncelenen',
      count: approvals.filter(a => a.status === 'under_review').length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Onaylanan',
      count: approvals.filter(a => a.status === 'approved').length,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Reddedilen',
      count: approvals.filter(a => a.status === 'rejected').length,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Onay Yönetimi</h1>
            <p className="text-gray-600 mt-1">Proje onayları, entegrasyon istekleri ve sistem değişikliklerini yönetin</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadApprovals}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Yenile</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <CheckSquare className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="İstek ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="under_review">İnceleniyor</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tür</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tüm Türler</option>
                <option value="project">Proje</option>
                <option value="integration">Entegrasyon</option>
                <option value="system_change">Sistem Değişikliği</option>
                <option value="deployment">Deployment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">Tüm Öncelikler</option>
                <option value="critical">Kritik</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
          </div>
        </div>

        {/* Approvals List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Onay İstekleri ({getFilteredApprovals().length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : getFilteredApprovals().length === 0 ? (
            <div className="p-12 text-center">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Onay isteği bulunamadı</h3>
              <p className="text-gray-600">Arama kriterlerinizi değiştirerek tekrar deneyin</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {getFilteredApprovals().map((approval) => (
                <div key={approval.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getTypeIcon(approval.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-lg font-medium text-gray-900">{approval.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                            {approval.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{approval.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{approval.requester}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(approval.createdAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{getTypeLabel(approval.type)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(approval.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(approval.status)}`}>
                          {getStatusLabel(approval.status)}
                        </span>
                      </div>
                      
                      {approval.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApprovalAction(approval.id, 'reject')}
                            disabled={actionLoading === approval.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {actionLoading === approval.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            <span>Reddet</span>
                          </button>
                          <button
                            onClick={() => handleApprovalAction(approval.id, 'approve')}
                            disabled={actionLoading === approval.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {actionLoading === approval.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>Onayla</span>
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => setSelectedApproval(approval)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {approval.metadata && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {approval.metadata.projectName && (
                          <div>
                            <span className="font-medium text-gray-700">Proje: </span>
                            <span className="text-gray-600">{approval.metadata.projectName}</span>
                          </div>
                        )}
                        {approval.metadata.integrationService && (
                          <div>
                            <span className="font-medium text-gray-700">Servis: </span>
                            <span className="text-gray-600">{approval.metadata.integrationService}</span>
                          </div>
                        )}
                        {approval.metadata.systemComponent && (
                          <div>
                            <span className="font-medium text-gray-700">Bileşen: </span>
                            <span className="text-gray-600">{approval.metadata.systemComponent}</span>
                          </div>
                        )}
                        {approval.metadata.estimatedImpact && (
                          <div className="md:col-span-3">
                            <span className="font-medium text-gray-700">Tahmini Etki: </span>
                            <span className="text-gray-600">{approval.metadata.estimatedImpact}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedApproval(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Onay İsteği Detayları</h2>
                <p className="text-sm text-gray-600 mt-1">#{selectedApproval.id}</p>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Başlık</h3>
                    <p className="text-gray-900">{selectedApproval.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tür</h3>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(selectedApproval.type)}
                      <span>{getTypeLabel(selectedApproval.type)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Durum</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedApproval.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedApproval.status)}`}>
                        {getStatusLabel(selectedApproval.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Öncelik</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedApproval.priority)}`}>
                      {selectedApproval.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Açıklama</h3>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedApproval.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">İstek Sahibi</h3>
                    <p className="text-gray-900">{selectedApproval.requester}</p>
                    <p className="text-sm text-gray-600">{selectedApproval.requesterEmail}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Oluşturulma Tarihi</h3>
                    <p className="text-gray-900">{formatDate(selectedApproval.createdAt)}</p>
                  </div>
                </div>
                
                {selectedApproval.metadata && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Teknik Detaylar</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      {selectedApproval.metadata.technicalDetails && (
                        <div>
                          <span className="font-medium text-gray-700">Teknik Açıklama: </span>
                          <span className="text-gray-600">{selectedApproval.metadata.technicalDetails}</span>
                        </div>
                      )}
                      {selectedApproval.metadata.estimatedImpact && (
                        <div>
                          <span className="font-medium text-gray-700">Tahmini Etki: </span>
                          <span className="text-gray-600">{selectedApproval.metadata.estimatedImpact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {(selectedApproval.reviewedBy || selectedApproval.reviewedAt) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">İnceleme Bilgileri</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedApproval.reviewedBy && (
                        <p><span className="font-medium">İnceleyen: </span>{selectedApproval.reviewedBy}</p>
                      )}
                      {selectedApproval.reviewedAt && (
                        <p><span className="font-medium">İnceleme Tarihi: </span>{formatDate(selectedApproval.reviewedAt)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 