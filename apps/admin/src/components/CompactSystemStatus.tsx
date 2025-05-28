'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Activity, Monitor, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ServiceStatus {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage'
  uptime: number
}

const mockServices: ServiceStatus[] = [
  { id: 'api', name: 'HRMS API', status: 'operational', uptime: 99.97 },
  { id: 'auth', name: 'Auth Service', status: 'operational', uptime: 99.95 },
  { id: 'database', name: 'Database', status: 'operational', uptime: 99.99 },
  { id: 'storage', name: 'File Storage', status: 'degraded', uptime: 98.5 },
  { id: 'email', name: 'Email Service', status: 'operational', uptime: 99.8 },
  { id: 'cdn', name: 'CDN', status: 'operational', uptime: 99.9 }
]

const getStatusColor = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'operational':
      return 'bg-green-400'
    case 'degraded':
      return 'bg-yellow-400'
    case 'partial_outage':
      return 'bg-orange-400'
    case 'major_outage':
      return 'bg-red-400'
    default:
      return 'bg-gray-400'
  }
}

const getStatusIcon = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'degraded':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case 'partial_outage':
    case 'major_outage':
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return <Activity className="h-4 w-4 text-gray-600" />
  }
}

const getOverallStatus = (services: ServiceStatus[]) => {
  const hasOutage = services.some(s => s.status === 'major_outage' || s.status === 'partial_outage')
  const hasDegraded = services.some(s => s.status === 'degraded')
  
  if (hasOutage) return 'partial_outage'
  if (hasDegraded) return 'degraded'
  return 'operational'
}

export default function CompactSystemStatus() {
  const [services, setServices] = useState<ServiceStatus[]>(mockServices)
  const [isExpanded, setIsExpanded] = useState(false)

  const overallStatus = getOverallStatus(services)
  const avgUptime = (services.reduce((sum, service) => sum + service.uptime, 0) / services.length).toFixed(2)

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate minor status updates
      setServices(prev => prev.map(service => ({
        ...service,
        uptime: Math.max(98, Math.min(100, service.uptime + (Math.random() - 0.5) * 0.01))
      })))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Monitor className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sistem Durumu</h3>
              <p className="text-sm text-gray-500">Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(overallStatus)}
            <Link
              href="https://status.kikos.app"
              target="_blank"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              Detaylı Görünüm
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Overall Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {overallStatus === 'operational' ? 'Tüm Sistemler Operasyonel' : 'Sistem Durumu'}
            </span>
            <span className="text-sm font-bold text-gray-900">{avgUptime}% uptime</span>
          </div>
          
          {/* Service Status Dots */}
          <div className="flex items-center space-x-1 mb-3">
            {services.map((service) => (
              <div
                key={service.id}
                className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}
                title={`${service.name}: ${service.status} (${service.uptime}%)`}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{services.filter(s => s.status === 'operational').length}</div>
            <div className="text-xs text-gray-600">Operasyonel</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{services.filter(s => s.status === 'degraded').length}</div>
            <div className="text-xs text-gray-600">Uyarı</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{services.filter(s => s.status === 'major_outage' || s.status === 'partial_outage').length}</div>
            <div className="text-xs text-gray-600">Kesinti</div>
          </div>
        </div>

        {/* Expandable Service List */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isExpanded ? 'Daha az göster' : 'Tüm servisleri göster'}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-2">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                  <span className="text-sm font-medium text-gray-900">{service.name}</span>
                </div>
                <span className="text-xs text-gray-600">{service.uptime}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 