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
  Server,
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

interface TeamsConnection {
  // Add appropriate properties for TeamsConnection
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
      // Fetch real data from API endpoints
      const [pipelinesResponse, mergeRequestsResponse, deploymentsResponse, featureFlagsResponse] = await Promise.all([
        fetch('/api/automation/pipelines'),
        fetch('/api/automation/merge-requests'),
        fetch('/api/automation/deployments'),
        fetch('/api/automation/feature-flags')
      ]);

      const [pipelinesData, mergeRequestsData, deploymentsData, featureFlagsData] = await Promise.all([
        pipelinesResponse.json(),
        mergeRequestsResponse.json(),
        deploymentsResponse.json(),
        featureFlagsResponse.json()
      ]);

      // Transform pipelines data
      const transformedPipelines = pipelinesData.map((pipeline: Pipeline) => ({
        id: pipeline.id,
        status: pipeline.status,
        branch: pipeline.branch,
        commit: pipeline.commit.substring(0, 7) || 'unknown',
        author: pipeline.author,
        message: pipeline.message,
        createdAt: pipeline.createdAt,
        jobs: pipeline.jobs?.map((job: PipelineJob) => ({
          id: job.id || `${pipeline.id}-${job.name}`,
          name: job.name,
          status: job.status,
          duration: job.duration,
          startedAt: job.startedAt,
          finishedAt: job.finishedAt
        })) || []
      }));

      // Transform merge requests data
      const transformedMergeRequests = mergeRequestsData.map((mr: MergeRequest) => ({
        id: mr.id,
        title: mr.title,
        description: mr.description,
        author: mr.author,
        sourceBranch: mr.sourceBranch,
        targetBranch: mr.targetBranch,
        status: mr.status,
        createdAt: mr.createdAt,
        updatedAt: mr.updatedAt,
        approvals: mr.approvals || 0,
        requiredApprovals: mr.requiredApprovals || 1,
        conflicts: mr.conflicts || false,
        pipelineStatus: mr.pipelineStatus,
        changes: {
          additions: mr.changes?.additions || 0,
          deletions: mr.changes?.deletions || 0,
          files: mr.changes?.files || 0
        }
      }));

      // Transform deployments data
      const transformedDeployments = deploymentsData.map((deployment: DeploymentStatus) => ({
        environment: deployment.environment,
        status: deployment.status,
        version: deployment.version,
        lastDeployment: deployment.lastDeployment,
        health: deployment.health
      }));

      // Transform feature flags data
      const transformedFeatureFlags = featureFlagsData.map((flag: FeatureFlag) => ({
        id: flag.id,
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        environment: flag.environment,
        rolloutPercentage: flag.rolloutPercentage,
        lastModified: flag.lastModified
      }));

      setPipelines(transformedPipelines);
      setMergeRequests(transformedMergeRequests);
      setDeployments(transformedDeployments);
      setFeatureFlags(transformedFeatureFlags);

      // Update notifications count
      const pendingMerges = transformedMergeRequests.filter((mr: MergeRequest) => 
        mr.status === 'open' && mr.requiredApprovals > mr.approvals
      ).length;
      setNotifications(pendingMerges);

    } catch (error) {
      console.error('Failed to load automation data:', error);
      
      // Fallback to minimal mock data on error
      setPipelines([]);
      setMergeRequests([]);
      setDeployments([]);
      setFeatureFlags([]);
      setNotifications(0);
    } finally {
      setIsLoading(false);
    }
  }

  const handleMergeApproval = async (mergeId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/automation/merge-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: mergeId,
          action: action,
          approver: 'admin-user', // In real implementation, use actual user
          comment: `${action === 'approve' ? 'Approved' : 'Rejected'} via admin panel`
        })
      });

      if (response.ok) {
        // Reload data to reflect changes
        await loadAutomationData();
        console.log(`${action === 'approve' ? 'Approved' : 'Rejected'} merge request ${mergeId}`);
      } else {
        console.error('Failed to update merge request');
      }
    } catch (error) {
      console.error('Error updating merge request:', error);
    }
  }

  const handlePipelineAction = async (pipelineId: string, action: 'retry' | 'cancel') => {
    try {
      const response = await fetch('/api/automation/pipelines', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: pipelineId,
          action: action
        })
      });

      if (response.ok) {
        // Reload data to reflect changes
        await loadAutomationData();
        console.log(`${action === 'retry' ? 'Retried' : 'Cancelled'} pipeline ${pipelineId}`);
      } else {
        console.error('Failed to update pipeline');
      }
    } catch (error) {
      console.error('Error updating pipeline:', error);
    }
  }

  const handleFeatureFlagToggle = async (flagId: string) => {
    try {
      // Get current flag to toggle it
      const currentFlag = featureFlags.find(flag => flag.id === flagId);
      if (!currentFlag) return;

      const response = await fetch('/api/automation/feature-flags', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: flagId,
          enabled: !currentFlag.enabled
        })
      });

      if (response.ok) {
        // Reload data to reflect changes
        await loadAutomationData();
        console.log(`Toggled feature flag ${flagId}`);
      } else {
        console.error('Failed to update feature flag');
      }
    } catch (error) {
      console.error('Error updating feature flag:', error);
    }
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
              }`