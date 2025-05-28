'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building2, 
  Badge as BadgeIcon,
  CreditCard,
  Clock,
  TrendingUp,
  Settings,
  Edit3,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import { 
  getCurrentEmployee, 
  getOrganizationSubscription,
  getCreditTransactions,
  type Employee 
} from '@/lib/supabase'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface SubscriptionInfo {
  id: string
  plan_name: string
  plan_description: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused'
  credits_remaining: number
  credits_used: number
  credits_included: number
  current_period_end: string
  billing_cycle: 'monthly' | 'yearly'
  price_monthly: number
  price_yearly: number
  features: string[]
}

interface CreditTransaction {
  id: string
  transaction_type: 'usage' | 'refund' | 'bonus' | 'purchase'
  credits_amount: number
  description: string
  feature_used?: string
  created_at: string
}

export function ProfileOverview() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const employeeData = await getCurrentEmployee()
        if (!employeeData) return

        setEmployee(employeeData)

        // Fetch subscription info
        const subscriptionData = await getOrganizationSubscription()
        setSubscription(subscriptionData)

        // Fetch recent credit transactions
        const transactions = await getCreditTransactions()
        setCreditTransactions(transactions.slice(0, 10)) // Last 10 transactions
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'trialing':
        return 'bg-blue-100 text-blue-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Aktif',
      trialing: 'Deneme',
      past_due: 'Vadesi Geçmiş',
      cancelled: 'İptal Edildi',
      paused: 'Durakladı'
    }
    return labels[status as keyof typeof labels] || status
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

  const creditUsagePercentage = subscription 
    ? Math.round((subscription.credits_used / subscription.credits_included) * 100)
    : 0

  const daysUntilRenewal = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Profil bilgisi bulunamadı
        </h3>
        <p className="text-gray-500">
          Lütfen yöneticinizle iletişime geçin.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back to Portal Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kikos Portal'a Dön</span>
        </button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {getInitials(employee.first_name, employee.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {employee.first_name} {employee.last_name}
                </h1>
                <Badge variant="secondary">{employee.employee_id}</Badge>
                <Badge className="bg-purple-100 text-purple-800">Portal User</Badge>
              </div>
              <p className="text-lg text-gray-600 mb-1">{employee.position?.title}</p>
              <p className="text-sm text-gray-500">{employee.department?.name}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              {isEditing ? 'İptal' : 'Düzenle'}
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
              Kikos Portal platformundaki temel bilgileriniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">Telefon</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={employee.phone || ''}
                    className="text-sm text-gray-600 border rounded px-2 py-1 w-full"
                    placeholder="Telefon numaranızı girin"
                  />
                ) : (
                  <p className="text-sm text-gray-600">{employee.phone || 'Belirtilmemiş'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">İşe Başlama Tarihi</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(employee.hire_date), 'dd MMMM yyyy', { locale: tr })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BadgeIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Durum</p>
                <Badge className={employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </div>

            {employee.manager && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Yönetici</p>
                  <p className="text-sm text-gray-600">
                    {employee.manager.first_name} {employee.manager.last_name}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          {isEditing && (
            <div className="px-6 pb-4">
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => {
                  // TODO: Implement save functionality
                  setIsEditing(false)
                }}>
                  Kaydet
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  İptal
                </Button>
              </div>
            </div>
          )}
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
            {subscription ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{subscription.plan_name}</p>
                    <p className="text-sm text-gray-600">{subscription.plan_description}</p>
                  </div>
                  <Badge className={getStatusColor(subscription.status)}>
                    {getStatusLabel(subscription.status)}
                  </Badge>
                </div>

                <Separator />

                {/* Credits Usage */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Kredi Kullanımı</span>
                    <span className="text-sm text-gray-600">
                      {subscription.credits_remaining} / {subscription.credits_included}
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
                      {format(new Date(subscription.current_period_end), 'dd MMMM yyyy', { locale: tr })}
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
              </>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Abonelik bilgisi bulunamadı</p>
                <Button size="sm" className="mt-2">
                  Plan Seç
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Credit Transactions */}
      {creditTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Son Kredi Hareketleri
            </CardTitle>
            <CardDescription>
              Son 10 kredi işleminiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {creditTransactions.map((transaction) => (
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
      )}
    </div>
  )
} 