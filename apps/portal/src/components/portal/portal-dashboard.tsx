'use client'

import { useState } from 'react'
import { 
  Building2, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  CreditCard,
  CheckCircle,
  Clock,
  ExternalLink,
  Wrench
} from 'lucide-react'
import { sharedAuthManager } from '@/lib/shared-auth'

interface Application {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  url: string
  status: 'active' | 'maintenance' | 'disabled'
  category: 'hr' | 'finance' | 'operations' | 'analytics'
  version: string
  lastUpdated: string
}

const applications: Application[] = [
  {
    id: 'hrms',
    name: 'İnsan Kaynakları',
    description: 'Çalışan yönetimi, bordro, izin takibi ve IK süreçleri',
    icon: Users,
    url: 'http://localhost:{process.env.NEXT_PUBLIC_HRMS_PORT || 3002}',
    status: 'active',
    category: 'hr',
    version: '1.0.0',
    lastUpdated: '2024-05-27'
  },
  {
    id: 'finance',
    name: 'Finans Yönetimi', 
    description: 'Muhasebe, bütçe planlama ve finansal raporlama',
    icon: CreditCard,
    url: '/apps/finance',
    status: 'maintenance',
    category: 'finance',
    version: '0.9.5',
    lastUpdated: '2024-05-25'
  },
  {
    id: 'analytics',
    name: 'İş Zekası',
    description: 'Veri analizi, dashboard\'lar ve raporlama araçları',
    icon: BarChart3,
    url: '/apps/analytics',
    status: 'active',
    category: 'analytics',
    version: '2.1.0',
    lastUpdated: '2024-05-26'
  },
  {
    id: 'operations',
    name: 'Operasyon Yönetimi',
    description: 'Süreç yönetimi, proje takibi ve kaynak planlaması',
    icon: Settings,
    url: '/apps/operations',
    status: 'disabled',
    category: 'operations',
    version: '0.5.0',
    lastUpdated: '2024-05-20'
  }
]

const statusConfig = {
  active: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    text: 'Aktif'
  },
  maintenance: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Wrench,
    text: 'Bakımda'
  },
  disabled: {
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
    text: 'Devre Dışı'
  }
}

const categoryConfig = {
  hr: { name: 'İnsan Kaynakları', color: 'bg-blue-50 border-blue-200' },
  finance: { name: 'Finans', color: 'bg-green-50 border-green-200' },
  analytics: { name: 'Analitik', color: 'bg-purple-50 border-purple-200' },
  operations: { name: 'Operasyon', color: 'bg-orange-50 border-orange-200' }
}

export function PortalDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Mock organization credit data
  const mockCredits = {
    remaining: 450,
    total: 500,
    plan: 'Professional',
    renewalDate: '2024-06-27',
    usage: [
      { id: 1, date: '2024-05-27', description: 'HRMS Bordro İşlemi', amount: -15, feature: 'payroll' },
      { id: 2, date: '2024-05-26', description: 'Rapor Oluşturma', amount: -5, feature: 'reports' },
      { id: 3, date: '2024-05-25', description: 'Bonus Kredi', amount: +50, feature: 'bonus' },
      { id: 4, date: '2024-05-24', description: 'HRMS İzin İşlemi', amount: -3, feature: 'leave' }
    ]
  }

  const filteredApps = selectedCategory === 'all' 
    ? applications 
    : applications.filter(app => app.category === selectedCategory)

  const handleAppClick = (app: Application) => {
    if (app.status === 'maintenance') {
      alert('Bu uygulama şu anda bakımda. Lütfen daha sonra tekrar deneyin.')
      return
    }
    if (app.status === 'disabled') {
      alert('Bu uygulama şu anda devre dışı.')
      return
    }
    
    // External application redirect
    if (app.id === 'hrms') {
      // Get current session and pass as URL parameter
      const currentSession = sharedAuthManager.getSharedSession()
      if (currentSession) {
        const tokenParam = encodeURIComponent(JSON.stringify(currentSession))
        const hrmsUrl = process.env.NEXT_PUBLIC_HRMS_URL || 'http://localhost:4002'
        window.location.href = `${hrmsUrl}?session=${tokenParam}`
      } else {
        // No session found, redirect to auth
        window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4000'
      }
    } else {
      // Diğer uygulamalar için genel yönlendirme
      window.location.href = app.url
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">Kikos Portal</h1>
                <p className="text-sm text-gray-500">portal.kikos.app</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                <CreditCard className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">
                  {mockCredits.remaining}/{mockCredits.total} kredi
                </span>
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-blue-700 font-medium">Bahadır Arda</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hoş geldiniz, Bahadır! 👋
          </h2>
          <p className="text-gray-600">
            Bugün {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedCategory === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tüm Uygulamalar
            </button>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedCategory === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {config.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => {
            const StatusIcon = statusConfig[app.status].icon
            const Icon = app.icon
            
            return (
              <div
                key={app.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                  categoryConfig[app.category].color
                } ${app.status === 'active' ? 'hover:scale-105' : ''}`}
                onClick={() => handleAppClick(app)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.name}
                        </h3>
                        <p className="text-sm text-gray-500">v{app.version}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusConfig[app.status].color
                    }`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[app.status].text}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {app.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Güncelleme: {new Date(app.lastUpdated).toLocaleDateString('tr-TR')}
                    </span>
                    {app.status === 'active' && (
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Credit Management */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Credit Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Kredi Yönetimi
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Kullanılan Kredi</span>
                <span className="text-sm text-gray-600">
                  {mockCredits.total - mockCredits.remaining} / {mockCredits.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((mockCredits.total - mockCredits.remaining) / mockCredits.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{mockCredits.plan} Planı</span>
                <span>Yenileme: {new Date(mockCredits.renewalDate).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="pt-2">
                <p className="text-2xl font-bold text-blue-600">
                  {mockCredits.remaining} kredi kaldı
                </p>
              </div>
            </div>
          </div>

          {/* Recent Credit Usage */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Kredi Hareketleri</h3>
            <div className="space-y-3">
              {mockCredits.usage.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('tr-TR')} • {transaction.feature}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Sistem Durumu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">Aktif Uygulamalar</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'active').length}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Wrench className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-yellow-800">Bakımda</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'maintenance').length}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Devre Dışı</p>
              <p className="text-2xl font-bold text-gray-600">
                {applications.filter(app => app.status === 'disabled').length}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 