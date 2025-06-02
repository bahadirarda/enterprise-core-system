'use client'

import React, { useState } from 'react'
import { Building2, Users, Activity, UserPlus, DollarSign, Search, User, Clock, Eye, Edit, Trash2, RefreshCw, BarChart3, Plus, Settings, Globe } from 'lucide-react'
import { useAdminStats, useCompanies, useAdminUsers, useRecentActivities } from '@/hooks/useAdminData'
import { adminActions } from '@/lib/adminActions'
import { Company } from '@/lib/supabase'
import CompanyModal from '@/components/CompanyModal'
import SystemStatus from '@/components/SystemStatus'
import CompactSystemStatus from '@/components/CompactSystemStatus'
import IntegrationsManagement from '@/components/IntegrationsManagement'
import DevOpsAutomation from '@/components/DevOpsAutomation'
import ApprovalsManagement from '@/components/ApprovalsManagement'
import AdminSidebar from '@/components/AdminSidebar'
import DashboardPage from '@/components/DashboardPage'
import CompaniesPage from '@/components/CompaniesPage'
import UsersPage from '@/components/UsersPage'
import SystemStatusPage from '@/components/SystemStatusPage'

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
  const { stats, loading: statsLoading, refetch: refetchStats } = useAdminStats()
  const { companies, loading: companiesLoading, refetch: refetchCompanies } = useCompanies()
  const { users, loading: usersLoading, refetch: refetchUsers } = useAdminUsers()
  const { activities, loading: activitiesLoading, refetch: refetchActivities } = useRecentActivities()

  // Handle refresh all data
  const handleRefreshAll = async () => {
    await Promise.all([
      refetchStats(),
      refetchCompanies(),
      refetchUsers(),
      refetchActivities()
    ])
  }

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

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Bu şirketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setDeleteLoading(companyId)
    try {
      await adminActions.deleteCompany(companyId)
      refetchCompanies()
    } catch (error) {
      console.error('Failed to delete company:', error)
      alert('Şirket silinirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCompanyModalClose = () => {
    setCompanyModalOpen(false)
    setSelectedCompany(null)
  }

  const handleCompanySubmit = () => {
    refetchCompanies()
    handleCompanyModalClose()
  }

  // Filter functions
  const getFilteredCompanies = () => {
    if (!companies) return []
    
    let filtered = companies
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(company => company.plan === selectedFilter)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }

  const getFilteredUsers = () => {
    if (!users) return []
    
    if (searchTerm) {
      return users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return users
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage 
            stats={stats}
            statsLoading={statsLoading}
            activities={activities}
            activitiesLoading={activitiesLoading}
            handleRefreshAll={handleRefreshAll}
          />
        )

      case 'companies':
        return (
          <CompaniesPage 
            companies={companies}
            companiesLoading={companiesLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            refetchCompanies={refetchCompanies}
            getFilteredCompanies={getFilteredCompanies}
            handleCreateCompany={handleCreateCompany}
            handleEditCompany={handleEditCompany}
            handleDeleteCompany={handleDeleteCompany}
            deleteLoading={deleteLoading}
          />
        )

      case 'users':
        return (
          <UsersPage 
            users={users}
            usersLoading={usersLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            refetchUsers={refetchUsers}
            getFilteredUsers={getFilteredUsers}
          />
        )

      case 'system-status':
        return <SystemStatusPage />

      case 'devops':
        return <DevOpsAutomation />

      case 'approvals':
        return <ApprovalsManagement />

      case 'integrations':
        return <IntegrationsManagement />

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Sistem Raporları</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Sistem performansı, kullanım istatistikleri ve operasyonel raporlar.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Performans Raporu</h3>
                  <p className="text-sm text-gray-600">Sistem performans metrikleri</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Kullanım İstatistikleri</h3>
                  <p className="text-sm text-gray-600">Kullanıcı aktivite raporları</p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Hata Analizi</h3>
                  <p className="text-sm text-gray-600">Sistem hatları ve çözümleri</p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Güvenlik Raporu</h3>
                  <p className="text-sm text-gray-600">Güvenlik olayları ve loglar</p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">📊 Gelişmiş Raporlama</h4>
                <p className="text-sm text-purple-700">
                  Detaylı raporlama modülleri ve dashboard'lar geliştiriliyor. 
                  Real-time metrikler, özelleştirilebilir raporlar ve export seçenekleri eklenecek.
                </p>
              </div>
            </div>
          </div>
        )

      case 'revenue':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900">Toplam Gelir</h3>
                  <p className="text-2xl font-bold text-green-600">₺{stats?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Ortalama Gelir</h3>
                  <p className="text-2xl font-bold text-blue-600">₺{Math.round((stats?.totalRevenue || 0) / 12).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900">Büyüme Oranı</h3>
                  <p className="text-2xl font-bold text-purple-600">+15%</p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Sayfa bulunamadı</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main Content with margin for fixed sidebar */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          {renderContent()}
      </div>

      {/* Company Modal */}
      <CompanyModal
        isOpen={companyModalOpen}
        onClose={handleCompanyModalClose}
        onSuccess={handleCompanySubmit}
        company={selectedCompany}
        mode={modalMode}
      />
    </div>
  )
}