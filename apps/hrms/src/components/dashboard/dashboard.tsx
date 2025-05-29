'use client'

import { useState } from 'react'
import { 
  User, 
  Calendar, 
  Clock,
  DollarSign,
  Users,
  Bell,
  Menu,
  UserPlus,
  BarChart3,
  Settings,
  LogOut,
  Home,
  FileText,
  Shield,
  Building,
  CreditCard,
  UserCheck,
  Search,
  X
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { AddEmployeeWizard } from '@/components/employee/add-employee-wizard'
import { PendingApplications, type ApplicationProgress } from '@/components/employee/pending-applications'

interface Employee {
  id: string
  employee_id?: string
  first_name?: string
  last_name?: string
  email: string
  phone?: string
  hire_date?: string
  salary?: number
  status?: string
  organization_id?: string
  department?: {
    id: string
    name: string
  }
  position?: {
    id: string
    title: string
  }
  manager?: {
    id: string
    first_name: string
    last_name: string
  }
  // Rol sistemi
  role?: 'admin' | 'hr_manager' | 'hr_specialist' | 'department_manager' | 'employee' | 'authenticated'
  permissions?: string[]
}

interface DashboardProps {
  employee: Employee
}

// Rol tabanlı menü yapısı
const getMenuItems = (role: string) => {
  const baseItems = [
    { id: 'dashboard', title: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'profile', title: 'Profilim', icon: User, path: '/profile' },
    { id: 'requests', title: 'Taleplerim', icon: FileText, path: '/requests' },
  ]

  const managerItems = [
    { id: 'team', title: 'Ekibim', icon: Users, path: '/team' },
    { id: 'approvals', title: 'Onaylar', icon: UserCheck, path: '/approvals' },
  ]

  const hrItems = [
    { id: 'employees', title: 'Çalışanlar', icon: Users, path: '/employees' },
    { id: 'recruitment', title: 'İşe Alım', icon: UserPlus, path: '/recruitment', requiresPermission: 'manage_employees' },
    { id: 'pending', title: 'Bekleyen İşlemler', icon: Clock, path: '/pending', requiresPermission: 'manage_employees' },
    { id: 'leave', title: 'İzin Yönetimi', icon: Calendar, path: '/leave' },
    { id: 'payroll', title: 'Bordro', icon: CreditCard, path: '/payroll' },
    { id: 'reports', title: 'Raporlar', icon: BarChart3, path: '/reports' },
  ]

  const adminItems = [
    { id: 'organization', title: 'Organizasyon', icon: Building, path: '/organization' },
    { id: 'settings', title: 'Sistem Ayarları', icon: Settings, path: '/settings' },
    { id: 'audit', title: 'Güvenlik', icon: Shield, path: '/audit' },
  ]

  switch (role) {
    case 'admin':
      return [...baseItems, ...managerItems, ...hrItems, ...adminItems]
    case 'hr_manager':
    case 'hr_specialist':
      return [...baseItems, ...hrItems.filter(item => 
        !item.requiresPermission || 
        (role === 'hr_manager' || item.requiresPermission !== 'manage_employees')
      )]
    case 'department_manager':
      return [...baseItems, ...managerItems, ...hrItems.filter(item => 
        !item.requiresPermission
      )]
    default:
      return baseItems
  }
}

export function Dashboard({ employee }: DashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-employee' | 'pending-applications'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard')
  const [editingApplication, setEditingApplication] = useState<ApplicationProgress | undefined>(undefined)

  // Mock rol - gerçek uygulamada API'den gelecek - HR Manager yapıyorum test için
  // Supabase auth user'ın "authenticated" rolünü "hr_manager" olarak map ediyoruz
  const userRole = employee.role === 'authenticated' ? 'hr_manager' : (employee.role || 'hr_manager')
  console.log('Employee:', employee)
  console.log('User Role:', userRole)
  const menuItems = getMenuItems(userRole)

  // Yetki kontrolü
  const hasPermission = (permission: string) => {
    if (userRole === 'admin') return true
    if (userRole === 'hr_manager') return ['manage_employees', 'view_reports', 'manage_leave'].includes(permission)
    if (userRole === 'hr_specialist') return ['view_employees', 'manage_leave'].includes(permission)
    return false
  }

  // Stats - role bazlı
  const getStats = () => {
    const baseStats = {
      myRequests: 2,
      pendingApprovals: userRole.includes('manager') ? 5 : 0,
    }

    if (userRole === 'admin' || userRole.startsWith('hr')) {
      return {
        ...baseStats,
        totalEmployees: 156,
        activeEmployees: 148,
        pendingRequests: 12,
        thisMonthHires: 8
      }
    }

    return baseStats
  }

  const stats = getStats()

  const recentActivities = [
    { id: 1, text: "Yeni çalışan eklendi: Ahmet Yılmaz", time: "2 saat önce", type: "success" },
    { id: 2, text: "İzin talebi onaylandı: Fatma Özkan", time: "4 saat önce", type: "info" },
    { id: 3, text: "Bordro hesaplaması tamamlandı", time: "1 gün önce", type: "success" },
    { id: 4, text: "Yeni departman eklendi: Dijital Pazarlama", time: "2 gün önce", type: "info" }
  ]

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const displayName = employee.first_name && employee.last_name 
    ? `${employee.first_name} ${employee.last_name}`
    : employee.email?.split('@')[0] || 'Kullanıcı'

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'admin': 'Sistem Yöneticisi',
      'hr_manager': 'İK Müdürü', 
      'hr_specialist': 'İK Uzmanı',
      'department_manager': 'Departman Müdürü',
      'employee': 'Çalışan'
    }
    return roleNames[role as keyof typeof roleNames] || 'Çalışan'
  }

  if (currentView === 'add-employee') {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Collapsed during wizard */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
          <button 
            onClick={() => {
              setCurrentView('dashboard')
              setActiveMenuItem('dashboard')
            }}
            className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex-1">
          <AddEmployeeWizard 
            existingProgress={editingApplication}
            onComplete={() => {
              setCurrentView('dashboard')
              setActiveMenuItem('dashboard')
              setEditingApplication(undefined)
            }}
            onCancel={() => {
              setCurrentView('dashboard')
              setActiveMenuItem('dashboard')
              setEditingApplication(undefined)
            }}
          />
        </div>
      </div>
    )
  }

  if (currentView === 'pending-applications') {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Same as main dashboard */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
          {/* Logo & Company */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-semibold text-gray-900">DigiDaga</h2>
                  <p className="text-xs text-gray-500">İK Yönetim Sistemi</p>
          </div>
              )}
        </div>
      </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {getInitials(employee.first_name, employee.last_name, employee.email)}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName(userRole)}</p>
          </div>
              )}
        </div>
      </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = activeMenuItem === item.id
          return (
            <button
                  key={item.id}
              onClick={() => {
                    setActiveMenuItem(item.id)
                    if (item.id === 'pending') {
                      setCurrentView('pending-applications')
                    } else if (item.id === 'recruitment') {
                      setCurrentView('add-employee')
                    } else {
                      setCurrentView('dashboard')
                    }
                  }}
                  className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={!sidebarOpen ? item.title : undefined}
                >
                  <item.icon className={`${!sidebarOpen ? 'h-6 w-6 mx-auto' : 'h-5 w-5'} ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.title}</span>
                  )}
            </button>
          )
        })}
      </nav>

          {/* Sidebar Toggle & Logout */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-start space-x-3' : 'justify-center'} px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors`}
            >
              <Menu className={`${!sidebarOpen ? 'h-6 w-6' : 'h-5 w-5'}`} />
              {sidebarOpen && <span className="font-medium">Küçült</span>}
            </button>
            
            {sidebarOpen && (
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <LogOut className={`${!sidebarOpen ? 'h-6 w-6' : 'h-5 w-5'}`} />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            )}
            
            {!sidebarOpen && (
              <button className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <LogOut className={`${!sidebarOpen ? 'h-6 w-6' : 'h-5 w-5'}`} />
              </button>
            )}
      </div>
    </div>

        {/* Main Content - Pending Applications */}
        <div className="flex-1">
          <PendingApplications
            onEditApplication={(application) => {
              setEditingApplication(application)
              setCurrentView('add-employee')
              setActiveMenuItem('recruitment')
            }}
            onCreateNew={() => {
              setEditingApplication(undefined)
              setCurrentView('add-employee')
              setActiveMenuItem('recruitment')
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Modern Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo & Company */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-semibold text-gray-900">DigiDaga</h2>
                <p className="text-xs text-gray-500">İK Yönetim Sistemi</p>
            </div>
            )}
                  </div>
                </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {getInitials(employee.first_name, employee.last_name, employee.email)}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(userRole)}</p>
              </div>
            )}
      </div>
    </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeMenuItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenuItem(item.id)
                  if (item.id === 'pending') {
                    setCurrentView('pending-applications')
                  } else if (item.id === 'recruitment') {
                    setCurrentView('add-employee')
                  } else {
                    setCurrentView('dashboard')
                  }
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.title : undefined}
              >
                <item.icon className={`${!sidebarOpen ? 'h-6 w-6 mx-auto' : 'h-5 w-5'} ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.title}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Toggle & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start space-x-3' : 'justify-center'} px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors`}
          >
            <Menu className={`${!sidebarOpen ? 'h-6 w-6' : 'h-5 w-5'}`} />
            {sidebarOpen && <span className="font-medium">Küçült</span>}
          </button>
          
          {sidebarOpen && (
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <LogOut className={`${!sidebarOpen ? 'h-6 w-6' : 'h-5 w-5'}`} />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          )}
          
          {!sidebarOpen && (
            <button className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <LogOut className={`${!sidebarOpen ? 'h-6 w-6' : 'h-5 w-5'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">{format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr })}</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Role Badge */}
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {getRoleDisplayName(userRole)}
              </Badge>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">3</span>
                </div>
                      </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              Hoş geldiniz, {displayName}!
            </h2>
            <p className="text-gray-600">İK sistemine genel bakış ve son aktiviteler</p>
          </div>

          {/* Stats Grid - Role Based */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {(userRole === 'admin' || userRole.startsWith('hr')) && (
              <>
                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">+12%</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Toplam Çalışan</p>
                    <p className="text-2xl font-semibold text-gray-900">{'totalEmployees' in stats ? stats.totalEmployees : 0}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">%95</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Aktif Çalışan</p>
                    <p className="text-2xl font-semibold text-gray-900">{'activeEmployees' in stats ? stats.activeEmployees : 0}</p>
                  </div>
                </div>
              </>
            )}

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Yeni</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Bekleyen Talepler</p>
                <p className="text-2xl font-semibold text-gray-900">{'pendingRequests' in stats ? stats.pendingRequests : stats.myRequests}</p>
              </div>
            </div>

            {userRole.includes('manager') && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Bu Ay</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Yeni İşe Alınan</p>
                  <p className="text-2xl font-semibold text-gray-900">{'thisMonthHires' in stats ? stats.thisMonthHires : 0}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions - Role Based */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Hızlı İşlemler</h3>
                  <p className="text-sm text-gray-500">Rolünüze uygun işlemler</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* HR Manager/Admin Actions */}
                    {hasPermission('manage_employees') && (
                      <>
                        <button 
                          onClick={() => {
                            setEditingApplication(undefined)
                            setCurrentView('add-employee')
                            setActiveMenuItem('recruitment')
                          }}
                          className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          <UserPlus className="h-8 w-8 mb-3" />
                          <div className="text-base font-semibold mb-1">Yeni Çalışan</div>
                          <div className="text-blue-100 text-sm opacity-90">Sisteme kayıt et</div>
                        </button>

                        <button 
                          onClick={() => {
                            setCurrentView('pending-applications')
                            setActiveMenuItem('pending')
                          }}
                          className="group relative bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          <Clock className="h-8 w-8 mb-3" />
                          <div className="text-base font-semibold mb-1">Bekleyen İşlemler</div>
                          <div className="text-orange-100 text-sm opacity-90">Devam eden süreçler</div>
                        </button>
                      </>
                    )}
                    
                    <button className="group relative bg-white hover:bg-gray-50 rounded-xl p-6 text-left transition-all duration-300 border border-gray-200 hover:border-gray-300 transform hover:scale-[1.02]">
                      <Calendar className="h-8 w-8 mb-3 text-gray-600" />
                      <div className="text-base font-semibold text-gray-900 mb-1">İzin Talebi</div>
                      <div className="text-gray-500 text-sm">Yeni talep oluştur</div>
                    </button>
                    
                    {(userRole === 'admin' || userRole.startsWith('hr')) && (
                      <>
                        <button className="group relative bg-white hover:bg-gray-50 rounded-xl p-6 text-left transition-all duration-300 border border-gray-200 hover:border-gray-300 transform hover:scale-[1.02]">
                          <BarChart3 className="h-8 w-8 mb-3 text-gray-600" />
                          <div className="text-base font-semibold text-gray-900 mb-1">Raporlar</div>
                          <div className="text-gray-500 text-sm">Analiz ve istatistikler</div>
                        </button>
                        
                        <button className="group relative bg-white hover:bg-gray-50 rounded-xl p-6 text-left transition-all duration-300 border border-gray-200 hover:border-gray-300 transform hover:scale-[1.02]">
                          <DollarSign className="h-8 w-8 mb-3 text-gray-600" />
                          <div className="text-base font-semibold text-gray-900 mb-1">Bordro</div>
                          <div className="text-gray-500 text-sm">Maaş işlemleri</div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Son Aktiviteler</h3>
                  <p className="text-sm text-gray-500">Sistem hareketleri</p>
                </div>
          <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-relaxed">{activity.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    Tümünü Görüntüle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 