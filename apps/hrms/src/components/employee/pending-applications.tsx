'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Eye,
  Edit,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Calendar,
  Building,
  Phone,
  FileText,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Users,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ApplicationProgress {
  id: string
  employee_email: string
  employee_name: string
  current_step: number
  form_data: any
  status: 'draft' | 'form_sent' | 'form_completed' | 'review_pending' | 'completed'
  created_at: string
  updated_at: string
  hr_manager_id: string
  hr_manager_name: string
  form_url?: string
  form_completion_percentage?: number
  last_activity?: string
  department_name?: string
  position_title?: string
  notes_count?: number
}

interface PendingApplicationsProps {
  onEditApplication: (application: ApplicationProgress) => void
  onCreateNew: () => void
}

const statusConfig = {
  draft: {
    label: 'Taslak',
    color: 'bg-gray-100 text-gray-800',
    icon: FileText,
    description: 'HR tarafından oluşturuluyor'
  },
  form_sent: {
    label: 'Form Gönderildi',
    color: 'bg-blue-100 text-blue-800',
    icon: Send,
    description: 'Çalışan formu dolduruyor'
  },
  form_completed: {
    label: 'Form Tamamlandı',
    color: 'bg-yellow-100 text-yellow-800',
    icon: CheckCircle,
    description: 'HR incelemesi bekleniyor'
  },
  review_pending: {
    label: 'İnceleme Bekliyor',
    color: 'bg-orange-100 text-orange-800',
    icon: Eye,
    description: 'Nihai onay süreci'
  },
  completed: {
    label: 'Tamamlandı',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Başarıyla tamamlandı'
  }
}

const steps = [
  'Kişisel Bilgiler',
  'İletişim & Acil Durum',
  'İş Bilgileri',
  'Finansal Bilgiler',
  'Form Gönderimi'
]

export function PendingApplications({ onEditApplication, onCreateNew }: PendingApplicationsProps) {
  const [applications, setApplications] = useState<ApplicationProgress[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApplicationProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updated_at')
  const { toast } = useToast()
  // const supabase = createClientComponentClient()

  // Mock data - in real app this would come from Supabase
  const mockApplications: ApplicationProgress[] = [
    {
      id: 'app_001',
      employee_email: 'ahmet.yilmaz@example.com',
      employee_name: 'Ahmet Yılmaz',
      current_step: 2,
      form_data: {
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        email: 'ahmet.yilmaz@example.com',
        department_id: '2',
        position_id: '2'
      },
      status: 'form_sent',
      created_at: '2024-05-27T10:30:00Z',
      updated_at: '2024-05-27T14:15:00Z',
      hr_manager_id: 'hr_001',
      hr_manager_name: 'Bahadır Arda',
      form_url: 'https://forms.kikos.app/employee-form/app_001',
      form_completion_percentage: 40,
      last_activity: '2 saat önce',
      department_name: 'Yazılım Geliştirme',
      position_title: 'Frontend Developer',
      notes_count: 2
    },
    {
      id: 'app_002',
      employee_email: 'elif.kaya@example.com',
      employee_name: 'Elif Kaya',
      current_step: 5,
      form_data: {
        first_name: 'Elif',
        last_name: 'Kaya',
        email: 'elif.kaya@example.com',
        department_id: '3',
        position_id: '4'
      },
      status: 'form_completed',
      created_at: '2024-05-26T09:00:00Z',
      updated_at: '2024-05-27T16:30:00Z',
      hr_manager_id: 'hr_001',
      hr_manager_name: 'Bahadır Arda',
      form_completion_percentage: 100,
      last_activity: '30 dakika önce',
      department_name: 'Pazarlama',
      position_title: 'Pazarlama Uzmanı',
      notes_count: 0
    },
    {
      id: 'app_003',
      employee_email: 'mehmet.ozkan@example.com',
      employee_name: 'Mehmet Özkan',
      current_step: 1,
      form_data: {
        first_name: 'Mehmet',
        last_name: 'Özkan',
        email: 'mehmet.ozkan@example.com'
      },
      status: 'draft',
      created_at: '2024-05-27T08:45:00Z',
      updated_at: '2024-05-27T08:45:00Z',
      hr_manager_id: 'hr_001',
      hr_manager_name: 'Bahadır Arda',
      last_activity: '6 saat önce',
      notes_count: 1
    }
  ]

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    filterAndSortApplications()
  }, [applications, searchTerm, statusFilter, sortBy])

  const loadApplications = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual Supabase query
      await new Promise(resolve => setTimeout(resolve, 1000))
      setApplications(mockApplications)
    } catch (error) {
      console.error('Error loading applications:', error)
      toast({
        title: "❌ Yükleme Hatası",
        description: "Başvurular yüklenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortApplications = () => {
    let filtered = applications

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position_title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated_at':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'name':
          return a.employee_name.localeCompare(b.employee_name)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    setFilteredApplications(filtered)
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Bu başvuruyu silmek istediğinizden emin misiniz?')) return

    try {
      // Mock delete operation
      setApplications(prev => prev.filter(app => app.id !== applicationId))
      toast({
        title: "🗑️ Başvuru Silindi",
        description: "Başvuru başarıyla silindi.",
      })
    } catch (error) {
      console.error('Error deleting application:', error)
      toast({
        title: "❌ Silme Hatası",
        description: "Başvuru silinirken bir hata oluştu.",
        variant: "destructive"
      })
    }
  }

  const handleResendForm = async (application: ApplicationProgress) => {
    try {
      // Mock resend operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "📧 Form Yeniden Gönderildi",
        description: `${application.employee_name} adresine form yeniden gönderildi.`,
      })
    } catch (error) {
      console.error('Error resending form:', error)
      toast({
        title: "❌ Gönderim Hatası",
        description: "Form yeniden gönderilemedi.",
        variant: "destructive"
      })
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Az önce'
    if (diffInHours < 24) return `${diffInHours} saat önce`
    return `${Math.floor(diffInHours / 24)} gün önce`
  }

  const getStepProgress = (currentStep: number) => {
    return Math.round((currentStep / 5) * 100)
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Bekleyen başvurular yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header - Dashboard Style */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">Bekleyen İşe Alımlar</h1>
            <p className="text-gray-600">Devam eden çalışan onboarding süreçlerini takip edin</p>
          </div>
          <Button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Çalışan Ekle
          </Button>
        </div>

        {/* Stats Cards - Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = applications.filter(app => app.status === status).length
            return (
              <div key={status} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <config.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className={`${config.color} text-xs`}>
                    {config.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{config.description}</p>
                  <p className="text-2xl font-semibold text-gray-900">{count}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters - Dashboard Style */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Çalışan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Durum Filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              {Object.entries(statusConfig).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">Son Güncelleme</SelectItem>
              <SelectItem value="created_at">Oluşturma Tarihi</SelectItem>
              <SelectItem value="name">İsim</SelectItem>
              <SelectItem value="status">Durum</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={loadApplications}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Applications List - Dashboard Style */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {filteredApplications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Bekleyen başvuru bulunamadı
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Arama kriterlerinize uygun başvuru bulunamadı.'
                    : 'Henüz devam eden bir işe alım süreci bulunmuyor.'
                  }
                </p>
                <Button
                  onClick={onCreateNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Çalışan Ekle
                </Button>
              </div>
            </motion.div>
          ) : (
            filteredApplications.map((application, index) => {
              const StatusIcon = statusConfig[application.status].icon
              const stepProgress = getStepProgress(application.current_step)
              
              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        {/* Avatar */}
                        <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="h-8 w-8 text-blue-600" />
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {application.employee_name}
                            </h3>
                            <Badge className={`${statusConfig[application.status].color}`}>
                              <StatusIcon className="h-4 w-4 mr-2" />
                              {statusConfig[application.status].label}
                            </Badge>
                            {application.notes_count && application.notes_count > 0 && (
                              <Badge variant="outline" className="text-gray-600">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {application.notes_count} not
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{application.employee_email}</span>
                            </div>
                            {application.department_name && (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                <span>{application.department_name}</span>
                              </div>
                            )}
                            {application.position_title && (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>{application.position_title}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{application.last_activity || getTimeAgo(application.updated_at)}</span>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 font-medium">
                                  {steps[application.current_step - 1] || 'Tamamlandı'}
                                </span>
                                <span className="text-gray-600">{stepProgress}%</span>
                              </div>
                              <Progress value={stepProgress} className="h-2" />
                            </div>
                            {application.form_completion_percentage && application.status === 'form_sent' && (
                              <div className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg">
                                Form %{application.form_completion_percentage}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 ml-6">
                        {application.status === 'form_sent' && application.form_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => window.open(application.form_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Formu Görüntüle
                          </Button>
                        )}
                        
                        {application.status === 'form_sent' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => handleResendForm(application)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Yeniden Gönder
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => onEditApplication(application)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteApplication(application.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Summary Footer */}
      {filteredApplications.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>
            Toplam {filteredApplications.length} başvuru gösteriliyor
            {applications.length !== filteredApplications.length && ` (${applications.length} toplam)`}
          </p>
        </div>
      )}
    </div>
  )
} 