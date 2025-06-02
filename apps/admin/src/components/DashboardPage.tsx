'use client'

import React from 'react'
import { BarChart3, Building2, Users, Activity, DollarSign, RefreshCw, UserPlus, Settings } from 'lucide-react'

interface DashboardPageProps {
  stats: any
  statsLoading: boolean
  activities: any[]
  activitiesLoading: boolean
  handleRefreshAll: () => void
}

export default function DashboardPage({ 
  stats, 
  statsLoading, 
  activities, 
  activitiesLoading, 
  handleRefreshAll 
}: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* DevOps Style Header */}
      <div className="relative bg-white shadow-sm border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
                <p className="text-gray-600">Real-time system monitoring and analytics</p>
              </div>
            </div>
            
            {/* Real-time Stats Cards */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">System Status</p>
                    <p className="font-medium text-gray-900 text-sm">Operational</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Companies</p>
                  <p className="font-bold text-blue-600 text-lg">{statsLoading ? '...' : stats?.totalCompanies || 0}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Active Users</p>
                  <p className="font-bold text-green-600 text-lg">{statsLoading ? '...' : stats?.totalUsers || 0}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Monthly Revenue</p>
                  <p className="font-bold text-purple-600 text-lg">₺{statsLoading ? '...' : Math.round((stats?.totalRevenue || 0) / 12).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefreshAll}
                disabled={statsLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                title="Refresh all data"
              >
                <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Companies */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats?.totalCompanies || 0
                    )}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +12% from last month
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats?.totalUsers || 0
                    )}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +8% from last week
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      All systems operational
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    ) : (
                      `₺${Math.round((stats?.totalRevenue || 0) / 12).toLocaleString()}`
                    )}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      +15% from last month
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Activity Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
                  <div className="flex items-center space-x-2">
                    <button className="text-sm text-gray-500 hover:text-gray-700">Daily</button>
                    <button className="text-sm text-blue-600 border-b border-blue-600">Weekly</button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">Monthly</button>
                  </div>
                </div>
                
                {/* Simulated Chart Area */}
                <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-around p-4">
                    {[40, 65, 45, 78, 56, 89, 67, 78, 82, 91, 76, 85, 92, 88].map((height, index) => (
                      <div
                        key={index}
                        className="bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${height}%`, width: '20px' }}
                      ></div>
                    ))}
                  </div>
                  <div className="text-gray-500 text-sm z-10">Interactive Chart Component</div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">View Details</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2.3s</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">1.2GB</div>
                    <div className="text-sm text-gray-600">Memory Usage</div>
                  </div>
                </div>
              </div>

              {/* Recent Integrations */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Integrations</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Manage All</button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Slack Integration', status: 'Active', type: 'Communication', time: '2 hours ago' },
                    { name: 'Azure AD SSO', status: 'Active', type: 'Authentication', time: '1 day ago' },
                    { name: 'Salesforce CRM', status: 'Pending', type: 'CRM', time: '3 days ago' },
                    { name: 'GitHub Actions', status: 'Active', type: 'DevOps', time: '1 week ago' }
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          integration.status === 'Active' ? 'bg-green-500' : 
                          integration.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{integration.name}</div>
                          <div className="text-sm text-gray-500">{integration.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          integration.status === 'Active' ? 'text-green-600' :
                          integration.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {integration.status}
                        </div>
                        <div className="text-xs text-gray-500">{integration.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Side Panels */}
            <div className="space-y-6">
              {/* System Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">System Status</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { service: 'API Gateway', status: 'Operational', uptime: '99.9%' },
                    { service: 'Database', status: 'Operational', uptime: '99.8%' },
                    { service: 'Authentication', status: 'Operational', uptime: '100%' },
                    { service: 'File Storage', status: 'Degraded', uptime: '98.2%' },
                    { service: 'Email Service', status: 'Operational', uptime: '99.5%' }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          service.status === 'Operational' ? 'bg-green-500' :
                          service.status === 'Degraded' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm text-gray-900">{service.service}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">{service.uptime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
                </div>
                
                <div className="space-y-4">
                  {activitiesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse flex space-x-3">
                          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities?.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Activity className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900">{activity.text || 'System activity'}</p>
                            <p className="text-xs text-gray-500">{activity.time || new Date().toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      
                      {(!activities || activities.length === 0) && (
                        <div className="text-center py-4">
                          <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No recent activities</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Add New Company</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">System Settings</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Generate Report</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 