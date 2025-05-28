'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  GitBranch, 
  GitMerge, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Pause, 
  RefreshCw,
  Bell,
  Settings,
  Database,
  Code,
  Server,
  AlertTriangle,
  Users,
  FileText,
  Zap
} from 'lucide-react'

interface PipelineJob {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  duration?: number
  startedAt?: string
  finishedAt?: string
  logs?: string
}

interface Pipeline {
  id: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  branch: string
  commit: string
  author: string
  message: string
  createdAt: string
  jobs: PipelineJob[]
}

interface MergeRequest {
  id: string
  title: string
  description: string
  author: string
  sourceBranch: string
  targetBranch: string
  status: 'open' | 'merged' | 'closed' | 'draft'
  createdAt: string
  updatedAt: string
  approvals: number
  requiredApprovals: number
  conflicts: boolean
  pipelineStatus?: 'pending' | 'running' | 'success' | 'failed'
  changes: {
    additions: number
    deletions: number
    files: number
  }
}

interface DeploymentStatus {
  environment: string
  status: 'deploying' | 'success' | 'failed' | 'idle'
  version: string
  lastDeployment: string
  health: 'healthy' | 'unhealthy' | 'unknown'
}

interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  environment: string
  rolloutPercentage: number
  lastModified: string
}

export default function AutomationPanel() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([])
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([])
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [activeTab, setActiveTab] = useState<'pipelines' | 'merges' | 'deployments' | 'features'>('pipelines')
  const [notifications, setNotifications] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data initialization
  useEffect(() => {
    loadAutomationData()
    
    // Real-time updates every 30 seconds
    const interval = setInterval(loadAutomationData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAutomationData = async () => {
    setIsLoading(true)
    
    try {
      // Mock data - in real implementation, these would be API calls
      setPipelines([
        {
          id: '1',
          status: 'running',
          branch: 'feature/status-page-updates',
          commit: 'abc123f',
          author: 'bahadirarda',
          message: 'Add comprehensive status page features',
          createdAt: new Date().toISOString(),
          jobs: [
            { id: '1', name: 'Lint & Type Check', status: 'success', duration: 45 },
            { id: '2', name: 'Unit Tests', status: 'success', duration: 120 },
            { id: '3', name: 'Build Applications', status: 'running' },
            { id: '4', name: 'Integration Tests', status: 'pending' },
            { id: '5', name: 'Deploy to Staging', status: 'pending' }
          ]
        },
        {
          id: '2',
          status: 'success',
          branch: 'main',
          commit: 'def456g',
          author: 'team-member',
          message: 'Fix authentication middleware',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          jobs: [
            { id: '6', name: 'Lint & Type Check', status: 'success', duration: 38 },
            { id: '7', name: 'Unit Tests', status: 'success', duration: 95 },
            { id: '8', name: 'Build Applications', status: 'success', duration: 180 },
            { id: '9', name: 'Integration Tests', status: 'success', duration: 210 },
            { id: '10', name: 'Deploy to Production', status: 'success', duration: 300 }
          ]
        }
      ])

      setMergeRequests([
        {
          id: '1',
          title: 'Add DevOps pipeline and Docker configuration',
          description: 'Complete CI/CD setup with Docker, health checks, and automated deployments',
          author: 'bahadirarda',
          sourceBranch: 'feature/devops-setup',
          targetBranch: 'main',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          approvals: 0,
          requiredApprovals: 1,
          conflicts: false,
          pipelineStatus: 'running',
          changes: {
            additions: 450,
            deletions: 23,
            files: 12
          }
        },
        {
          id: '2',
          title: 'Update admin panel automation features',
          description: 'Enhanced admin panel with pipeline management and merge request approval system',
          author: 'team-member',
          sourceBranch: 'feature/admin-automation',
          targetBranch: 'develop',
          status: 'open',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          approvals: 1,
          requiredApprovals: 2,
          conflicts: true,
          pipelineStatus: 'failed',
          changes: {
            additions: 280,
            deletions: 56,
            files: 8
          }
        }
      ])

      setDeployments([
        {
          environment: 'Production',
          status: 'success',
          version: 'v1.2.3',
          lastDeployment: new Date(Date.now() - 3600000).toISOString(),
          health: 'healthy'
        },
        {
          environment: 'Staging',
          status: 'deploying',
          version: 'v1.2.4-rc.1',
          lastDeployment: new Date().toISOString(),
          health: 'unknown'
        },
        {
          environment: 'Development',
          status: 'success',
          version: 'v1.2.4-dev.15',
          lastDeployment: new Date(Date.now() - 900000).toISOString(),
          health: 'healthy'
        }
      ])

      setFeatureFlags([
        {
          id: '1',
          name: 'enhanced_status_page',
          description: 'New enhanced status page with real-time metrics',
          enabled: true,
          environment: 'production',
          rolloutPercentage: 100,
          lastModified: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '2',
          name: 'admin_automation_v2',
          description: 'Advanced admin panel automation features',
          enabled: false,
          environment: 'staging',
          rolloutPercentage: 50,
          lastModified: new Date().toISOString()
        }
      ])

      // Update notifications count
      const pendingMerges = mergeRequests.filter(mr => mr.status === 'open' && mr.requiredApprovals > mr.approvals).length
      setNotifications(pendingMerges)

    } catch (error) {
      console.error('Failed to load automation data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMergeApproval = async (mergeId: string, action: 'approve' | 'reject') => {
    const updatedMergeRequests = mergeRequests.map(mr => 
      mr.id === mergeId 
        ? { 
            ...mr, 
            approvals: action === 'approve' ? mr.approvals + 1 : mr.approvals,
            status: action === 'reject' ? 'closed' as const : mr.approvals + 1 >= mr.requiredApprovals ? 'merged' as const : mr.status
          }
        : mr
    )
    setMergeRequests(updatedMergeRequests)

    // In real implementation, this would call the Git API
    console.log(`${action === 'approve' ? 'Approved' : 'Rejected'} merge request ${mergeId}`)
  }

  const handlePipelineAction = async (pipelineId: string, action: 'retry' | 'cancel') => {
    const updatedPipelines = pipelines.map(p => 
      p.id === pipelineId 
        ? { ...p, status: action === 'retry' ? 'pending' as const : 'cancelled' as const }
        : p
    )
    setPipelines(updatedPipelines)

    console.log(`${action === 'retry' ? 'Retried' : 'Cancelled'} pipeline ${pipelineId}`)
  }

  const handleFeatureFlagToggle = async (flagId: string) => {
    const updatedFlags = featureFlags.map(flag => 
      flag.id === flagId 
        ? { ...flag, enabled: !flag.enabled, lastModified: new Date().toISOString() }
        : flag
    )
    setFeatureFlags(updatedFlags)

    console.log(`Toggled feature flag ${flagId}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
      case 'merged':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
      case 'unhealthy':
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'running':
      case 'deploying':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'pending':
      case 'unknown':
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
      case 'merged':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'failed':
      case 'unhealthy':
      case 'closed':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'running':
      case 'deploying':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'pending':
      case 'unknown':
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">DevOps Automation</h2>
            <p className="text-gray-600">CI/CD Pipeline Management & Deployment Control</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {notifications > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <Bell className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                {notifications} pending approval{notifications > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          <button
            onClick={loadAutomationData}
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
            { id: 'pipelines', label: 'Pipelines', icon: Activity, count: pipelines.filter(p => p.status === 'running').length },
            { id: 'merges', label: 'Merge Requests', icon: GitMerge, count: mergeRequests.filter(mr => mr.status === 'open').length },
            { id: 'deployments', label: 'Deployments', icon: Server, count: deployments.filter(d => d.status === 'deploying').length },
            { id: 'features', label: 'Feature Flags', icon: Settings, count: featureFlags.filter(f => f.enabled).length }
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
        {/* Pipelines Tab */}
        {activeTab === 'pipelines' && (
          <div className="space-y-4">
            {pipelines.map((pipeline) => (
              <div key={pipeline.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(pipeline.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          <GitBranch className="w-4 h-4 inline mr-1" />
                          {pipeline.branch}
                        </h3>
                        <p className="text-sm text-gray-600">{pipeline.message}</p>
                        <p className="text-xs text-gray-500">
                          by {pipeline.author} • {new Date(pipeline.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pipeline.status)}`}>
                        {pipeline.status}
                      </span>
                      
                      {(pipeline.status === 'failed' || pipeline.status === 'cancelled') && (
                        <button
                          onClick={() => handlePipelineAction(pipeline.id, 'retry')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      {pipeline.status === 'running' && (
                        <button
                          onClick={() => handlePipelineAction(pipeline.id, 'cancel')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  {pipeline.jobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(job.status)}
                        <span className="font-medium text-gray-900">{job.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {job.duration && (
                          <span>{Math.floor(job.duration / 60)}m {job.duration % 60}s</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Merge Requests Tab */}
        {activeTab === 'merges' && (
          <div className="space-y-4">
            {mergeRequests.map((mr) => (
              <div key={mr.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{mr.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{mr.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>by {mr.author}</span>
                      <span>{mr.sourceBranch} → {mr.targetBranch}</span>
                      <span>{new Date(mr.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(mr.status)}`}>
                      {mr.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600">+{mr.changes.additions}</span>
                    <span className="text-red-600">-{mr.changes.deletions}</span>
                    <span className="text-gray-600">{mr.changes.files} files</span>
                    
                    {mr.conflicts && (
                      <span className="flex items-center space-x-1 text-orange-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Conflicts</span>
                      </span>
                    )}
                    
                    {mr.pipelineStatus && (
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(mr.pipelineStatus)}
                        <span>Pipeline {mr.pipelineStatus}</span>
                      </div>
                    )}
                  </div>
                  
                  {mr.status === 'open' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {mr.approvals}/{mr.requiredApprovals} approvals
                      </span>
                      
                      <button
                        onClick={() => handleMergeApproval(mr.id, 'reject')}
                        className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                      
                      <button
                        onClick={() => handleMergeApproval(mr.id, 'approve')}
                        className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Deployments Tab */}
        {activeTab === 'deployments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deployments.map((deployment, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{deployment.environment}</h3>
                  {getStatusIcon(deployment.status)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-mono">{deployment.version}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(deployment.status)}`}>
                      {deployment.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health:</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(deployment.health)}`}>
                      {deployment.health}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Deploy:</span>
                    <span>{new Date(deployment.lastDeployment).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feature Flags Tab */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            {featureFlags.map((flag) => (
              <div key={flag.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{flag.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{flag.environment}</span>
                      <span>{flag.rolloutPercentage}% rollout</span>
                      <span>Modified {new Date(flag.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      flag.enabled 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    
                    <button
                      onClick={() => handleFeatureFlagToggle(flag.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        flag.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          flag.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 