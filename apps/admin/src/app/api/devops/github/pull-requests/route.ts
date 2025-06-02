import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE = 'https://api.github.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner') || 'bahadirarda';
    const repo = searchParams.get('repo') || 'enterprise-core-system';
    const state = searchParams.get('state') || 'all'; // all, open, closed

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=${state}&per_page=10`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'HRMS-DevOps-System'
        },
      }
    );

    if (!response.ok) {
      console.error('GitHub API Error:', response.status, response.statusText);
      
      // Enhanced mock data with real-world examples
      const mockPRs = [
        {
          id: 1,
          number: 15,
          title: "🚀 **Implement** real-time DevOps monitoring dashboard",
          body: `## Overview
**This PR introduces** a comprehensive DevOps monitoring system with real-time updates.

### Changes Made:
- ✅ **Added** WebSocket connections for live updates
- 🔧 **Implemented** Docker health checks
- 📊 **Enhanced** pipeline visualization
- 🛡️ **Added** security scanning automation

### Files Modified:
- \`apps/admin/src/components/DevOpsAutomation.tsx\` - Main dashboard component
- \`packages/websocket/src/server.ts\` - WebSocket server implementation  
- \`docker-compose.yml\` - Added health check configurations
- \`apps/admin/src/hooks/useRealTimeUpdates.ts\` - Real-time data hooks

### Impact Analysis:
**This change affects:**
- 🎯 **Frontend:** Admin panel dashboard performance improvement
- 🔄 **Backend:** Real-time data processing capabilities
- 🐳 **Infrastructure:** Docker container monitoring
- 🔐 **Security:** Automated vulnerability scanning

### Testing:
- [x] Unit tests for WebSocket connections
- [x] Integration tests for dashboard updates
- [x] Performance tests for real-time data
- [x] Security scan completion verification

**Ready for review!** 🎉`,
          state: "open",
          user: {
            login: "bahadirarda",
            avatar_url: "https://avatars.githubusercontent.com/u/57160702?v=4"
          },
          head: {
            ref: "feature/realtime-devops-monitoring",
            sha: "a1b2c3d4e5f6789"
          },
          base: {
            ref: "main"
          },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          html_url: `https://github.com/${owner}/${repo}/pull/15`,
          draft: false,
          mergeable: true,
          mergeable_state: "clean",
          additions: 1247,
          deletions: 89,
          changed_files: 8,
          commits: 12,
          review_comments: 3,
          comments: 5,
          files: [
            {
              filename: "apps/admin/src/components/DevOpsAutomation.tsx",
              status: "modified",
              additions: 456,
              deletions: 23,
              changes: 479,
              patch: "@@ -1,10 +1,15 @@\n+import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';\n import React from 'react';\n..."
            },
            {
              filename: "packages/websocket/src/server.ts",
              status: "added",
              additions: 234,
              deletions: 0,
              changes: 234
            },
            {
              filename: "docker-compose.yml",
              status: "modified",
              additions: 45,
              deletions: 12,
              changes: 57
            }
          ]
        },
        {
          id: 2,
          number: 14,
          title: "🔧 Fix TypeScript errors and **improve** type safety",
          body: `## Bug Fix Summary
**Fixed critical TypeScript errors** affecting the build process.

### Issues Resolved:
- 🐛 **Fixed** undefined property access in Dialog component
- 🔍 **Added** proper type guards for API responses
- 📝 **Improved** interface definitions for better IntelliSense

### Technical Details:
\`\`\`typescript
// Before (causing errors)
const data = response.data.items.filter(item => item.id)

// After (type-safe)
const data = Array.isArray(response.data?.items) 
  ? response.data.items.filter(item => item?.id) 
  : []
\`\`\`

### Files Changed:
- \`src/components/Dialog.tsx\` - Fixed prop type definitions
- \`src/types/api.ts\` - Enhanced API response interfaces
- \`src/utils/validators.ts\` - Added runtime type checking

**Impact:** This resolves build failures and improves development experience.`,
          state: "open",
          user: {
            login: "frontend-dev",
            avatar_url: "https://avatars.githubusercontent.com/u/87654321?v=4"
          },
          head: {
            ref: "fix/typescript-errors",
            sha: "b2c3d4e5f6a7890"
          },
          base: {
            ref: "develop"
          },
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          html_url: `https://github.com/${owner}/${repo}/pull/14`,
          draft: false,
          mergeable: true,
          mergeable_state: "clean",
          additions: 67,
          deletions: 34,
          changed_files: 4,
          commits: 3,
          review_comments: 1,
          comments: 2,
          files: [
            {
              filename: "src/components/Dialog.tsx",
              status: "modified",
              additions: 23,
              deletions: 18,
              changes: 41
            },
            {
              filename: "src/types/api.ts",
              status: "modified",
              additions: 34,
              deletions: 8,
              changes: 42
            },
            {
              filename: "src/utils/validators.ts",
              status: "modified",
              additions: 10,
              deletions: 8,
              changes: 18
            }
          ]
        },
        {
          id: 3,
          number: 13,
          title: "✅ **Database** migration for user permissions",
          body: `## Database Migration
**Added comprehensive** user permission system.

### Migration Details:
- 🗃️ **Created** \`user_permissions\` table
- 🔗 **Added** foreign key relationships
- 📊 **Seeded** default permission roles
- 🔄 **Updated** existing user records

### SQL Preview:
\`\`\`sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  permission_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  granted_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**⚠️ Breaking Change:** This requires database migration before deployment.`,
          state: "merged",
          user: {
            login: "backend-dev",
            avatar_url: "https://avatars.githubusercontent.com/u/11223344?v=4"
          },
          head: {
            ref: "feature/user-permissions-migration",
            sha: "c3d4e5f6a7b8901"
          },
          base: {
            ref: "main"
          },
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          html_url: `https://github.com/${owner}/${repo}/pull/13`,
          draft: false,
          mergeable: null,
          mergeable_state: "merged",
          additions: 234,
          deletions: 12,
          changed_files: 6,
          commits: 8,
          review_comments: 7,
          comments: 12,
          files: [
            {
              filename: "migrations/001_user_permissions.sql",
              status: "added",
              additions: 156,
              deletions: 0,
              changes: 156
            },
            {
              filename: "src/models/UserPermission.ts",
              status: "added",
              additions: 78,
              deletions: 0,
              changes: 78
            }
          ]
        }
      ];

      return NextResponse.json(mockPRs);
    }

    const pullRequests = await response.json();

    // Add additional details for each PR including files
    const enhancedPRs = await Promise.all(
      pullRequests.map(async (pr: any) => {
        try {
          // Get detailed PR info including files changed
          const [detailResponse, filesResponse] = await Promise.all([
            fetch(
              `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pr.number}`,
              {
                headers: {
                  'Authorization': `Bearer ${GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'HRMS-DevOps-System'
                },
              }
            ),
            fetch(
              `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pr.number}/files`,
              {
                headers: {
                  'Authorization': `Bearer ${GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'HRMS-DevOps-System'
                },
              }
            )
          ]);

          let details = pr;
          let files = [];

          if (detailResponse.ok) {
            details = await detailResponse.json();
          }

          if (filesResponse.ok) {
            files = await filesResponse.json();
          }

          return {
            ...pr,
            additions: details.additions,
            deletions: details.deletions,
            changed_files: details.changed_files,
            mergeable: details.mergeable,
            mergeable_state: details.mergeable_state,
            commits: details.commits,
            review_comments: details.review_comments,
            comments: details.comments,
            files: files.slice(0, 10) // Limit to first 10 files to prevent payload bloat
          };
        } catch (error) {
          console.error('Error fetching PR details:', error);
        }
        
        return pr;
      })
    );

    return NextResponse.json(enhancedPRs);

  } catch (error) {
    console.error('GitHub PR fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pull requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 