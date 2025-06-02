import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_CONFIG = {
  owner: 'bahadirarda',
  repo: 'hrms-system'
};

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pull_number, action, body: reviewBody } = body;

    if (!pull_number || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: pull_number, action'
      }, { status: 400 });
    }

    // Validate action
    if (!['approve', 'reject', 'comment'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be: approve, reject, or comment'
      }, { status: 400 });
    }

    let githubResponse = null;
    let mockApproval = false;

    // Try to create GitHub review
    if (GITHUB_TOKEN) {
      try {
        const reviewData = {
          body: reviewBody || (action === 'approve' ? 'LGTM! Approved for merge.' : 'Changes requested.'),
          event: action === 'approve' ? 'APPROVE' : action === 'reject' ? 'REQUEST_CHANGES' : 'COMMENT'
        };

        const response = await fetch(
          `${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/pulls/${pull_number}/reviews`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'HRMS-DevOps-System'
            },
            body: JSON.stringify(reviewData)
          }
        );

        if (response.ok) {
          githubResponse = await response.json();
        } else {
          console.error('GitHub API Error:', response.status, response.statusText);
          mockApproval = true;
        }
      } catch (error) {
        console.error('GitHub approval error:', error);
        mockApproval = true;
      }
    } else {
      mockApproval = true;
    }

    // Store approval in database
    try {
      // First, get or create merge request record
      const { data: existingMR } = await supabase
        .from('merge_requests')
        .select('*')
        .eq('external_id', pull_number.toString())
        .single();

      if (!existingMR) {
        // Create merge request record
        const { error: mrError } = await supabase
          .from('merge_requests')
          .insert([
            {
              external_id: pull_number.toString(),
              title: `Pull Request #${pull_number}`,
              description: 'GitHub Pull Request',
              author: 'System',
              source_branch: 'feature-branch',
              target_branch: 'main',
              status: 'open',
              approvals: action === 'approve' ? 1 : 0,
              required_approvals: 1,
              conflicts: false,
              pipeline_status: 'pending',
              additions: 0,
              deletions: 0,
              files_changed: 0
            }
          ]);

        if (mrError) {
          console.error('Error creating merge request:', mrError);
        }
      } else {
        // Update existing merge request
        const newApprovals = action === 'approve' 
          ? existingMR.approvals + 1 
          : existingMR.approvals;

        const { error: updateError } = await supabase
          .from('merge_requests')
          .update({
            approvals: newApprovals,
            status: newApprovals >= existingMR.required_approvals ? 'approved' : 'open',
            updated_at: new Date().toISOString()
          })
          .eq('external_id', pull_number.toString());

        if (updateError) {
          console.error('Error updating merge request:', updateError);
        }
      }

      // Create merge approval record
      const { error: approvalError } = await supabase
        .from('merge_approvals')
        .insert([
          {
            merge_request_id: existingMR?.id || null,
            approver: 'Admin User',
            action: action === 'approve' ? 'approve' : 'reject',
            comment: reviewBody || `${action === 'approve' ? 'Approved' : 'Rejected'} via DevOps panel`
          }
        ]);

      if (approvalError) {
        console.error('Error creating approval record:', approvalError);
      }

    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    const response = {
      success: true,
      action,
      pull_number,
      github_review: githubResponse,
      source: mockApproval ? 'mock' : 'github',
      message: mockApproval 
        ? `Mock approval recorded for PR #${pull_number}` 
        : `GitHub review submitted for PR #${pull_number}`,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Approval API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process approval',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to fetch approval history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pull_number = searchParams.get('pull_number');

    if (!pull_number) {
      return NextResponse.json({
        success: false,
        error: 'Missing pull_number parameter'
      }, { status: 400 });
    }

    // Fetch from database
    const { data: approvals, error } = await supabase
      .from('merge_approvals')
      .select(`
        *,
        merge_requests!inner(external_id)
      `)
      .eq('merge_requests.external_id', pull_number)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approvals:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch approvals'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      approvals: approvals || [],
      pull_number
    });

  } catch (error) {
    console.error('Approval history fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch approval history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 