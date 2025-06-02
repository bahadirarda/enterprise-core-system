'use client'

import React, { useState } from 'react'
import { 
  Building2, 
  Users, 
  Activity, 
  DollarSign, 
  LifeBuoy, 
  Settings, 
  ChevronRight, 
  Monitor, 
  MessageSquare, 
  GitBranch, 
  CheckSquare, 
  BarChart3, 
  ChevronDown, 
  LogOut, 
  UserCircle,
  Shield,
  X
} from 'lucide-react'

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed 
}: AdminSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['general']))
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false)

  // Categorized sidebar menu structure
  const menuCategories = [
    {
      id: 'general',
      title: 'Genel Yönetim',
      icon: Activity,
      items: [
        { id: 'dashboard', icon: Activity, label: 'Dashboard' },
        { id: 'companies', icon: Building2, label: 'Şirketler' },
        { id: 'users', icon: Users, label: 'Kullanıcılar' },
      ]
    },
    {
      id: 'devops',
      title: 'DevOps & Geliştirme',
      icon: GitBranch,
      items: [
        { id: 'devops', icon: GitBranch, label: 'DevOps Otomasyonu' },
        { id: 'approvals', icon: CheckSquare, label: 'Onay Yönetimi' },
      ]
    },
    {
      id: 'integrations',
      title: 'Entegrasyonlar',
      icon: MessageSquare,
      items: [
        { id: 'integrations', icon: MessageSquare, label: 'Bağlı Sistemler' },
      ]
    },
    {
      id: 'analytics',
      title: 'Analiz & Raporlama',
      icon: BarChart3,
      items: [
        { id: 'revenue', icon: DollarSign, label: 'Gelir Analizi' },
        { id: 'reports', icon: BarChart3, label: 'Sistem Raporları' },
      ]
    }
  ]

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg z-40 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {!sidebarCollapsed && (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">DigiDaga Management</p>
              </div>
            </>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <X className="h-4 w-4 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* Navigation - scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {menuCategories.map((category) => (
            <li key={category.id}>
              {/* Category Header */}
              {!sidebarCollapsed && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>{category.title}</span>
                  <ChevronDown 
                    className={`h-3 w-3 transition-transform ${
                      expandedCategories.has(category.id) ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
              )}
              
              {/* Category Items */}
              {(sidebarCollapsed || expandedCategories.has(category.id)) && (
                <ul className={`space-y-1 ${!sidebarCollapsed ? 'ml-2' : ''}`}>
                  {category.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            activeTab === item.id
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <Icon className={`${sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4'} flex-shrink-0`} />
                          {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings Dropdown and User Section - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200">
        {/* Settings Dropdown */}
        {!sidebarCollapsed && (
          <div className="relative px-3 py-2">
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
            >
              <Settings className="h-4 w-4" />
              <span className="font-medium">Sistem Yönetimi</span>
              <ChevronDown className={`ml-auto h-3 w-3 transition-transform ${
                settingsDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Settings Dropdown Menu */}
            {settingsDropdownOpen && (
              <div className="mt-1 ml-7 space-y-1">
                <button 
                  onClick={() => setActiveTab('system-status')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'system-status' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Monitor className="h-3 w-3" />
                  <span>Sistem Durumu</span>
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'settings' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-3 w-3" />
                  <span>Sistem Ayarları</span>
                </button>
                <button 
                  onClick={() => setActiveTab('support')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === 'support' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LifeBuoy className="h-3 w-3" />
                  <span>Destek</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Profile - Always at bottom */}
        <div className="p-3">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <UserCircle className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                  <p className="text-xs text-gray-500 truncate">admin@digidaga.com</p>
                </div>
                <button className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 