import { NextRequest, NextResponse } from 'next/server'

// GitHub API entegrasyonu için
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
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching GitHub repositories...')

    // Kullanıcının repository'lerini getir
    const repos = await fetchGitHubAPI(`/users/${GITHUB_OWNER}/repos?sort=updated&per_page=50`)

    // Sadece aktif ve son 1 yıl içinde güncellenmiş repo'ları filtrele
    const activeRepos = repos.filter((repo: any) => {
      const lastUpdate = new Date(repo.updated_at)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      return lastUpdate > oneYearAgo && !repo.archived
    })

    // Her repo için workflow runs bilgisini getir
    const reposWithWorkflows = await Promise.all(
      activeRepos.slice(0, 10).map(async (repo: any) => {
        try {
          // Workflow runs'ları getir
          const workflowRuns = await fetchGitHubAPI(
            `/repos/${GITHUB_OWNER}/${repo.name}/actions/runs?per_page=5`
          )

          // Recent commits
          const commits = await fetchGitHubAPI(
            `/repos/${GITHUB_OWNER}/${repo.name}/commits?per_page=3`
          )

          return {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            default_branch: repo.default_branch,
            updated_at: repo.updated_at,
            language: repo.language,
            stargazers_count: repo.stargazers_count,
            workflow_runs: workflowRuns.workflow_runs || [],
            recent_commits: commits.slice(0, 3) || [],
            has_actions: workflowRuns.total_count > 0
          }
        } catch (error) {
          console.warn(`Could not fetch workflows for ${repo.name}:`, error)
          return {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            default_branch: repo.default_branch,
            updated_at: repo.updated_at,
            language: repo.language,
            stargazers_count: repo.stargazers_count,
            workflow_runs: [],
            recent_commits: [],
            has_actions: false
          }
        }
      })
    )

    console.log(`✅ Found ${reposWithWorkflows.length} active repositories`)

    return NextResponse.json({
      repositories: reposWithWorkflows,
      total: reposWithWorkflows.length,
      last_updated: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ GitHub repos API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repositories', details: (error as Error).message },
      { status: 500 }
    )
  }
} 