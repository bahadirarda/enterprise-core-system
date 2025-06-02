'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Slack, 
  Mail, 
  Webhook, 
  Plus, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Bell,
  Activity,
  Zap,
  Github,
  Code,
  Shield,
  Star,
  Circle,
  Eye,
  Search,
  Calendar,
  Building2,
  X,
  AlertCircle,
  Database,
  Link,
  CheckSquare,
  Users,
  TrendingUp,
  Loader2,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Integration {
  id: string;
  type: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  lastActivity?: string;
  version?: string;
  endpoint?: string;
  apiCalls?: number;
  lastSync?: string;
  errorCount?: number;
  uptime?: number;
}

interface Notification {
  id: string;
  integrationId: string;
  integrationName: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  read: boolean;
  priority?: string;
}

export default function IntegrationsManagement() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'connections' | 'notifications' | 'marketplace'>('connections');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newIntegrationOpen, setNewIntegrationOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Mock integrations data - Enhanced with more details
      const mockIntegrations: Integration[] = [
        {
          id: '1',
          type: 'github',
          name: 'GitHub Enterprise',
          description: 'Source code management ve CI/CD entegrasyonu',
          status: 'active',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          lastActivity: '2024-01-15T14:30:00Z',
          version: 'v2.1.0',
          endpoint: 'https://api.github.com/enterprises/digidaga',
          apiCalls: 1247,
          lastSync: '2024-01-15T14:25:00Z',
          errorCount: 0,
          uptime: 99.9
        },
        {
          id: '2',
          type: 'teams',
          name: 'Microsoft Teams',
          description: 'Sistem bildirimleri ve team collaboration',
          status: 'active',
          created_at: '2024-01-12T09:15:00Z',
          updated_at: '2024-01-15T12:45:00Z',
          lastActivity: '2024-01-15T12:45:00Z',
          version: 'v1.8.3',
          endpoint: 'https://graph.microsoft.com/v1.0/teams',
          apiCalls: 892,
          lastSync: '2024-01-15T12:40:00Z',
          errorCount: 2,
          uptime: 98.7
        },
        {
          id: '3',
          type: 'slack',
          name: 'Slack Workspace',
          description: 'Development team notifications ve project updates',
          status: 'pending',
          created_at: '2024-01-14T16:20:00Z',
          updated_at: '2024-01-14T16:20:00Z',
          version: 'v1.4.2',
          endpoint: 'https://hooks.slack.com/services/workspace',
          apiCalls: 0,
          errorCount: 0,
          uptime: 0
        },
        {
          id: '4',
          type: 'sap',
          name: 'SAP SuccessFactors',
          description: 'İK sistemleri entegrasyonu ve employee data sync',
          status: 'error',
          created_at: '2024-01-08T11:30:00Z',
          updated_at: '2024-01-13T10:15:00Z',
          lastActivity: '2024-01-13T10:15:00Z',
          version: 'v3.2.1',
          endpoint: 'https://api.successfactors.com/odata/v2',
          apiCalls: 534,
          lastSync: '2024-01-13T08:30:00Z',
          errorCount: 15,
          uptime: 87.2
        },
        {
          id: '5',
          type: 'webhook',
          name: 'Custom Webhook',
          description: 'Özel sistem bildirimleri ve external system integration',
          status: 'active',
          created_at: '2024-01-09T13:45:00Z',
          updated_at: '2024-01-14T15:20:00Z',
          lastActivity: '2024-01-14T15:20:00Z',
          version: 'v2.0.1',
          endpoint: 'https://webhook.digidaga.com/api/v2',
          apiCalls: 2156,
          lastSync: '2024-01-14T15:15:00Z',
          errorCount: 5,
          uptime: 95.8
        },
        {
          id: '6',
          type: 'azure',
          name: 'Azure Active Directory',
          description: 'Single sign-on ve user authentication management',
          status: 'active',
          created_at: '2024-01-05T08:20:00Z',
          updated_at: '2024-01-15T11:30:00Z',
          lastActivity: '2024-01-15T11:30:00Z',
          version: 'v2.0.0',
          endpoint: 'https://graph.microsoft.com/v1.0',
          apiCalls: 3421,
          lastSync: '2024-01-15T11:25:00Z',
          errorCount: 1,
          uptime: 99.5
        }
      ];

      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          integrationId: '1',
          integrationName: 'GitHub Enterprise',
          title: 'New Pull Request Created',
          message: 'DevOps automation PR #247 opened by Ahmet Yılmaz - requires review',
          type: 'pull_request',
          timestamp: '2024-01-15T14:30:00Z',
          read: false,
          priority: 'high'
        },
        {
          id: '2',
          integrationId: '2',
          integrationName: 'Microsoft Teams',
          title: 'Deployment Success',
          message: 'Production deployment v2.1.3 completed successfully',
          type: 'deployment',
          timestamp: '2024-01-15T12:45:00Z',
          read: false,
          priority: 'medium'
        },
        {
          id: '3',
          integrationId: '4',
          integrationName: 'SAP SuccessFactors',
          title: 'API Connection Error',
          message: 'Authentication failed - token expired, manual refresh required',
          type: 'error',
          timestamp: '2024-01-13T10:15:00Z',
          read: true,
          priority: 'critical'
        },
        {
          id: '4',
          integrationId: '6',
          integrationName: 'Azure Active Directory',
          title: 'User Sync Completed',
          message: '1,247 user records synchronized successfully',
          type: 'sync',
          timestamp: '2024-01-15T11:30:00Z',
          read: false,
          priority: 'low'
        },
        {
          id: '5',
          integrationId: '5',
          integrationName: 'Custom Webhook',
          title: 'High API Usage',
          message: 'API call limit approaching: 2,156/2,500 calls this hour',
          type: 'warning',
          timestamp: '2024-01-14T15:20:00Z',
          read: true,
          priority: 'medium'
        }
      ];

      setIntegrations(mockIntegrations);
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load integration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter functions
  const getFilteredIntegrations = () => {
    let filtered = integrations;
    
    if (searchTerm) {
      filtered = filtered.filter(integration => 
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(integration => integration.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(integration => integration.type === typeFilter);
    }
    
    return filtered;
  };

  // Helper functions
  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'slack':
        return <MessageSquare className="w-5 h-5" />;
      case 'teams':
        return <Users className="w-5 h-5" />;
      case 'webhook':
        return <Webhook className="w-5 h-5" />;
      case 'sap':
        return <Database className="w-5 h-5" />;
      case 'azure':
        return <Shield className="w-5 h-5" />;
      default:
        return <Link className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'inactive':
        return <Circle className="w-4 h-4 text-gray-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'inactive':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'github':
        return 'Source Control';
      case 'slack':
        return 'Communication';
      case 'teams':
        return 'Collaboration';
      case 'webhook':
        return 'Custom API';
      case 'sap':
        return 'HR System';
      case 'azure':
        return 'Identity Provider';
      default:
        return 'Integration';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* DevOps Style Header - Integrations Management */}
      <div className="relative bg-white shadow-sm border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                <Link className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Bağlı Sistemler</h1>
                <p className="text-gray-600">Entegrasyon yönetimi ve sistem bağlantıları</p>
              </div>
            </div>
            
            {/* Real-time Stats Cards */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Aktif</p>
                    <p className="font-medium text-gray-900 text-sm">{integrations.filter(i => i.status === 'active').length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">API Çağrıları</p>
                  <p className="font-bold text-purple-600 text-lg">{integrations.reduce((sum, i) => sum + (i.apiCalls || 0), 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Ortalama Uptime</p>
                  <p className="font-bold text-green-600 text-lg">{Math.round(integrations.reduce((sum, i) => sum + (i.uptime || 0), 0) / integrations.length)}%</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Hatalar</p>
                  <p className="font-bold text-red-600 text-lg">{integrations.reduce((sum, i) => sum + (i.errorCount || 0), 0)}</p>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm"
                title="Refresh integrations"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { 
                id: 'connections', 
                label: 'Bağlantılar', 
                count: integrations.length,
                icon: Link,
                color: 'purple'
              },
              { 
                id: 'notifications', 
                label: 'Bildirimler', 
                count: notifications.filter(n => !n.read).length,
                icon: Bell,
                color: 'blue'
              },
              { 
                id: 'marketplace', 
                label: 'Market', 
                count: 0,
                icon: Plus,
                color: 'indigo'
              }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`${
                      activeTab === tab.id 
                        ? `bg-${tab.color}-100 text-${tab.color}-800` 
                        : 'bg-gray-100 text-gray-900'
                    } py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-${tab.color}-400 to-${tab.color}-600 rounded-full`} />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                <span className="text-gray-600 font-medium">Loading integrations...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'connections' && (
              <div className="space-y-6">
                {/* Enhanced header with filters and stats */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <Link className="w-5 h-5 text-purple-600" />
                      <span>Entegrasyon Bağlantıları</span>
                    </h2>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">{integrations.filter(i => i.status === 'active').length} aktif</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">{integrations.filter(i => i.status === 'error').length} hatalı</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-gray-600">{integrations.filter(i => i.status === 'pending').length} beklemede</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-purple-600 font-semibold text-lg">{integrations.length}</p>
                      <p className="text-purple-800 text-xs">Toplam Entegrasyon</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-green-600 font-semibold text-lg">{integrations.filter(i => i.status === 'active').length}</p>
                      <p className="text-green-800 text-xs">Aktif Bağlantı</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-blue-600 font-semibold text-lg">{integrations.reduce((sum, i) => sum + (i.apiCalls || 0), 0).toLocaleString()}</p>
                      <p className="text-blue-800 text-xs">API Çağrıları</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-orange-600 font-semibold text-lg">{Math.round(integrations.reduce((sum, i) => sum + (i.uptime || 0), 0) / integrations.length)}%</p>
                      <p className="text-orange-800 text-xs">Ortalama Uptime</p>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Entegrasyon ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="active">Aktif</option>
                      <option value="pending">Beklemede</option>
                      <option value="error">Hatalı</option>
                      <option value="inactive">Pasif</option>
                    </select>
                    
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">Tüm Türler</option>
                      <option value="github">GitHub</option>
                      <option value="slack">Slack</option>
                      <option value="teams">Teams</option>
                      <option value="webhook">Webhook</option>
                      <option value="sap">SAP</option>
                      <option value="azure">Azure</option>
                    </select>
                    
                    <button
                      onClick={() => setNewIntegrationOpen(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Yeni Entegrasyon</span>
                    </button>
                  </div>
                </div>

                {/* Integrations List - Compact Design */}
                {getFilteredIntegrations().length > 0 ? (
                  <div className="space-y-3">
                    {getFilteredIntegrations().map((integration) => (
                      <div key={integration.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`p-2 rounded-lg ${
                              integration.status === 'active' ? 'bg-green-100' :
                              integration.status === 'error' ? 'bg-red-100' :
                              integration.status === 'pending' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              <div className={`${
                                integration.status === 'active' ? 'text-green-600' :
                                integration.status === 'error' ? 'text-red-600' :
                                integration.status === 'pending' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`}>
                                {getIntegrationIcon(integration.type)}
                              </div>
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {getTypeLabel(integration.type)}
                                </span>
                                {integration.version && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {integration.version}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {integration.endpoint && (
                                  <div className="flex items-center space-x-1">
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="truncate max-w-48">{integration.endpoint}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Activity className="w-3 h-3" />
                                  <span>{integration.apiCalls?.toLocaleString() || 0} API calls</span>
                                </div>
                                {integration.lastSync && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Son sync: {getTimeAgo(integration.lastSync)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 flex-shrink-0">
                            {/* Performance Metrics */}
                            <div className="text-xs text-gray-600 text-right">
                              <div className="flex items-center space-x-1 mb-1">
                                {integration.uptime !== undefined && (
                                  <>
                                    <div className={`w-2 h-2 rounded-full ${
                                      integration.uptime >= 95 ? 'bg-green-400' :
                                      integration.uptime >= 85 ? 'bg-yellow-400' :
                                      'bg-red-400'
                                    }`}></div>
                                    <span>{integration.uptime}% uptime</span>
                                  </>
                                )}
                              </div>
                              {integration.errorCount !== undefined && (
                                <div className="flex items-center space-x-1">
                                  <AlertCircle className="w-3 h-3 text-red-400" />
                                  <span>{integration.errorCount} errors</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 text-xs rounded-full font-medium border inline-flex items-center ${getStatusColor(integration.status)}`}>
                                {getStatusIcon(integration.status)}
                                <span className="ml-1">
                                  {integration.status === 'active' ? 'Aktif' :
                                   integration.status === 'pending' ? 'Beklemede' :
                                   integration.status === 'error' ? 'Hatalı' :
                                   'Pasif'}
                                </span>
                              </span>
                              
                              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <Settings className="w-4 h-4" />
                              </button>
                              
                              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Link className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Entegrasyon bulunamadı</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                        ? 'Filtreleri değiştirerek tekrar deneyin.'
                        : 'Yeni entegrasyonlar ekleyerek başlayın.'}
                    </p>
                    {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') ? (
                      <button 
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter('all')
                          setTypeFilter('all')
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Filtreleri Temizle
                      </button>
                    ) : (
                      <button 
                        onClick={() => setNewIntegrationOpen(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        İlk Entegrasyonu Ekle
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2 mb-4">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span>Sistem Bildirimleri</span>
                  </h2>
                  
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Henüz bildirim yok</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 rounded-lg border ${
                          notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>{notification.integrationName}</span>
                                <span>{getTimeAgo(notification.timestamp)}</span>
                                {notification.priority && (
                                  <span className={`px-2 py-1 rounded ${
                                    notification.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                    notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {notification.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-3 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2 mb-4">
                    <Star className="w-5 h-5 text-purple-600" />
                    <span>Entegrasyon Marketi</span>
                  </h2>
                  
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Entegrasyon Marketi</h3>
                    <p className="text-gray-600 mb-4">
                      Popüler entegrasyonlar ve önceden yapılandırılmış bağlantılar burada listelenecek.
                    </p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Yakında Geliyor
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Integration Modal */}
      {newIntegrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setNewIntegrationOpen(false)}
          />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-green-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Yeni Entegrasyon Ekle</h2>
                <p className="text-sm text-gray-600 mt-1">Sisteminize yeni bir entegrasyon bağlayın</p>
              </div>
              <button
                onClick={() => setNewIntegrationOpen(false)}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Popular Integrations */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Popüler Entegrasyonlar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        type: 'github', 
                        name: 'GitHub', 
                        desc: 'Source code ve CI/CD yönetimi',
                        icon: Github,
                        color: 'bg-gray-900 hover:bg-gray-800'
                      },
                      { 
                        type: 'teams', 
                        name: 'Microsoft Teams', 
                        desc: 'Team collaboration ve notifications',
                        icon: MessageSquare,
                        color: 'bg-blue-600 hover:bg-blue-700'
                      },
                      { 
                        type: 'slack', 
                        name: 'Slack', 
                        desc: 'Team communication platform',
                        icon: Slack,
                        color: 'bg-green-600 hover:bg-green-700'
                      },
                      { 
                        type: 'sap', 
                        name: 'SAP SuccessFactors', 
                        desc: 'İK sistemleri entegrasyonu',
                        icon: Building2,
                        color: 'bg-blue-700 hover:bg-blue-800'
                      }
                    ].map((integration) => {
                      const Icon = integration.icon;
                      return (
                        <button
                          key={integration.type}
                          onClick={() => {
                            // Handle integration setup
                            setNewIntegrationOpen(false);
                            // Add integration logic here
                          }}
                          className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg text-white transition-colors ${integration.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {integration.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{integration.desc}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Integration */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Özel Entegrasyon</h3>
                  <button 
                    onClick={() => {
                      // Handle custom integration
                      setNewIntegrationOpen(false);
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center group"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-xl transition-colors">
                        <Plus className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          Webhook Entegrasyonu
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Özel API endpoint'leri ve webhook'lar için
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 