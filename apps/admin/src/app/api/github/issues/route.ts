import { NextRequest, NextResponse } from 'next/server'

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

// Issues ve PR'ları listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repository = searchParams.get('repository')
    const type = searchParams.get('type') || 'all' // 'issues', 'pulls', 'all'
    const state = searchParams.get('state') || 'open' // 'open', 'closed', 'all'

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching ${type} for ${repository} (state: ${state})`)

    let issues = []
    let pullRequests = []

    // Issues getir (eğer type issues veya all ise)
    if (type === 'issues' || type === 'all') {
      const issuesResponse = await fetchGitHubAPI(
        `/repos/${GITHUB_OWNER}/${repository}/issues?state=${state}&per_page=20&sort=updated`
      )
      // Pull request olmayan sadece issue'ları filtrele
      issues = issuesResponse.filter((item: any) => !item.pull_request)
    }

    // Pull requests getir (eğer type pulls veya all ise)
    if (type === 'pulls' || type === 'all') {
      pullRequests = await fetchGitHubAPI(
        `/repos/${GITHUB_OWNER}/${repository}/pulls?state=${state}&per_page=20&sort=updated`
      )
    }

    // Her PR için workflow status bilgisini getir
    const enrichedPRs = await Promise.all(
      pullRequests.map(async (pr: any) => {
        try {
          // PR'ın check runs'larını getir
          const checkRuns = await fetchGitHubAPI(
            `/repos/${GITHUB_OWNER}/${repository}/commits/${pr.head.sha}/check-runs`
          )

          // PR'ın status'unu getir
          const status = await fetchGitHubAPI(
            `/repos/${GITHUB_OWNER}/${repository}/commits/${pr.head.sha}/status`
          )

          return {
            ...pr,
            check_runs: checkRuns.check_runs || [],
            ci_status: status.state || 'unknown',
            combined_status: status
          }
        } catch (error) {
          console.warn(`Could not fetch CI status for PR #${pr.number}:`, error)
          return {
            ...pr,
            check_runs: [],
            ci_status: 'unknown',
            combined_status: null
          }
        }
      })
    )

    console.log(`✅ Found ${issues.length} issues and ${enrichedPRs.length} PRs for ${repository}`)

    return NextResponse.json({
      repository,
      issues: issues.slice(0, 10),
      pull_requests: enrichedPRs.slice(0, 10),
      total_issues: issues.length,
      total_prs: enrichedPRs.length,
      last_updated: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ GitHub issues/PRs fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub issues/PRs', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// Yeni issue oluştur
export async function POST(request: NextRequest) {
  try {
    const { repository, title, body, labels = [], assignees = [] } = await request.json()

    if (!repository || !title) {
      return NextResponse.json(
        { error: 'Repository and title are required' },
        { status: 400 }
      )
    }

    console.log(`📝 Creating new issue in ${repository}: ${title}`)

    const newIssue = await fetchGitHubAPI(
      `/repos/${GITHUB_OWNER}/${repository}/issues`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body: body || '',
          labels,
          assignees
        })
      }
    )

    console.log(`✅ Created issue #${newIssue.number} in ${repository}`)

    return NextResponse.json({
      success: true,
      message: `Issue #${newIssue.number} created successfully`,
      issue: newIssue,
      created_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ GitHub issue creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create GitHub issue', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
} 