'use client'

import React from 'react'
import { Activity, Shield, Database, Server, Wifi, CheckCircle, AlertTriangle, XCircle, RefreshCw, Settings, Globe, Clock } from 'lucide-react'

interface SystemStatusPageProps {
  // Burada sistem durumu props'ları eklenebilir
}

export default function SystemStatusPage({}: SystemStatusPageProps) {
  // Mock data - gerçek projede API'den gelecek
  const systemServices = [
    { 
      name: 'API Gateway', 
      status: 'operational', 
      uptime: '99.9%', 
      responseTime: '145ms',
      lastCheck: '2 min ago'
    },
    { 
      name: 'Database Cluster', 
      status: 'operational', 
      uptime: '99.8%', 
      responseTime: '12ms',
      lastCheck: '1 min ago'
    },
    { 
      name: 'Authentication Service', 
      status: 'operational', 
      uptime: '100%', 
      responseTime: '89ms',
      lastCheck: '30s ago'
    },
    { 
      name: 'File Storage', 
      status: 'degraded', 
      uptime: '98.2%', 
      responseTime: '567ms',
      lastCheck: '45s ago'
    },
    { 
      name: 'Email Service', 
      status: 'operational', 
      uptime: '99.5%', 
      responseTime: '234ms',
      lastCheck: '1 min ago'
    },
    { 
      name: 'Background Workers', 
      status: 'maintenance', 
      uptime: '95.1%', 
      responseTime: 'N/A',
      lastCheck: '5 min ago'
    }
  ]

  const incidents = [
    {
      id: 1,
      title: 'File Storage Performance Issues',
      status: 'investigating',
      severity: 'medium',
      startTime: '2024-01-15 14:30',
      description: 'We are investigating reports of slow file upload speeds.',
      updates: [
        { time: '14:45', message: 'Issue identified - investigating root cause' },
        { time: '14:30', message: 'Investigating reports of slow file uploads' }
      ]
    },
    {
      id: 2,
      title: 'Scheduled Database Maintenance',
      status: 'scheduled',
      severity: 'low',
      startTime: '2024-01-16 02:00',
      description: 'Routine database maintenance scheduled for tonight.',
      updates: [
        { time: '12:00', message: 'Maintenance window scheduled for 02:00-04:00 UTC' }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'maintenance':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'outage':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'maintenance':
        return <Settings className="w-5 h-5 text-blue-500" />
      case 'outage':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* DevOps Style Header - System Status (Soft Green/Teal Theme) */}
      <div className="relative bg-white shadow-sm border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-teal-600/5 to-emerald-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">System Status</h1>
                <p className="text-gray-600">Real-time monitoring and incident management</p>
              </div>
            </div>
            
            {/* Real-time Status Summary */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">All Systems</p>
                    <p className="font-medium text-gray-900 text-sm">Operational</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Uptime</p>
                  <p className="font-bold text-green-600 text-lg">99.9%</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Response Time</p>
                  <p className="font-bold text-blue-600 text-lg">145ms</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Active Incidents</p>
                  <p className="font-bold text-yellow-600 text-lg">1</p>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                title="Refresh status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Services */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">System Services</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Last updated: 2 minutes ago
                </div>
              </div>
              
              <div className="space-y-4">
                {systemServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>Uptime: {service.uptime}</span>
                          <span>Response: {service.responseTime}</span>
                          <span>Last check: {service.lastCheck}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Incidents */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Current Incidents</h2>
                <button className="text-sm text-green-600 hover:text-green-700">View All Incidents</button>
              </div>
              
              {incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">{incident.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                              {incident.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                          <div className="text-xs text-gray-500">
                            Started: {incident.startTime}
                          </div>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          incident.status === 'investigating' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          incident.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </div>
                      </div>
                      
                      {/* Incident Updates */}
                      <div className="border-t border-gray-100 pt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Updates:</h4>
                        <div className="space-y-2">
                          {incident.updates.map((update, index) => (
                            <div key={index} className="flex space-x-3 text-sm">
                              <span className="text-gray-500 font-mono">{update.time}</span>
                              <span className="text-gray-700">{update.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Systems Operational</h3>
                  <p className="text-gray-600">No current incidents or outages reported.</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="text-sm font-medium text-gray-900">23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="text-sm font-medium text-gray-900">67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Disk Usage</span>
                  <span className="text-sm font-medium text-gray-900">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Network I/O</span>
                  <span className="text-sm font-medium text-gray-900">12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">SSL Certificate</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Valid</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Database Encryption</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Firewall</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Protected</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">DDoS Protection</span>
                  </div>
                  <span className="text-xs text-yellow-600 font-medium">Monitoring</span>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Events</h3>
              
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Database backup completed successfully</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">SSL certificate renewed</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">High memory usage detected</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Security scan completed</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 