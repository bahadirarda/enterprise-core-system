import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = 'bahadirarda'

async function fetchGitHubAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'HRMS-Integrations',
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
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const repos = await response.json();

    // Enhanced repository data with integration information
    const enhancedRepos = await Promise.all(
      repos
        .filter((repo: any) => repo.name === 'enterprise-core-system') // Only show enterprise-core-system
        .slice(0, 1) // Ensure only one repository
        .map(async (repo: any) => {
          let workflowRuns = [];
          let branchProtected = false;
          let hasActions = false;

          try {
            // Check for GitHub Actions
            const actionsResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/actions/workflows`, {
              headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            });

            if (actionsResponse.ok) {
              const workflows = await actionsResponse.json();
              hasActions = workflows.total_count > 0;

              // Get latest workflow runs if actions exist
              if (hasActions) {
                const runsResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/actions/runs?per_page=1`, {
                  headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                  },
                });
                
                if (runsResponse.ok) {
                  const runsData = await runsResponse.json();
                  workflowRuns = runsData.workflow_runs || [];
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching actions for ${repo.name}:`, error);
          }

          try {
            // Check branch protection
            const protectionResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/branches/main/protection`, {
              headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            });
            
            branchProtected = protectionResponse.ok;
          } catch (error) {
            // Branch protection might not be set up
            branchProtected = false;
          }

          return {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            updated_at: repo.updated_at,
            stargazers_count: repo.stargazers_count,
            has_actions: hasActions,
            branch_protected: branchProtected,
            last_workflow_run: workflowRuns[0] || null,
            integration_ready: hasActions && branchProtected
          };
        })
    );

    return NextResponse.json(enhancedRepos);
  } catch (error) {
    console.error('❌ GitHub integrations API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repositories', details: (error as Error).message },
      { status: 500 }
    )
  }
} 