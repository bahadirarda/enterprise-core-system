'use client'

import { useState } from 'react'
import { Building2, Users, Activity, UserPlus, DollarSign, LifeBuoy, Settings, ChevronRight, Search, User, Clock, AlertCircle, CheckCircle, X, Eye, Edit, Trash2, Monitor, Zap, MessageSquare } from 'lucide-react'
import { useAdminStats, useCompanies, useAdminUsers, useRecentActivities } from '@/hooks/useAdminData'
import { adminActions } from '@/lib/adminActions'
import { Company } from '@/lib/supabase'
import CompanyModal from '@/components/CompanyModal'
import SystemStatus from '@/components/SystemStatus'
import AutomationPanel from '@/components/AutomationPanel'
import CompactSystemStatus from '@/components/CompactSystemStatus'
import IntegrationsManagement from '@/components/IntegrationsManagement'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [companyModalOpen, setCompanyModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // Use real data hooks
  const { stats, loading: statsLoading } = useAdminStats()
  const { companies, loading: companiesLoading, refetch: refetchCompanies } = useCompanies()
  const { users, loading: usersLoading } = useAdminUsers()
  const { activities, loading: activitiesLoading } = useRecentActivities()

  const sidebarItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'companies', icon: Building2, label: 'Şirketler' },
    { id: 'users', icon: Users, label: 'Kullanıcılar' },
    { id: 'system-status', icon: Monitor, label: 'Sistem Durumu' },
    { id: 'automation', icon: Zap, label: 'Otomasyon' },
    { id: 'integrations', icon: MessageSquare, label: 'Entegrasyonlar' },
    { id: 'support', icon: LifeBuoy, label: 'Destek' },
    { id: 'revenue', icon: DollarSign, label: 'Gelir Analizi' },
    { id: 'settings', icon: Settings, label: 'Sistem Ayarları' },
  ]

  // Company CRUD handlers
  const handleCreateCompany = () => {
    setSelectedCompany(null)
    setModalMode('create')
    setCompanyModalOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setModalMode('edit')
    setCompanyModalOpen(true)
  }

  const handleDeleteCompany = async (company: Company) => {
    if (!confirm(`"${company.name}" şirketini silmek istediğinizden emin misiniz?`)) {
      return
    }

    setDeleteLoading(company.id)
    try {
      const result = await adminActions.deleteCompany(company.id)
      if (result.success) {
        refetchCompanies()
        alert('Şirket başarıyla silindi')
      } else {
        alert(result.error || 'Silme işlemi başarısız')
      }
    } catch {
      alert('Beklenmeyen bir hata oluştu')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleModalSuccess = () => {
    refetchCompanies()
  }

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          // Loading state
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : stats ? (
          [
            { icon: Building2, title: 'Toplam Şirket', value: stats.totalCompanies, change: '+12%', color: 'text-blue-600' },
            { icon: Users, title: 'Toplam Kullanıcı', value: stats.totalUsers, change: '+8%', color: 'text-green-600' },
            { icon: DollarSign, title: 'Toplam Gelir', value: `₺${(stats.totalRevenue).toLocaleString()}`, change: '+23%', color: 'text-purple-600' },
            { icon: Activity, title: 'Aktif Oturum', value: stats.activeSessions, change: '+5%', color: 'text-orange-600' }
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 bg-red-50 p-4 rounded-lg">
            <p className="text-red-600">Veriler yüklenirken hata oluştu.</p>
          </div>
        )}
      </div>

      {/* Bottom Grid - Recent Activity and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
          <div className="space-y-4">
            {activitiesLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${activity.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {activity.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Compact System Status */}
        <CompactSystemStatus />
      </div>
    </div>
  )

  const renderCompaniesContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Şirket Yönetimi</h2>
        <button 
          onClick={handleCreateCompany}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4 inline mr-2" />
          Yeni Şirket
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Şirket ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">Tüm Şirketler</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="trial">Deneme</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Şirket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gelir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companiesLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                    </td>
                  </tr>
                ))
              ) : (
                companies
                  .filter(company => 
                    company.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (selectedFilter === 'all' || company.status === selectedFilter)
                  )
                  .map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500">{company.domain}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                          company.plan === 'Professional' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {company.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {company.user_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{company.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.status === 'active' ? 'bg-green-100 text-green-800' :
                          company.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {company.status === 'active' ? 'Aktif' : company.status === 'inactive' ? 'Pasif' : 'Deneme'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditCompany(company)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCompany(company)}
                            disabled={deleteLoading === company.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Sil"
                          >
                            {deleteLoading === company.id ? (
                              <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderUsersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Şirket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Giriş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                    </td>
                  </tr>
                ))
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.company?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.last_login).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSupportContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Destek Merkezi</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Açık Talepler</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.supportTickets || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Çözümlenen</p>
              <p className="text-2xl font-bold text-gray-900">47</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama Çözüm</p>
              <p className="text-2xl font-bold text-gray-900">2.4 saat</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Destek Talepleri</h3>
        <div className="space-y-4">
          {[
            { id: 1, title: 'Giriş sorunu', company: 'ABC Teknoloji', priority: 'high', status: 'open' },
            { id: 2, title: 'Çalışan ekleme hatası', company: 'XYZ Holding', priority: 'medium', status: 'in-progress' },
            { id: 3, title: 'Rapor indirme sorunu', company: 'DEF Ltd.', priority: 'low', status: 'resolved' },
          ].map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                <p className="text-sm text-gray-500">{ticket.company}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.priority === 'high' ? 'Yüksek' : ticket.priority === 'medium' ? 'Orta' : 'Düşük'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                  ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.status === 'open' ? 'Açık' : ticket.status === 'in-progress' ? 'İşlemde' : 'Çözüldü'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent()
      case 'companies':
        return renderCompaniesContent()
      case 'users':
        return renderUsersContent()
      case 'system-status':
        return <SystemStatus />
      case 'automation':
        return <AutomationPanel />
      case 'integrations':
        return <IntegrationsManagement />
      case 'support':
        return renderSupportContent()
      case 'revenue':
        return <div className="bg-white rounded-xl shadow-sm p-6"><h2 className="text-xl font-bold">Gelir Analizi - Yakında</h2></div>
      case 'settings':
        return <div className="bg-white rounded-xl shadow-sm p-6"><h2 className="text-xl font-bold">Sistem Ayarları - Yakında</h2></div>
      default:
        return renderDashboardContent()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            {!sidebarCollapsed && (
              <>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-500">Sistem Yönetimi</p>
                </div>
              </>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="ml-auto p-1 rounded-lg hover:bg-gray-100"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="px-4 pb-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`${sidebarCollapsed ? 'h-6 w-6' : 'h-5 w-5'} flex-shrink-0`} />
                    {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Sistem yönetimi ve analiz paneli
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Son güncelleme: {new Date().toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Company Modal */}
      <CompanyModal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        onSuccess={handleModalSuccess}
        company={selectedCompany}
        mode={modalMode}
      />
    </div>
  )
}