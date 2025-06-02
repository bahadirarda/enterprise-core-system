import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side için Supabase client oluştur
function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// GitHub API entegrasyonu
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = 'bahadirarda'

async function fetchGitHubAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'HRMS-DevOps-Panel',
      ...options.headers
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient()
    
    console.log('🔍 Fetching comprehensive GitHub data (workflows, PRs, branch protection)...')

    // Ana repository'ler - daha fazla sayıda workflow runs çekelim
    const targetRepos = ['enterprise-core-system', 'steam-currency-converter', 'menu-app']
    
    // GitHub'tan gerçek workflow runs'ları çek (daha fazla sayıda)
    const gitHubPipelines = []
    for (const repo of targetRepos) {
      try {
        // Daha fazla workflow runs çek (per_page=50)
        const workflowRuns = await fetchGitHubAPI(
          `/repos/${GITHUB_OWNER}/${repo}/actions/runs?per_page=50&status=completed,in_progress,queued`
        )
        
        console.log(`📊 ${repo}: Found ${workflowRuns.total_count} total workflow runs, showing ${workflowRuns.workflow_runs?.length || 0}`)
        
        for (const run of workflowRuns.workflow_runs || []) {
          // Workflow'un detaylarını al
          let workflowDetails = null
          try {
            workflowDetails = await fetchGitHubAPI(`/repos/${GITHUB_OWNER}/${repo}/actions/workflows/${run.workflow_id}`)
          } catch (error) {
            console.warn(`Could not fetch workflow details for ${run.workflow_id}`)
          }

          gitHubPipelines.push({
            id: `github-${run.id}`,
            repository: repo,
            branch: run.head_branch,
            commit_sha: run.head_sha.substring(0, 8),
            status: run.status === 'completed' ? 
              (run.conclusion === 'success' ? 'success' : 
               run.conclusion === 'failure' ? 'failed' :
               run.conclusion === 'cancelled' ? 'cancelled' : 'failed') : 
              (run.status === 'in_progress' ? 'running' : 
               run.status === 'queued' ? 'pending' : 'pending'),
            started_at: run.run_started_at || run.created_at,
            completed_at: run.updated_at,
            workflow_name: run.name,
            workflow_file: workflowDetails?.path || 'Unknown workflow',
            actor: run.actor?.login || 'unknown',
            html_url: run.html_url,
            conclusion: run.conclusion,
            run_number: run.run_number,
            event: run.event, // push, pull_request, workflow_dispatch, etc.
            jobs_url: run.jobs_url,
            duration: run.run_started_at && run.updated_at ? 
              Math.round((new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000) : null
          })
        }
      } catch (error) {
        console.warn(`Could not fetch workflows for ${repo}:`, error)
      }
    }

    // GitHub'tan gerçek PR'ları çek ve branch protection kontrolü
    const gitHubMergeRequests = []
    const branchProtectionInfo: Record<string, any> = {}
    
    for (const repo of targetRepos) {
      try {
        // Branch protection rules kontrol et
        try {
          const branchProtection = await fetchGitHubAPI(
            `/repos/${GITHUB_OWNER}/${repo}/branches/main/protection`
          )
          branchProtectionInfo[repo] = {
            protected: true,
            required_status_checks: branchProtection.required_status_checks,
            required_pull_request_reviews: branchProtection.required_pull_request_reviews,
            restrictions: branchProtection.restrictions,
            enforce_admins: branchProtection.enforce_admins
          }
        } catch (error) {
          branchProtectionInfo[repo] = { protected: false, reason: 'No protection rules' }
        }

        // PR'ları çek (daha fazla)
        const pulls = await fetchGitHubAPI(
          `/repos/${GITHUB_OWNER}/${repo}/pulls?state=all&per_page=30&sort=updated`
        )
        
        console.log(`📋 ${repo}: Found ${pulls.length} pull requests`)
        
        for (const pr of pulls) {
          // PR'ın review'larını al
          let reviews: any[] = []
          try {
            reviews = await fetchGitHubAPI(`/repos/${GITHUB_OWNER}/${repo}/pulls/${pr.number}/reviews`)
          } catch (error) {
            console.warn(`Could not fetch reviews for PR #${pr.number}`)
          }

          // PR'ın check runs'larını al
          let checkRuns: any[] = []
          try {
            const checkRunsResponse = await fetchGitHubAPI(
              `/repos/${GITHUB_OWNER}/${repo}/commits/${pr.head.sha}/check-runs`
            )
            checkRuns = checkRunsResponse.check_runs || []
          } catch (error) {
            console.warn(`Could not fetch check runs for PR #${pr.number}`)
          }

          const approvedReviews = reviews.filter((r: any) => r.state === 'APPROVED').length
          const requestedChanges = reviews.filter((r: any) => r.state === 'CHANGES_REQUESTED').length
          
          gitHubMergeRequests.push({
            id: `github-pr-${pr.id}`,
            repository: repo,
            title: pr.title,
            description: pr.body || '',
            source_branch: pr.head.ref,
            target_branch: pr.base.ref,
            status: pr.state, // 'open', 'closed'
            merged: pr.merged_at !== null,
            author: pr.user?.login || 'unknown',
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            merged_at: pr.merged_at,
            html_url: pr.html_url,
            number: pr.number,
            draft: pr.draft,
            // Review ve approval bilgileri
            approvals: approvedReviews,
            required_approvals: branchProtectionInfo[repo]?.required_pull_request_reviews?.required_approving_review_count || 1,
            changes_requested: requestedChanges,
            total_reviews: reviews.length,
            // CI/CD durumu
            check_runs: checkRuns,
            ci_status: checkRuns.length > 0 ? 
              (checkRuns.every((run: any) => run.conclusion === 'success') ? 'success' :
               checkRuns.some((run: any) => run.conclusion === 'failure') ? 'failed' :
               checkRuns.some((run: any) => run.status === 'in_progress') ? 'running' : 'pending') : 'unknown',
            // Dosya değişiklikleri
            additions: pr.additions,
            deletions: pr.deletions,
            changed_files: pr.changed_files,
            // Branch protection uyumu
            branch_protected: branchProtectionInfo[repo]?.protected || false,
            can_merge: pr.mergeable && !pr.draft && approvedReviews >= (branchProtectionInfo[repo]?.required_pull_request_reviews?.required_approving_review_count || 1)
          })
        }
      } catch (error) {
        console.warn(`Could not fetch PRs for ${repo}:`, error)
      }
    }

    // Supabase'den ek veriler
    const { data: featureFlags } = await supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: deployments } = await supabase
      .from('deployments')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: notifications } = await supabase
      .from('automation_notifications')
      .select('*')
      .eq('read', false)
      .order('created_at', { ascending: false })

    // Verileri sırala (en son güncellenenler önce)
    const sortedPipelines = gitHubPipelines.sort((a, b) => 
      new Date(b.started_at || b.completed_at).getTime() - new Date(a.started_at || a.completed_at).getTime()
    )

    const sortedMergeRequests = gitHubMergeRequests.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    console.log(`✅ GitHub Integration Summary:`)
    console.log(`📊 Total Pipelines: ${sortedPipelines.length}`)
    console.log(`📋 Total PRs: ${sortedMergeRequests.length}`)
    console.log(`🛡️ Protected Repositories: ${Object.values(branchProtectionInfo).filter(b => b.protected).length}/${targetRepos.length}`)

    return NextResponse.json({
      pipelines: sortedPipelines.slice(0, 25), // İlk 25 pipeline
      mergeRequests: sortedMergeRequests.slice(0, 15), // İlk 15 PR
      featureFlags: featureFlags || [],
      deployments: deployments || [],
      notifications: notifications || [],
      branch_protection: branchProtectionInfo,
      statistics: {
        total_pipelines: sortedPipelines.length,
        successful_pipelines: sortedPipelines.filter(p => p.status === 'success').length,
        failed_pipelines: sortedPipelines.filter(p => p.status === 'failed').length,
        running_pipelines: sortedPipelines.filter(p => p.status === 'running').length,
        open_merge_requests: sortedMergeRequests.filter(mr => mr.status === 'open').length,
        draft_prs: sortedMergeRequests.filter(mr => mr.draft).length,
        pending_approvals: sortedMergeRequests.filter(mr => mr.status === 'open' && mr.approvals < mr.required_approvals).length,
        protected_branches: Object.values(branchProtectionInfo).filter(b => b.protected).length,
        total_repositories: targetRepos.length
      },
      last_updated: new Date().toISOString(),
      data_source: 'github_comprehensive_api'
    })

  } catch (error) {
    console.error('❌ Automation status API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automation status', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient()
    const { type, data } = await request.json()

    console.log(`📝 Updating automation status: ${type}`)

    // Type'a göre veri güncelle
    switch (type) {
      case 'pipeline_status':
        const { data: updated } = await supabase
          .from('pipelines')
          .update({ status: data.status })
          .eq('id', data.id)
          .select()
        return NextResponse.json({ success: true, updated })

      case 'feature_flag':
        const { data: flagUpdated } = await supabase
          .from('feature_flags')
          .update({ 
            enabled: data.enabled,
            rollout_percentage: data.rollout_percentage 
          })
          .eq('id', data.id)
          .select()
        return NextResponse.json({ success: true, updated: flagUpdated })

      default:
        return NextResponse.json(
          { error: 'Invalid update type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Automation status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update automation status', details: (error as Error).message },
      { status: 500 }
    )
  }
} 