import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment'); // development, staging, production
    const status = searchParams.get('status'); // pending, deploying, success, failed, rolled_back
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('deployments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (environment) {
      query = query.eq('environment', environment);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: deployments, error } = await query;

    if (error) {
      console.error('Error fetching deployments:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch deployments'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deployments: deployments || [],
      count: deployments?.length || 0,
      source: 'database'
    });

  } catch (error) {
    console.error('Deployments fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch deployments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      environment,
      version,
      pipeline_id,
      deployed_by
    } = body;

    if (!environment || !version) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: environment, version'
      }, { status: 400 });
    }

    const { data: deployment, error } = await supabase
      .from('deployments')
      .insert([
        {
          environment,
          version,
          status: 'pending',
          health: 'unknown',
          pipeline_id,
          deployed_by,
          deployed_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating deployment:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create deployment'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deployment,
      message: 'Deployment created successfully'
    });

  } catch (error) {
    console.error('Deployment creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create deployment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, health } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing deployment ID'
      }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (health) updateData.health = health;

    const { data: deployment, error } = await supabase
      .from('deployments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deployment:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update deployment'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deployment,
      message: 'Deployment updated successfully'
    });

  } catch (error) {
    console.error('Deployment update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update deployment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 