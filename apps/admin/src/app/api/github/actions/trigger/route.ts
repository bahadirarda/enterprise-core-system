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

export async function POST(request: NextRequest) {
  try {
    const { repository, workflow_id, ref = 'main', inputs = {} } = await request.json()

    if (!repository || !workflow_id) {
      return NextResponse.json(
        { error: 'Repository name and workflow_id are required' },
        { status: 400 }
      )
    }

    console.log(`🚀 Triggering workflow ${workflow_id} on ${repository}:${ref}`)

    // Workflow dispatch event gönder
    const result = await fetchGitHubAPI(
      `/repos/${GITHUB_OWNER}/${repository}/actions/workflows/${workflow_id}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: ref,
          inputs: inputs
        })
      }
    )

    // Workflow runs'ları getir (az önce tetiklenenler)
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 saniye bekle
    
    const workflowRuns = await fetchGitHubAPI(
      `/repos/${GITHUB_OWNER}/${repository}/actions/runs?per_page=3`
    )

    console.log(`✅ Workflow triggered successfully on ${repository}`)

    return NextResponse.json({
      success: true,
      message: `Workflow triggered successfully on ${repository}`,
      repository,
      workflow_id,
      ref,
      inputs,
      triggered_at: new Date().toISOString(),
      recent_runs: workflowRuns.workflow_runs?.slice(0, 3) || []
    })

  } catch (error) {
    console.error('❌ GitHub workflow trigger error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to trigger GitHub workflow', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

// Workflow'ları listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repository = searchParams.get('repository')

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching workflows for ${repository}`)

    // Repository'nin workflow'larını getir
    const workflows = await fetchGitHubAPI(
      `/repos/${GITHUB_OWNER}/${repository}/actions/workflows`
    )

    // Her workflow için son çalıştırma bilgisini getir
    const workflowsWithRuns = await Promise.all(
      workflows.workflows.map(async (workflow: any) => {
        try {
          const runs = await fetchGitHubAPI(
            `/repos/${GITHUB_OWNER}/${repository}/actions/workflows/${workflow.id}/runs?per_page=3`
          )
          
          return {
            ...workflow,
            recent_runs: runs.workflow_runs || [],
            last_run: runs.workflow_runs?.[0] || null
          }
        } catch (error) {
          console.warn(`Could not fetch runs for workflow ${workflow.id}:`, error)
          return {
            ...workflow,
            recent_runs: [],
            last_run: null
          }
        }
      })
    )

    console.log(`✅ Found ${workflowsWithRuns.length} workflows for ${repository}`)

    return NextResponse.json({
      repository,
      workflows: workflowsWithRuns,
      total: workflowsWithRuns.length
    })

  } catch (error) {
    console.error('❌ GitHub workflows fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub workflows', details: (error as Error).message },
      { status: 500 }
    )
  }
} 