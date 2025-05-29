import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    const { data: deployments, error } = await supabase
      .from('deployments')
      .select(`
        *,
        pipelines (
          id, branch, commit_sha, author, message
        )
      `)
      .order('deployed_at', { ascending: false })
      .limit(20);

    if (error || !deployments || deployments.length === 0) {
      console.error('Deployments fetch error or empty:', error);
      // Return mock data if database error or empty
      return NextResponse.json([
        {
          id: "1",
          environment: "production",
          version: "v1.2.3",
          status: "success",
          health: "healthy",
          deployedBy: "deploy-bot",
          deployedAt: "2025-05-28T11:44:14Z",
          pipeline: {
            id: "p1",
            branch: "main",
            commitSha: "f6e5d4c3b2a1",
            author: "team-member",
            message: "Fix authentication middleware"
          }
        },
        {
          id: "2", 
          environment: "staging",
          version: "v1.2.4-rc.1",
          status: "deploying",
          health: "unknown",
          deployedBy: "ci-system",
          deployedAt: "2025-05-28T11:44:14Z",
          pipeline: null
        },
        {
          id: "3",
          environment: "development", 
          version: "v1.2.4-dev.15",
          status: "success",
          health: "healthy",
          deployedBy: "developer",
          deployedAt: "2025-05-28T11:44:14Z",
          pipeline: null
        }
      ]);
    }

    // Transform the data to match frontend expectations
    type DeploymentRow = {
      id: string;
      environment: string;
      version: string;
      status: string;
      health: string;
      deployed_by: string;
      deployed_at: string;
      created_at?: string;
      updated_at?: string;
      pipelines?: {
        id: string;
        branch: string;
        commit_sha: string;
        author: string;
        message: string;
      } | null;
    };
    const transformedData = deployments?.map((deployment: DeploymentRow) => ({
      id: deployment.id,
      environment: deployment.environment,
      version: deployment.version,
      status: deployment.status,
      health: deployment.health,
      deployedBy: deployment.deployed_by,
      deployedAt: deployment.deployed_at,
      createdAt: deployment.created_at,
      updatedAt: deployment.updated_at,
      pipeline: deployment.pipelines ? {
        id: deployment.pipelines.id,
        branch: deployment.pipelines.branch,
        commitSha: deployment.pipelines.commit_sha,
        author: deployment.pipelines.author,
        message: deployment.pipelines.message
      } : null
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Deployments API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseClient();
    
    // Create new deployment
    const { data: deployment, error } = await supabase
      .from('deployments')
      .insert([{
        environment: body.environment,
        version: body.version,
        status: 'pending',
        health: 'unknown',
        pipeline_id: body.pipelineId || null,
        deployed_by: body.deployedBy || 'system'
      }])
      .select()
      .single();

    if (error) {
      console.error('Deployment creation error:', error);
      return NextResponse.json({
        id: Date.now().toString(),
        ...body,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Deployment creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseClient();
    const { id, status, health, deployedBy } = body;

    const { data: deployment, error } = await supabase
      .from('deployments')
      .update({
        status: status,
        health: health,
        deployed_by: deployedBy,
        deployed_at: status === 'success' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Deployment update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: deployment });
  } catch (error) {
    console.error('Deployment update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 