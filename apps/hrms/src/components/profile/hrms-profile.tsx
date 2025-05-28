'use client'

import { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  Badge as BadgeIcon,
  Edit3,
  ArrowLeft,
  Home
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  hire_date: string
  salary?: number
  status: 'active' | 'inactive' | 'terminated'
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
}

interface HRMSProfileProps {
  employee: Employee
}

export function HRMSProfile({ employee }: HRMSProfileProps) {
  const [isEditing, setIsEditing] = useState(false)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Aktif',
      inactive: 'Pasif',
      terminated: 'Ayrılmış'
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>HRMS Ana Sayfa</span>
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">HR</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Profil Yönetimi</h1>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800">hrms.kikos.app</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
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
                    <Badge className="bg-green-100 text-green-800">HRMS Employee</Badge>
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

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Kişisel Bilgiler
              </CardTitle>
              <CardDescription>
                HRMS sistemindeki çalışan bilgileriniz
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
                  <p className="text-sm font-medium">Çalışan Durumu</p>
                  <Badge className={getStatusColor(employee.status)}>
                    {getStatusLabel(employee.status)}
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

          {/* HRMS Specific Info */}
          <Card>
            <CardHeader>
              <CardTitle>HRMS Platform Bilgileri</CardTitle>
              <CardDescription>
                Bu platform üzerindeki özel bilgileriniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Platform</h4>
                  <p className="text-sm text-blue-700">hrms.kikos.app</p>
                  <p className="text-xs text-blue-600 mt-1">Standalone HRMS</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Erişim Seviyesi</h4>
                  <p className="text-sm text-green-700">Employee</p>
                  <p className="text-xs text-green-600 mt-1">Standard HR Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 