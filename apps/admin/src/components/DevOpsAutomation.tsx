"use client";

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitMerge, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Settings, 
  Eye,
  GitCommit,
  Users,
  Play,
  CheckCircle,
  XCircle,
  Circle,
  Loader2,
  Calendar,
  FileText,
  ArrowRight,
  Shield,
  Star,
  Activity,
  Github,
  Plus,
  ExternalLink,
  User,
  ChevronDown,
  ChevronUp,
  File,
  FilePlus,
  FileX,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

// Types
interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | 'merged';
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
  draft: boolean;
  mergeable?: boolean;
  mergeable_state: string;
  additions?: number;
  deletions?: number;
  changed_files?: number;
  commits?: number;
  review_comments?: number;
  comments?: number;
  files?: Array<{
    filename: string;
    status: 'added' | 'modified' | 'removed';
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>;
}

interface MergeRequest {
  id: string;
  external_id?: string;
  title: string;
  description?: string;
  author: string;
  source_branch: string;
  target_branch: string;
  status: 'open' | 'merged' | 'closed' | 'draft';
  approvals: number;
  required_approvals: number;
  conflicts: boolean;
  pipeline_status?: string;
  additions: number;
  deletions: number;
  files_changed: number;
  created_at: string;
  updated_at: string;
}

interface Pipeline {
  id: string;
  branch: string;
  commit_sha: string;
  author: string;
  message?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  environment: string;
  started_at: string;
  finished_at?: string;
  created_at: string;
}

interface Deployment {
  id: string;
  environment: string;
  version: string;
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rolled_back';
  health: 'healthy' | 'unhealthy' | 'unknown';
  deployed_by?: string;
  deployed_at: string;
  created_at: string;
}

interface GitHubIntegration {
  id: string;
  repository: string;
  status: 'active' | 'inactive';
  lastSync: string;
}

const DevOpsAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pull_requests' | 'pipelines' | 'deployments' | 'settings'>('pipelines');
  const [githubPRs, setGithubPRs] = useState<GitHubPullRequest[]>([]);
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPR, setSelectedPR] = useState<GitHubPullRequest | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [githubIntegration, setGithubIntegration] = useState<GitHubIntegration | null>(null);
  const [expandedPRs, setExpandedPRs] = useState<Set<number>>(new Set());

  // Get single supabase instance
  const supabase = getSupabaseClient();

  // Markdown render helper
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    
    return text
      // Bold text **text** -> <strong>text</strong>
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic text *text* -> <em>text</em>
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Code blocks ```code``` -> <code>code</code>
      .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 p-2 rounded text-sm overflow-x-auto"><code>$1</code></pre>')
      // Inline code `code` -> <code>code</code>
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      // Links [text](url) -> <a>text</a>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Headers ### -> <h3>
      .replace(/^### ([^\n]+)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## ([^\n]+)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# ([^\n]+)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Lists - text -> <li>text</li>
      .replace(/^- (.+)/gm, '<li class="ml-4">• $1</li>')
      // Checkboxes [x] -> ✅ [ ] -> ☐
      .replace(/\[x\]/g, '✅')
      .replace(/\[ \]/g, '☐');
  };

  // Toggle PR expansion
  const togglePRExpansion = (prNumber: number) => {
    const newExpanded = new Set(expandedPRs);
    if (newExpanded.has(prNumber)) {
      newExpanded.delete(prNumber);
    } else {
      newExpanded.add(prNumber);
    }
    setExpandedPRs(newExpanded);
  };

  // File status icon
  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <FilePlus className="w-4 h-4 text-green-600" />;
      case 'removed':
        return <FileX className="w-4 h-4 text-red-600" />;
      case 'modified':
      default:
        return <File className="w-4 h-4 text-blue-600" />;
    }
  };

  // File status color
  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'removed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'modified':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Fetch GitHub integration data directly from Supabase
  const fetchGitHubIntegration = async () => {
    try {
      const { data: integration, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('type', 'github')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching GitHub integration:', error);
        return;
      }

      if (integration) {
        // Extract repository from configuration
        let repository = 'enterprise-core-system'; // Default fallback
        if (integration.configuration && integration.configuration.repositories && integration.configuration.repositories.length > 0) {
          const repoName = integration.configuration.repositories[0];
          repository = repoName; // Just use the repo name directly since org_name is empty
        }

        setGithubIntegration({
          id: integration.id,
          repository: repository,
          status: integration.status,
          lastSync: integration.updated_at
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching GitHub integration:', error);
    }
  };

  // Fetch GitHub Pull Requests
  const fetchGitHubPullRequests = async () => {
    try {
      const response = await fetch('/api/devops/github/pull-requests');
      if (response.ok) {
        const data = await response.json();
        setGithubPRs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('GitHub PR fetch error:', error);
      setGithubPRs([]);
    }
  };

  // Fetch pipelines
  const fetchPipelines = async () => {
    try {
      const response = await fetch('/api/devops/pipelines');
      if (response.ok) {
        const data = await response.json();
        setPipelines(Array.isArray(data.pipelines) ? data.pipelines : []);
      }
    } catch (error) {
      console.error('Pipelines fetch error:', error);
      setPipelines([]);
    }
  };

  // Fetch deployments
  const fetchDeployments = async () => {
    try {
      const response = await fetch('/api/devops/deployments');
      if (response.ok) {
        const data = await response.json();
        setDeployments(Array.isArray(data.deployments) ? data.deployments : []);
      }
    } catch (error) {
      console.error('Deployments fetch error:', error);
      setDeployments([]);
    }
  };

  // Fetch merge requests
  const fetchMergeRequests = async () => {
    try {
      const response = await fetch('/api/devops/merge-requests');
      if (response.ok) {
        const data = await response.json();
        setMergeRequests(Array.isArray(data.merge_requests) ? data.merge_requests : []);
      }
    } catch (error) {
      console.error('Merge requests fetch error:', error);
      setMergeRequests([]);
    }
  };

  // Optimized data fetching - tüm verileri paralel çek ve single loading state kullan
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      try {
        // Tüm verileri paralel olarak çek - tek Promise.all ile
        await Promise.all([
          fetchGitHubIntegration(),
          fetchGitHubPullRequests(),
          fetchPipelines(),
          fetchDeployments(),
          fetchMergeRequests()
        ]);
      } catch (error) {
        console.error('Error fetching DevOps data:', error);
      } finally {
        // Loading'i tek seferde kapat
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleApproval = async (prId: number, action: 'approve' | 'reject') => {
    setIsApproving(prId.toString());
    try {
      const response = await fetch('/api/devops/github/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pull_number: prId,
          action,
          body: action === 'approve' ? 'LGTM! Approved for merge.' : 'Changes requested.'
        }),
      });

      if (response.ok) {
        // Refresh PR data
        await fetchGitHubPullRequests();
      }
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setIsApproving(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'merged':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
      case 'pending':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'merged':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'open':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Skeleton Components
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-48"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="flex items-center space-x-4 text-sm mb-3">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  const CompactSkeletonCard = () => (
    <div className="border border-gray-200 rounded-lg p-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-300 rounded w-32"></div>
            <div className="h-2 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-2 bg-gray-200 rounded w-16"></div>
          <div className="h-2 bg-gray-200 rounded w-12"></div>
          <div className="h-5 bg-gray-200 rounded-full w-12"></div>
        </div>
      </div>
    </div>
  );

  const PullRequestCard = ({ pr }: { pr: GitHubPullRequest }) => {
    const isExpanded = expandedPRs.has(pr.number);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <GitMerge className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 
                className="font-medium text-gray-900 text-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(pr.title) }}
              />
              <p className="text-xs text-gray-600 mt-1">
                {pr.head.ref} → {pr.base.ref}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pr.state)}`}>
              {pr.state.toUpperCase()}
            </span>
            <button
              onClick={() => togglePRExpansion(pr.number)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <img 
              src={pr.user.avatar_url} 
              alt={pr.user.login}
              className="w-4 h-4 rounded-full"
            />
            <span>{pr.user.login}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(pr.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
          {pr.additions !== undefined && (
            <div className="flex items-center space-x-2">
              <span className="text-green-600">+{pr.additions}</span>
              <span className="text-red-600">-{pr.deletions}</span>
              <span>{pr.changed_files} files</span>
            </div>
          )}
          {pr.commits && (
            <div className="flex items-center space-x-1">
              <GitCommit className="w-3 h-3" />
              <span>{pr.commits} commits</span>
            </div>
          )}
          {(pr.comments || pr.review_comments) && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{(pr.comments || 0) + (pr.review_comments || 0)} comments</span>
            </div>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-gray-100 pt-3 mt-3 space-y-3">
            {/* PR Description */}
            {pr.body && (
              <div className="prose prose-sm max-w-none">
                <div 
                  className="text-gray-700 text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(pr.body) }}
                />
              </div>
            )}

            {/* Changed Files */}
            {pr.files && pr.files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Changed Files ({pr.files.length})</h4>
                <div className="space-y-1">
                  {pr.files.slice(0, 5).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        {getFileStatusIcon(file.status)}
                        <span className="truncate font-mono">{file.filename}</span>
                        <span className={`px-1 py-0.5 rounded text-xs border ${getFileStatusColor(file.status)}`}>
                          {file.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 ml-2">
                        <span className="text-green-600">+{file.additions}</span>
                        <span className="text-red-600">-{file.deletions}</span>
                      </div>
                    </div>
                  ))}
                  {pr.files.length > 5 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      ... and {pr.files.length - 5} more files
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Impact Analysis */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📊 Impact Analysis</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-blue-800">Lines Changed:</span>
                  <span className="ml-1 text-blue-700">{(pr.additions || 0) + (pr.deletions || 0)}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Files Modified:</span>
                  <span className="ml-1 text-blue-700">{pr.changed_files || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Branch Target:</span>
                  <span className="ml-1 text-blue-700">{pr.base.ref}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Commits:</span>
                  <span className="ml-1 text-blue-700">{pr.commits || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(pr.mergeable_state)}
            <span className="text-xs text-gray-600">
              {pr.mergeable_state === 'clean' ? 'Ready to merge' : 
               pr.mergeable_state === 'blocked' ? 'Blocked' : 
               pr.mergeable_state === 'unstable' ? 'Checks pending' : 'Status unknown'}
            </span>
          </div>

          {pr.state === 'open' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleApproval(pr.number, 'reject')}
                disabled={isApproving === pr.number.toString()}
                className="flex items-center space-x-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-medium transition-colors"
              >
                {isApproving === pr.number.toString() ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleApproval(pr.number, 'approve')}
                disabled={isApproving === pr.number.toString()}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs font-medium transition-colors"
              >
                {isApproving === pr.number.toString() ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                <span>Approve</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header - Glassmorphism Style */}
      <div className="relative bg-white shadow-sm border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">DevOps Automation</h1>
                <p className="text-gray-600">GitHub integration and deployment management</p>
              </div>
            </div>
            
            {/* Real-time Stats Cards */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Repository</p>
                    <p className="font-medium text-gray-900 text-sm">{githubIntegration?.repository || 'Loading...'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Open PRs</p>
                  <p className="font-bold text-blue-600 text-lg">{githubPRs.filter(pr => pr.state === 'open').length}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Active Pipelines</p>
                  <p className="font-bold text-purple-600 text-lg">{pipelines.filter((p: any) => p.status === 'running').length}</p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Deployments</p>
                  <p className="font-bold text-green-600 text-lg">{deployments.filter((d: any) => d.status === 'success').length}</p>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await Promise.all([
                      fetchGitHubPullRequests(),
                      fetchPipelines(),
                      fetchDeployments()
                    ]);
                  } catch (error) {
                    console.error('Refresh error:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                title="Refresh all data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                id: 'pull_requests', 
                label: 'Pull Requests', 
                count: githubPRs.length,
                icon: GitMerge,
                color: 'blue'
              },
              { 
                id: 'pipelines', 
                label: 'Pipelines', 
                count: pipelines.length,
                icon: Play,
                color: 'purple'
              },
              { 
                id: 'deployments', 
                label: 'Deployments', 
                count: deployments.length,
                icon: Activity,
                color: 'green'
              },
              { 
                id: 'settings', 
                label: 'Settings', 
                count: 0,
                icon: Settings,
                color: 'gray'
              }
            ].map((tab) => {
              const Icon = tab.icon;
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
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content with improved loading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="space-y-6">
            {/* Loading state with progress indicator */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-gray-600 font-medium">Loading {activeTab.replace('_', ' ')}...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
            
            {activeTab === 'pull_requests' && (
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
            )}
            
            {(activeTab === 'pipelines' || activeTab === 'deployments') && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                        <div>
                          <div className="h-3 bg-gray-300 rounded w-32 mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {activeTab === 'pull_requests' && (
              <div className="space-y-6">
                {/* Enhanced header with filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <GitMerge className="w-5 h-5 text-blue-600" />
                      <span>Pull Requests</span>
                    </h2>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">{githubPRs.filter(pr => pr.state === 'open').length} open</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-600">{githubPRs.filter(pr => pr.state === 'merged').length} merged</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-600">{githubPRs.filter(pr => pr.state === 'closed').length} closed</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-blue-600 font-semibold text-lg">{githubPRs.length}</p>
                      <p className="text-blue-800 text-xs">Total PRs</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-green-600 font-semibold text-lg">{githubPRs.filter(pr => pr.mergeable_state === 'clean').length}</p>
                      <p className="text-green-800 text-xs">Ready to merge</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-orange-600 font-semibold text-lg">{githubPRs.filter(pr => pr.draft).length}</p>
                      <p className="text-orange-800 text-xs">Draft PRs</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-purple-600 font-semibold text-lg">{githubPRs.reduce((sum, pr) => sum + (pr.additions || 0), 0)}</p>
                      <p className="text-purple-800 text-xs">Lines added</p>
                    </div>
                  </div>
                </div>
                
                {githubPRs.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <GitMerge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No pull requests found</h3>
                    <p className="text-gray-600 mb-4">Connect to GitHub to see pull requests</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Configure GitHub
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {githubPRs.map((pr) => (
                      <PullRequestCard key={pr.id} pr={pr} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pipelines' && (
              <div className="space-y-6">
                {/* Pipelines Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <Play className="w-5 h-5 text-purple-600" />
                      <span>CI/CD Pipelines</span>
                    </h2>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">{pipelines.filter((p: any) => p.status === 'running').length} running</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">{pipelines.filter((p: any) => p.status === 'success').length} successful</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">{pipelines.filter((p: any) => p.status === 'failed').length} failed</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pipeline stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-purple-600 font-semibold text-lg">{pipelines.length}</p>
                      <p className="text-purple-800 text-xs">Total Pipelines</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-blue-600 font-semibold text-lg">{pipelines.filter((p: any) => p.status === 'running').length}</p>
                      <p className="text-blue-800 text-xs">Currently Running</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-green-600 font-semibold text-lg">{Math.round((pipelines.filter((p: any) => p.status === 'success').length / (pipelines.length || 1)) * 100)}%</p>
                      <p className="text-green-800 text-xs">Success Rate</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-orange-600 font-semibold text-lg">{new Set(pipelines.map((p: any) => p.environment)).size}</p>
                      <p className="text-orange-800 text-xs">Environments</p>
                    </div>
                  </div>
                </div>

                {pipelines.length > 0 ? (
                  <div className="space-y-3">
                    {pipelines.map((pipeline: any) => (
                      <div key={pipeline.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              pipeline.status === 'success' ? 'bg-green-100' :
                              pipeline.status === 'failed' ? 'bg-red-100' :
                              pipeline.status === 'running' ? 'bg-blue-100' :
                              'bg-gray-100'
                            }`}>
                              <Play className={`h-4 w-4 ${
                                pipeline.status === 'success' ? 'text-green-600' :
                                pipeline.status === 'failed' ? 'text-red-600' :
                                pipeline.status === 'running' ? 'text-blue-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {pipeline.branch}/{pipeline.name || 'Pipeline'}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-mono">{pipeline.commit_sha?.substring(0, 7) || 'N/A'}</span>
                                {pipeline.message && ` • ${pipeline.message.substring(0, 50)}${pipeline.message.length > 50 ? '...' : ''}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 flex-shrink-0">
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center space-x-1 mb-1">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-20">{pipeline.author}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className={`w-2 h-2 rounded-full ${
                                  pipeline.environment === 'production' ? 'bg-red-400' :
                                  pipeline.environment === 'staging' ? 'bg-yellow-400' :
                                  'bg-blue-400'
                                } flex-shrink-0`}></span>
                                <span className="truncate">{pipeline.environment}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(pipeline.created_at).toLocaleDateString('tr-TR')}
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                              pipeline.status === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                              pipeline.status === 'failed' ? 'bg-red-100 text-red-700 border border-red-200' :
                              pipeline.status === 'running' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {pipeline.status === 'running' && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
                              {pipeline.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Play className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No pipelines configured</h3>
                    <p className="text-gray-600 mb-4">CI/CD pipelines will appear here when set up</p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Configure Pipelines
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deployments' && (
              <div className="space-y-6">
                {/* Deployments Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      <span>Deployments</span>
                    </h2>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">{deployments.filter((d: any) => d.status === 'deploying').length} deploying</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">{deployments.filter((d: any) => d.status === 'success').length} successful</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">{deployments.filter((d: any) => d.status === 'failed').length} failed</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Deployment stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-green-600 font-semibold text-lg">{deployments.length}</p>
                      <p className="text-green-800 text-xs">Total Deployments</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-blue-600 font-semibold text-lg">{deployments.filter((d: any) => d.health === 'healthy').length}</p>
                      <p className="text-blue-800 text-xs">Healthy Services</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-purple-600 font-semibold text-lg">{Math.round((deployments.filter((d: any) => d.status === 'success').length / (deployments.length || 1)) * 100)}%</p>
                      <p className="text-purple-800 text-xs">Success Rate</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-orange-600 font-semibold text-lg">{new Set(deployments.map((d: any) => d.environment)).size}</p>
                      <p className="text-orange-800 text-xs">Environments</p>
                    </div>
                  </div>
                </div>

                {deployments.length > 0 ? (
                  <div className="space-y-3">
                    {deployments.map((deployment: any) => (
                      <div key={deployment.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              deployment.status === 'success' ? 'bg-green-100' :
                              deployment.status === 'failed' ? 'bg-red-100' :
                              deployment.status === 'deploying' ? 'bg-blue-100' :
                              'bg-yellow-100'
                            }`}>
                              <Activity className={`h-4 w-4 ${
                                deployment.status === 'success' ? 'text-green-600' :
                                deployment.status === 'failed' ? 'text-red-600' :
                                deployment.status === 'deploying' ? 'text-blue-600' :
                                'text-yellow-600'
                              }`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {deployment.environment}
                                </h3>
                                {deployment.health && (
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                    deployment.health === 'healthy' ? 'bg-green-100 text-green-700 border border-green-200' :
                                    deployment.health === 'unhealthy' ? 'bg-red-100 text-red-700 border border-red-200' :
                                    'bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}>
                                    {deployment.health}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-semibold">v{deployment.version}</span>
                                {deployment.commit_sha && (
                                  <span className="font-mono ml-1">• {deployment.commit_sha.substring(0, 7)}</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 flex-shrink-0">
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center space-x-1 mb-1">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-20">{deployment.deployed_by}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(deployment.created_at).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                              deployment.status === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                              deployment.status === 'failed' ? 'bg-red-100 text-red-700 border border-red-200' :
                              deployment.status === 'deploying' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            }`}>
                              {deployment.status === 'deploying' && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
                              {deployment.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No deployments found</h3>
                    <p className="text-gray-600 mb-4">Deployment history will appear here</p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Create Deployment
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>DevOps Settings</span>
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">GitHub Integration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Repository</label>
                          <input 
                            type="text" 
                            value={githubIntegration?.repository || 'Not connected'}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-green-700 font-medium">Connected to GitHub</span>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Sync</label>
                          <p className="text-sm text-gray-600 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                            {githubIntegration?.lastSync 
                              ? new Date(githubIntegration.lastSync).toLocaleString('tr-TR')
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">🚀 Configuration Options</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Advanced DevOps settings and integrations coming soon.
                      </p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Configure Advanced Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DevOpsAutomation; 