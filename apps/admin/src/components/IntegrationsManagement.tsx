'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
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
  Users,
  FileText,
  AlertTriangle,
  Play,
  Pause,
  Zap
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'teams' | 'slack' | 'discord' | 'webhook' | 'email';
  status: 'active' | 'inactive' | 'error';
  description: string;
  lastActivity: string;
  webhookUrl?: string;
  apiKey?: string;
}

interface Notification {
  id: string;
  integrationId: string;
  integrationName: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

interface Approval {
  id: string;
  integrationId: string;
  integrationName: string;
  requestType: 'vacation' | 'expense' | 'document';
  requester: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

export default function IntegrationsManagement() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [activeTab, setActiveTab] = useState<'connections' | 'notifications' | 'approvals' | 'settings'>('connections');
  const [isLoading, setIsLoading] = useState(false);
  const [newIntegrationOpen, setNewIntegrationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'teams' as const,
    description: '',
    webhookUrl: '',
    apiKey: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Integrations
      const integrationsResponse = await fetch('/api/integrations/connections');
      if (integrationsResponse.ok) {
        const integrationsData = await integrationsResponse.json();
        setIntegrations(integrationsData);
      }

      // Notifications
      const notificationsResponse = await fetch('/api/integrations/notifications');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
        setNotificationCount(notificationsData.filter((n: Notification) => !n.read).length);
      }

      // Approvals
      const approvalsResponse = await fetch('/api/integrations/approvals');
      if (approvalsResponse.ok) {
        const approvalsData = await approvalsResponse.json();
        setApprovals(approvalsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIntegration = async () => {
    try {
      const response = await fetch('/api/integrations/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIntegration)
      });

      if (response.ok) {
        setNewIntegrationOpen(false);
        setNewIntegration({ name: '', type: 'teams', description: '', webhookUrl: '', apiKey: '' });
        loadData();
      }
    } catch (error) {
      console.error('Failed to add integration:', error);
    }
  };

  const handleApprovalAction = async (approvalId: string, action: 'approve' | 'reject') => {
    const updatedApprovals = approvals.map(approval => 
      approval.id === approvalId 
        ? { ...approval, status: action === 'approve' ? 'approved' as const : 'rejected' as const }
        : approval
    );
    setApprovals(updatedApprovals);
    console.log(`${action === 'approve' ? 'Approved' : 'Rejected'} approval ${approvalId}`);
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'teams': return <MessageSquare className="w-4 h-4" />;
      case 'slack': return <Slack className="w-4 h-4" />;
      case 'discord': return <MessageSquare className="w-4 h-4" />;
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Integration Management</h2>
            <p className="text-gray-600">Connect and manage external integrations for your HRMS</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {notificationCount > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <Bell className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                {notificationCount} unread notification{notificationCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'connections', label: 'Connections', icon: Activity, count: integrations.filter(i => i.status === 'active').length },
            { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter(n => !n.read).length },
            { id: 'approvals', label: 'Approvals', icon: FileText, count: approvals.filter(a => a.status === 'pending').length },
            { id: 'settings', label: 'Settings', icon: Settings, count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Active Integrations</h3>
              
              <Dialog open={newIntegrationOpen} onOpenChange={setNewIntegrationOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Integration</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Integration</DialogTitle>
                    <DialogDescription>Connect a new external service to your HRMS</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Integration Type</Label>
                      <Select
                        value={newIntegration.type}
                        onValueChange={(value: string) => 
                          setNewIntegration(prev => ({ ...prev, type: value as any }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select integration type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teams">Microsoft Teams</SelectItem>
                          <SelectItem value="slack">Slack</SelectItem>
                          <SelectItem value="discord">Discord</SelectItem>
                          <SelectItem value="webhook">Custom Webhook</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="name">Integration Name</Label>
                      <Input
                        id="name"
                        value={newIntegration.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setNewIntegration(prev => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="e.g., DigiDaga HR Teams"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newIntegration.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                          setNewIntegration(prev => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Brief description of this integration"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setNewIntegrationOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddIntegration}>
                        Add Integration
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getIntegrationIcon(integration.type)}
                      <h3 className="font-medium text-gray-900">{integration.name}</h3>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{integration.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{integration.type}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(integration.status)}`}>
                        {integration.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Activity:</span>
                      <span>{new Date(integration.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(notification.type)}
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>From: {notification.integrationName}</span>
                      <span>{new Date(notification.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(notification.type)}`}>
                    {notification.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {approval.requestType ? 
                        approval.requestType.charAt(0).toUpperCase() + approval.requestType.slice(1) :
                        'Request'
                      } Request
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{approval.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Requester: {approval.requester}</span>
                      <span>Via: {approval.integrationName}</span>
                      <span>{new Date(approval.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(approval.priority)}`}>
                      {approval.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(approval.status)}`}>
                      {approval.status}
                    </span>
                  </div>
                </div>

                {approval.status === 'pending' && (
                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleApprovalAction(approval.id, 'reject')}
                      className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    
                    <button
                      onClick={() => handleApprovalAction(approval.id, 'approve')}
                      className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Settings</h3>
            <p className="text-gray-600">Global integration settings and configurations will be available here.</p>
          </div>
        )}
      </div>
    </div>
  );
} 