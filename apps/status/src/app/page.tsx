'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Activity, Wifi, Database, TrendingUp, AlertCircle as AlertIcon, Monitor, RefreshCw, LayoutGrid, Columns, Square, Grid } from 'lucide-react'

interface ServiceStatus {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage'
  uptime: number
  responseTime: number
  lastIncident?: string
  description: string
}

interface AdCard {
  id: string
  type: 'announcement' | 'feature' | 'promotion' | 'maintenance'
  title: string
  description: string
  link?: string
  linkText?: string
  icon?: string
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  priority: number
  enabled: boolean
  expiresAt?: string
}

const services: ServiceStatus[] = [
  {
    id: 'auth',
    name: 'Authentication Service',
    status: 'operational',
    uptime: 99.95,
    responseTime: 85,
    description: 'Kullanıcı girişi ve kimlik doğrulama'
  },
  {
    id: 'portal',
    name: 'Portal Application',
    status: 'operational',
    uptime: 99.8,
    responseTime: 120,
    description: 'Ana portal uygulaması'
  },
  {
    id: 'hrms',
    name: 'HRMS System',
    status: 'operational',
    uptime: 99.9,
    responseTime: 150,
    description: 'İnsan kaynakları yönetim sistemi'
  },
  {
    id: 'admin',
    name: 'Admin Panel',
    status: 'operational',
    uptime: 99.97,
    responseTime: 90,
    description: 'Sistem yönetim paneli'
  },
  {
    id: 'api',
    name: 'Core API',
    status: 'degraded',
    uptime: 98.5,
    responseTime: 200,
    description: 'Ana API servisleri',
    lastIncident: '2 saat önce - Yavaş yanıt süreleri'
  },
  {
    id: 'database',
    name: 'Database',
    status: 'operational',
    uptime: 99.99,
    responseTime: 45,
    description: 'Ana PostgreSQL veritabanı'
  }
]

const getStatusColor = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'operational':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'degraded':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'partial_outage':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'major_outage':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getStatusIcon = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="h-3 w-3" />
    case 'degraded':
      return <AlertTriangle className="h-3 w-3" />
    case 'partial_outage':
      return <AlertIcon className="h-3 w-3" />
    case 'major_outage':
      return <XCircle className="h-3 w-3" />
    default:
      return <Activity className="h-3 w-3" />
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

export default function StatusPage() {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>(services)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<1 | 2 | 3 | 4>(4) // Default 4 columns
  const [ads, setAds] = useState<AdCard[]>([])
  const [adsLoading, setAdsLoading] = useState(false)

  const overallStatus = getOverallStatus(serviceStatuses)
  const avgUptime = (serviceStatuses.reduce((sum, service) => sum + service.uptime, 0) / serviceStatuses.length).toFixed(2)

  // GitHub Gist URL for ads configuration
  const GIST_URL = 'https://gist.githubusercontent.com/bahadirarda/aa842f2d8f36372c3741b0b2f4f00eb1/raw/gistfile1.txt'

  const getAdColors = (color: AdCard['color']) => {
    switch (color) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-700'
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 text-green-700'
      case 'yellow':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50 text-yellow-700'
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-700'
      case 'red':
        return 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50 text-red-700'
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200/50 text-gray-700'
    }
  }

  const fetchAds = async () => {
    setAdsLoading(true)
    try {
      console.log('Fetching ads from GitHub Gist:', GIST_URL)
      
      const response = await fetch(GIST_URL, {
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Raw Gist data:', data)
      
      // Filter enabled ads and sort by priority
      const activeAds = data.ads
        .filter((ad: AdCard) => ad.enabled)
        .filter((ad: AdCard) => !ad.expiresAt || new Date(ad.expiresAt) > new Date())
        .sort((a: AdCard, b: AdCard) => a.priority - b.priority)
      
      setAds(activeAds)
      console.log(`✅ Loaded ${activeAds.length} active ads from GitHub Gist`)
      console.log('Active ads:', activeAds.map((ad: AdCard) => ad.title))
    } catch (error) {
      console.error('❌ Failed to fetch ads from GitHub Gist:', error)
      
      // Fallback to local mock data
      const fallbackAds: AdCard[] = [
        {
          id: 'fallback-info',
          type: 'announcement',
          title: '⚠️ Gist Bağlantı Hatası',
          description: 'GitHub Gist\'ten reklam yüklenemedi. Fallback veriler gösteriliyor.',
          color: 'yellow',
          priority: 1,
          enabled: true
        }
      ]
      
      setAds(fallbackAds)
      console.log('Using fallback ads due to fetch error')
    } finally {
      setAdsLoading(false)
    }
  }

  const getGridCols = () => {
    switch (viewMode) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-1 sm:grid-cols-2'
      case 3: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
      default: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
    }
  }

  const refreshStatus = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate minor status updates
    const updated = serviceStatuses.map(service => ({
      ...service,
      responseTime: Math.max(20, service.responseTime + (Math.random() - 0.5) * 20),
      uptime: Math.max(98, Math.min(100, service.uptime + (Math.random() - 0.5) * 0.1))
    }))
    
    setServiceStatuses(updated)
    setLastUpdated(new Date())
    
    // Also refresh ads
    await fetchAds()
    
    setRefreshing(false)
  }

  useEffect(() => {
    setMounted(true)
    setLastUpdated(new Date())
    fetchAds() // Fetch ads on mount
    
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000)

    // Fetch ads every 5 minutes
    const adsInterval = setInterval(fetchAds, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
      clearInterval(adsInterval)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50/30">
      {/* Ultra Modern Header */}
      <header className="relative bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 via-slate-50/30 to-gray-50/50"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 group">
              {/* Softened Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gray-200 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all duration-300 ease-out">
                  <Monitor className="h-6 w-6 text-white transform group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              
              {/* Title with subtle gradient */}
              <div className="group-hover:translate-x-1 transition-transform duration-300">
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                  Kikos Status
                </h1>
                <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300 flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Sistem durumu • Canlı izleme</span>
                </p>
              </div>
            </div>
            
            {/* Softened Refresh Button */}
            <div className="flex items-center space-x-3">
              {/* Status indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Tüm sistemler aktif</span>
              </div>
              
              <button
                onClick={refreshStatus}
                disabled={refreshing}
                className="group relative inline-flex items-center px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-xl font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                <span>
                  {refreshing ? 'Yenileniyor...' : 'Yenile'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Compact Overall Status */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 mb-8 shadow-lg shadow-gray-500/5 hover:shadow-xl hover:shadow-gray-500/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl border-2 ${getStatusColor(overallStatus)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                {getStatusIcon(overallStatus)}
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {overallStatus === 'operational' ? 'Tüm Sistemler Operasyonel' : 'Sistem Durumu'}
                </h2>
                <p className="text-sm text-gray-500 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                  <span>Son güncelleme: {lastUpdated ? lastUpdated.toLocaleString('tr-TR') : 'Yükleniyor...'}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {avgUptime}%
              </div>
              <div className="text-sm text-gray-500">Genel Uptime</div>
            </div>
          </div>

          {/* Enhanced Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-slate-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-medium text-gray-700">Ortalama Yanıt</span>
              </div>
              <div className="text-xl font-bold text-gray-900">115ms</div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div className="bg-gradient-to-r from-slate-500 to-slate-600 h-1.5 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-medium text-gray-700">Aktif Servisler</span>
              </div>
              <div className="text-xl font-bold text-gray-900">5/6</div>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full w-5/6"></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center space-x-2 mb-2">
                <Wifi className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-medium text-gray-700">Bağlantı</span>
              </div>
              <div className="text-xl font-bold text-gray-900">Stabil</div>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-4 border border-teal-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-teal-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-medium text-gray-700">Veritabanı</span>
              </div>
              <div className="text-xl font-bold text-gray-900">99.99%</div>
              <div className="w-full bg-teal-200 rounded-full h-1.5 mt-2">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-1.5 rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Selector & Services Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Servis Durumları</h3>
            <p className="text-sm text-gray-500">90 günlük uptime geçmişi ve anlık durum</p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode(1)}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 1 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title="Tek sütun"
            >
              <Square className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode(2)}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 2 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title="İki sütun"
            >
              <Columns className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode(3)}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 3 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title="Üç sütun"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode(4)}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 4 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title="Dört sütun"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Compact Services Grid with Ads */}
        <div className={`grid ${getGridCols()} gap-3 auto-rows-fr`}>
          {/* Service Cards */}
          {serviceStatuses.map((service, index) => (
            <div 
              key={service.id} 
              className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 hover:shadow-lg hover:shadow-gray-500/10 transition-all duration-300 transform hover:-translate-y-1 group"
              style={{animationDelay: `${index * 50}ms`}}
            >
              {/* Service Header - Fixed Layout */}
              <div className="mb-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg border-2 ${getStatusColor(service.status)} shadow-sm group-hover:scale-105 transition-all duration-300 flex-shrink-0`}>
                    {getStatusIcon(service.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors duration-300">
                      {service.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{service.description}</p>
                  </div>
                </div>
                {/* Status badge on separate line to prevent compression */}
                <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(service.status)} shadow-sm`}>
                  <span>{getStatusText(service.status)}</span>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-gray-900">{service.uptime.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Uptime</div>
                </div>
                <div className="text-center bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-gray-900">{Math.round(service.responseTime)}ms</div>
                  <div className="text-xs text-gray-500">Yanıt</div>
                </div>
              </div>

              {/* Incident Alert */}
              {service.lastIncident && (
                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200 mb-3 animate-pulse">
                  ⚠️ {service.lastIncident}
                </div>
              )}

              {/* Compact Uptime Visualization */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>90 gün</span>
                  <span>{service.uptime.toFixed(2)}%</span>
                </div>
                <div className="flex space-x-0.5 h-6 items-end bg-gray-50 rounded-md p-1">
                  {Array.from({ length: 30 }, (_, i) => {
                    const isDown = Math.random() < (100 - service.uptime) / 100
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm transition-all duration-200 hover:opacity-80 cursor-pointer ${
                          isDown ? 'bg-red-400 h-3' : 'bg-green-400 h-4'
                        } hover:scale-110`}
                        title={`${isDown ? 'Incident' : 'Operational'}`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Ad Cards */}
          {ads.map((ad, index) => (
            <div 
              key={ad.id} 
              className={`relative rounded-xl border p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer ${getAdColors(ad.color)}`}
              style={{animationDelay: `${(serviceStatuses.length + index) * 50}ms`}}
              onClick={() => ad.link && window.open(ad.link, '_blank')}
            >
              {/* Ad Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1 group-hover:scale-105 transition-transform duration-300">
                    {ad.title}
                  </h4>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {ad.description}
                  </p>
                </div>
                {ad.type === 'feature' && (
                  <div className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                    YENİ
                  </div>
                )}
              </div>

              {/* Ad Action */}
              {ad.link && ad.linkText && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-xs font-medium flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300">
                    <span>{ad.linkText}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* Ad Type Badge */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              </div>
            </div>
          ))}

          {/* Loading Ad Placeholder */}
          {adsLoading && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <footer className="mt-8 text-center text-gray-400 border-t border-gray-200 pt-4">
          <p className="text-sm">© 2025 Kikos. Tüm hakları saklıdır.</p>
          <p className="text-xs mt-1">
            Otomatik güncelleme: 30s | Son: {lastUpdated ? lastUpdated.toLocaleTimeString('tr-TR') : 'Yükleniyor...'}
          </p>
        </footer>
      </main>
    </div>
  )
}