'use client'

import { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  Badge as BadgeIcon,
  CreditCard,
  Clock,
  TrendingUp,
  Settings,
  Edit3,
  DollarSign,
  FileText,
  Plus,
  Users,
  Bell,
  LogOut,
  Menu,
  Home
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import Link from 'next/link'

// Mock Data
const mockEmployee = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  employee_id: 'EMP-2024-001',
  first_name: 'Fatma',
  last_name: 'Demir',
  email: 'fatma.demir@demo-hrms.com',
  phone: '+90 532 234 56 78',
  hire_date: '2023-03-15',
  salary: 85000,
  status: 'active' as const,
  department: {
    id: '1',
    name: 'İnsan Kaynakları'
  },
  position: {
    id: '1', 
    title: 'İK Uzmanı'
  },
  manager: {
    id: '2',
    first_name: 'Mehmet',
    last_name: 'Yılmaz'
  }
}

const mockSubscription = {
  id: 'sub-1',
  plan_name: 'Professional',
  plan_description: 'Büyüyen şirketler için gelişmiş özellikler',
  status: 'active' as const,
  credits_remaining: 450,
  credits_used: 50,
  credits_included: 500,
  current_period_end: '2024-07-27',
  billing_cycle: 'monthly' as const,
  price_monthly: 79.99,
  price_yearly: 799.99,
  features: [
    'Tüm Starter Özellikler',
    'Bordro Yönetimi', 
    'Performans Değerlendirme',
    'Gelişmiş Raporlar',
    'API Erişimi',
    'Öncelikli Destek'
  ]
}

const mockCreditTransactions = [
  {
    id: '1',
    transaction_type: 'usage' as const,
    credits_amount: -10,
    description: 'Bordro işleme',
    feature_used: 'payroll_processing',
    created_at: '2024-05-27T10:30:00Z'
  },
  {
    id: '2', 
    transaction_type: 'usage' as const,
    credits_amount: -5,
    description: 'Performans raporu oluşturma',
    feature_used: 'report_generation',
    created_at: '2024-05-26T14:15:00Z'
  },
  {
    id: '3',
    transaction_type: 'bonus' as const,
    credits_amount: 25,
    description: 'Aylık bonus kredisi',
    feature_used: undefined,
    created_at: '2024-05-25T09:00:00Z'
  },
  {
    id: '4',
    transaction_type: 'usage' as const,
    credits_amount: -3,
    description: 'Çalışan raporu',
    feature_used: 'employee_report',
    created_at: '2024-05-24T16:45:00Z'
  }
]

const mockLeaveRequests = [
  {
    id: '1',
    employee_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    leave_type: 'annual' as const,
    start_date: '2024-06-10',
    end_date: '2024-06-14',
    days_requested: 5,
    reason: 'Yaz tatili',
    status: 'approved' as const,
    created_at: '2024-05-20T09:00:00Z'
  },
  {
    id: '2',
    employee_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    leave_type: 'sick' as const,
    start_date: '2024-05-22',
    end_date: '2024-05-22',
    days_requested: 1,
    reason: 'Hastalık',
    status: 'approved' as const,
    created_at: '2024-05-21T08:30:00Z'
  },
  {
    id: '3',
    employee_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    leave_type: 'personal' as const,
    start_date: '2024-06-03',
    end_date: '2024-06-03',
    days_requested: 1,
    reason: 'Kişisel işler',
    status: 'pending' as const,
    created_at: '2024-05-27T11:00:00Z'
  }
]

const mockStats = {
  totalLeaveRequests: 8,
  pendingLeaveRequests: 1,
  currentMonthAttendance: 18,
  totalWorkingDays: 22,
  creditsRemaining: 450,
  planName: 'Professional'
}

const mockPayroll = {
  id: '1',
  employee_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  pay_period_start: '2024-05-01',
  pay_period_end: '2024-05-31',
  gross_pay: 85000,
  net_pay: 63750,
  status: 'paid' as const
}

const navigation = [
  { name: 'Dashboard', href: '/demo', icon: Home },
  { name: 'İzinlerim', href: '/demo', icon: Calendar },
  { name: 'Devam/Devamsızlık', href: '/demo', icon: Clock },
  { name: 'Bordro', href: '/demo', icon: DollarSign },
  { name: 'Belgelerim', href: '/demo', icon: FileText },
  { name: 'Profil', href: '/demo', icon: User },
]

export function DemoOverview() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Aktif',
      approved: 'Onaylandı',
      pending: 'Beklemede',
      rejected: 'Reddedildi'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getLeaveTypeLabel = (type: string) => {
    const labels = {
      annual: 'Yıllık İzin',
      sick: 'Hastalık İzni',
      maternity: 'Doğum İzni',
      personal: 'Mazeret İzni',
      other: 'Diğer'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'usage':
        return '↓'
      case 'refund':
        return '↑'
      case 'bonus':
        return '🎁'
      case 'purchase':
        return '💳'
      default:
        return '•'
    }
  }

  const attendancePercentage = Math.round((mockStats.currentMonthAttendance / mockStats.totalWorkingDays) * 100)
  const creditUsagePercentage = Math.round((mockSubscription.credits_used / mockSubscription.credits_included) * 100)
  const daysUntilRenewal = Math.max(0, Math.ceil((new Date(mockSubscription.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))

  const Sidebar = ({ className = '' }: { className?: string }) => (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HR</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Portal</span>
          <Badge className="ml-2 bg-green-100 text-green-800">DEMO</Badge>
        </div>
      </div>

      {/* Employee Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(mockEmployee.first_name, mockEmployee.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {mockEmployee.first_name} {mockEmployee.last_name}
            </p>
            <p className="text-xs text-gray-500">{mockEmployee.position?.title}</p>
            <Badge variant="secondary" className="text-xs mt-1">
              {mockEmployee.employee_id}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = (item.name === 'Dashboard' && currentView === 'dashboard') || 
                          (item.name === 'Profil' && currentView === 'profile')
          return (
            <button
              key={item.name}
              onClick={() => {
                if (item.name === 'Dashboard') setCurrentView('dashboard')
                else if (item.name === 'Profil') setCurrentView('profile')
                setSidebarOpen(false)
              }}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left
                ${isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900"
          onClick={() => window.location.href = '/'}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Demo'dan Çık
        </Button>
      </div>
    </div>
  )

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Hoş geldin, {mockEmployee.first_name}! 👋
        </h1>
        <p className="text-blue-100">
          Bugün {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })} - DEMO MODE
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İzin</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalLeaveRequests}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.pendingLeaveRequests} beklemede
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay Devam</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.currentMonthAttendance}/{mockStats.totalWorkingDays} gün
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Son Bordro</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{mockPayroll.net_pay.toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(mockPayroll.pay_period_end), 'MMM yyyy', { locale: tr })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kredi Bakiyesi</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.creditsRemaining}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockStats.planName} planı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>
              Sık kullanılan işlemlerinizi hızla gerçekleştirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Yeni İzin Talebi
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Devam/Devamsızlık Görüntüle
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Bordro Geçmişi
            </Button>
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Son İzin Taleplerim</CardTitle>
            <CardDescription>
              En son oluşturduğunuz izin talepleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLeaveRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">
                        {getLeaveTypeLabel(request.leave_type)}
                      </p>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {format(new Date(request.start_date), 'dd MMM', { locale: tr })} - {' '}
                      {format(new Date(request.end_date), 'dd MMM yyyy', { locale: tr })}
                      {' '}({request.days_requested} gün)
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                Tümünü Görüntüle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const ProfileView = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {getInitials(mockEmployee.first_name, mockEmployee.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {mockEmployee.first_name} {mockEmployee.last_name}
                </h1>
                <Badge variant="secondary">{mockEmployee.employee_id}</Badge>
                <Badge className="bg-green-100 text-green-800">DEMO</Badge>
              </div>
              <p className="text-lg text-gray-600 mb-1">{mockEmployee.position?.title}</p>
              <p className="text-sm text-gray-500">{mockEmployee.department?.name}</p>
            </div>
            <Button variant="outline" size="sm">
              <Edit3 className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Kişisel Bilgiler
            </CardTitle>
            <CardDescription>
              Temel profil ve iletişim bilgileriniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{mockEmployee.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Telefon</p>
                <p className="text-sm text-gray-600">{mockEmployee.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">İşe Başlama Tarihi</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(mockEmployee.hire_date), 'dd MMMM yyyy', { locale: tr })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BadgeIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Durum</p>
                <Badge className={getStatusColor(mockEmployee.status)}>
                  {getStatusLabel(mockEmployee.status)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Yönetici</p>
                <p className="text-sm text-gray-600">
                  {mockEmployee.manager.first_name} {mockEmployee.manager.last_name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Abonelik Bilgileri
            </CardTitle>
            <CardDescription>
              Mevcut plan ve kredi durumunuz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{mockSubscription.plan_name}</p>
                <p className="text-sm text-gray-600">{mockSubscription.plan_description}</p>
              </div>
              <Badge className={getStatusColor(mockSubscription.status)}>
                {getStatusLabel(mockSubscription.status)}
              </Badge>
            </div>

            <Separator />

            {/* Credits Usage */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Kredi Kullanımı</span>
                <span className="text-sm text-gray-600">
                  {mockSubscription.credits_remaining} / {mockSubscription.credits_included}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${creditUsagePercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                %{creditUsagePercentage} kullanıldı
              </p>
            </div>

            <Separator />

            {/* Renewal Info */}
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Yenileme Tarihi</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(mockSubscription.current_period_end), 'dd MMMM yyyy', { locale: tr })}
                  {daysUntilRenewal <= 7 && (
                    <span className="ml-2 text-amber-600">
                      ({daysUntilRenewal} gün kaldı)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Aboneliği Yönet
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Credit Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Son Kredi Hareketleri
          </CardTitle>
          <CardDescription>
            Son kredi işlemleriniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCreditTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm', { locale: tr })}
                      {transaction.feature_used && ` • ${transaction.feature_used}`}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  transaction.credits_amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.credits_amount > 0 ? '+' : ''}{transaction.credits_amount}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentView === 'dashboard' ? 'Dashboard' : 'Profil'} - DEMO
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">
                  {mockStats.creditsRemaining} kredi
                </span>
              </div>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {getInitials(mockEmployee.first_name, mockEmployee.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">
                      {mockEmployee.first_name} {mockEmployee.last_name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Demo Hesap</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCurrentView('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Ayarlar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/'}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Demo'dan Çık
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentView === 'dashboard' ? <DashboardView /> : <ProfileView />}
          </div>
        </main>
      </div>
    </div>
  )
} 