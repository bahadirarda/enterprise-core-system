'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Activity, Wifi, Database, Server, Globe, Clock, TrendingUp, AlertCircle } from 'lucide-react'

interface ServiceStatus {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage'
  uptime: number
  responseTime: number
  lastIncident?: string
  description: string
  endpoint?: string
}

interface SystemMetrics {
  totalUptime: number
  totalRequests: number
  errorRate: number
  avgResponseTime: number
  activeConnections: number
}

const mockServices: ServiceStatus[] = [
  {
    id: 'api',
    name: 'HRMS API',
    status: 'operational',
    uptime: 99.97,
    responseTime: 120,
    description: 'Ana HRMS API servisleri',
    endpoint: '/api/health'
  },
  {
    id: 'auth',
    name: 'Authentication Service',
    status: 'operational',
    uptime: 99.95,
    responseTime: 85,
    description: 'Kullanıcı kimlik doğrulama servisi',
    endpoint: '/auth/health'
  },
  {
    id: 'database',
    name: 'Database',
    status: 'operational',
    uptime: 99.99,
    responseTime: 45,
    description: 'Ana PostgreSQL veritabanı',
    endpoint: '/db/health'
  },
  {
    id: 'storage',
    name: 'File Storage',
    status: 'degraded',
    uptime: 98.5,
    responseTime: 200,
    description: 'Dosya depolama servisi',
    endpoint: '/storage/health',
    lastIncident: '2 saat önce - Yavaş yanıt süreleri'
  },
  {
    id: 'email',
    name: 'Email Service',
    status: 'operational',
    uptime: 99.8,
    responseTime: 300,
    description: 'E-posta gönderim servisi',
    endpoint: '/email/health'
  },
  {
    id: 'cdn',
    name: 'CDN',
    status: 'operational',
    uptime: 99.9,
    responseTime: 25,
    description: 'İçerik dağıtım ağı',
    endpoint: '/cdn/health'
  }
]

const getStatusColor = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'operational':
      return 'text-green-600 bg-green-100'
    case 'degraded':
      return 'text-yellow-600 bg-yellow-100'
    case 'partial_outage':
      return 'text-orange-600 bg-orange-100'
    case 'major_outage':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getStatusIcon = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="h-4 w-4" />
    case 'degraded':
      return <AlertTriangle className="h-4 w-4" />
    case 'partial_outage':
      return <AlertCircle className="h-4 w-4" />
    case 'major_outage':
      return <XCircle className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

const getStatusText = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'operational':
      return 'Operasyonel'
    case 'degraded':
      return 'Performans Düşüklüğü'
    case 'partial_outage':
      return 'Kısmi Kesinti'
    case 'major_outage':
      return 'Büyük Kesinti'
    default:
      return 'Bilinmiyor'
  }
}

const getOverallStatus = (services: ServiceStatus[]) => {
  const hasOutage = services.some(s => s.status === 'major_outage' || s.status === 'partial_outage')
  const hasDegraded = services.some(s => s.status === 'degraded')
  
  if (hasOutage) return 'partial_outage'
  if (hasDegraded) return 'degraded'
  return 'operational'
}

export default function SystemStatus() {
  const [services, setServices] = useState<ServiceStatus[]>(mockServices)
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUptime: 99.7,
    totalRequests: 1250000,
    errorRate: 0.3,
    avgResponseTime: 145,
    activeConnections: 1250
  })
  const [refreshing, setRefreshing] = useState(false)

  const overallStatus = getOverallStatus(services)

  const refreshStatus = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate random status changes
    const updatedServices = services.map(service => ({
      ...service,
      responseTime: Math.floor(Math.random() * 100) + service.responseTime - 50,
      uptime: Math.max(98, Math.min(100, service.uptime + (Math.random() - 0.5) * 0.1))
    }))
    
    setServices(updatedServices)
    setRefreshing(false)
  }

  useEffect(() => {
    const interval = setInterval(refreshStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Overall Status Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getStatusColor(overallStatus)}`}>
              {getStatusIcon(overallStatus)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {overallStatus === 'operational' ? 'Tüm Sistemler Operasyonel' : 'Sistem Durumu'}
              </h2>
              <p className="text-sm text-gray-500">
                Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
              </p>
            </div>
          </div>
          <button
            onClick={refreshStatus}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Activity className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Yenileniyor...' : 'Yenile'}
          </button>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{metrics.totalUptime}%</div>
            <div className="text-sm text-gray-600">Genel Uptime</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{metrics.totalRequests.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Toplam İstek</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{metrics.errorRate}%</div>
            <div className="text-sm text-gray-600">Hata Oranı</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime}ms</div>
            <div className="text-sm text-gray-600">Ortalama Yanıt</div>
          </div>
        </div>
      </div>

      {/* Service Status List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Servis Durumları</h3>
          <p className="text-sm text-gray-500">Sistemin son 90 gün içindeki uptime değerleri</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {services.map((service) => (
            <div key={service.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {service.id === 'api' && <Server className="h-5 w-5 text-gray-600" />}
                    {service.id === 'auth' && <Wifi className="h-5 w-5 text-gray-600" />}
                    {service.id === 'database' && <Database className="h-5 w-5 text-gray-600" />}
                    {service.id === 'storage' && <Server className="h-5 w-5 text-gray-600" />}
                    {service.id === 'email' && <Globe className="h-5 w-5 text-gray-600" />}
                    {service.id === 'cdn' && <TrendingUp className="h-5 w-5 text-gray-600" />}
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                    <span className="ml-1">{getStatusText(service.status)}</span>
                  </div>
                  {service.lastIncident && (
                    <p className="text-xs text-gray-500 mt-1">{service.lastIncident}</p>
                  )}
                </div>
              </div>

              {/* Uptime Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>90 gün önce</span>
                  <span>{service.uptime}% uptime</span>
                  <span>Bugün</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-sm flex">
                  {Array.from({ length: 90 }, (_, i) => {
                    const status = Math.random() > 0.05 ? 'operational' : service.status
                    return (
                      <div
                        key={i}
                        className={`flex-1 ${
                          status === 'operational' ? 'bg-green-400' :
                          status === 'degraded' ? 'bg-yellow-400' :
                          status === 'partial_outage' ? 'bg-orange-400' :
                          'bg-red-400'
                        } ${i > 0 ? 'ml-px' : ''}`}
                        title={`Gün ${i + 1}: ${getStatusText(status)}`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Yanıt Süresi:</span>
                  <span className="ml-2 font-medium">{service.responseTime}ms</span>
                </div>
                <div>
                  <span className="text-gray-500">Endpoint:</span>
                  <span className="ml-2 font-mono text-xs">{service.endpoint}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Son Olaylar</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 rounded-full bg-yellow-100 text-yellow-600 mt-1">
                <AlertTriangle className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Dosya depolama yavaşlığı</h4>
                  <span className="text-sm text-gray-500">2 saat önce</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Dosya yükleme ve indirme işlemlerinde normalden yüksek yanıt süreleri gözlemlendi.
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    İzleniyor
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1 rounded-full bg-green-100 text-green-600 mt-1">
                <CheckCircle className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Planlı bakım tamamlandı</h4>
                  <span className="text-sm text-gray-500">1 gün önce</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Veritabanı optimizasyon işlemleri başarıyla tamamlandı.
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                    Çözüldü
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 