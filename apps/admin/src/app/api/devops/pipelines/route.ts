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
    const status = searchParams.get('status'); // pending, running, success, failed, cancelled
    const environment = searchParams.get('environment'); // development, staging, production
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('pipelines')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (environment) {
      query = query.eq('environment', environment);
    }

    const { data: pipelines, error } = await query;

    if (error) {
      console.error('Error fetching pipelines:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch pipelines'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pipelines: pipelines || [],
      count: pipelines?.length || 0,
      source: 'database'
    });

  } catch (error) {
    console.error('Pipelines fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pipelines',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      branch,
      commit_sha,
      author,
      message,
      environment = 'development'
    } = body;

    if (!branch || !commit_sha || !author) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: branch, commit_sha, author'
      }, { status: 400 });
    }

    const { data: pipeline, error } = await supabase
      .from('pipelines')
      .insert([
        {
          branch,
          commit_sha,
          author,
          message,
          status: 'pending',
          environment,
          started_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating pipeline:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create pipeline'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pipeline,
      message: 'Pipeline created successfully'
    });

  } catch (error) {
    console.error('Pipeline creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create pipeline',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, finished_at } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing pipeline ID'
      }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updateData.status = status;
      
      // Auto-set finished_at if status is final
      if (['success', 'failed', 'cancelled'].includes(status)) {
        updateData.finished_at = finished_at || new Date().toISOString();
      }
    }

    const { data: pipeline, error } = await supabase
      .from('pipelines')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pipeline:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update pipeline'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pipeline,
      message: 'Pipeline updated successfully'
    });

  } catch (error) {
    console.error('Pipeline update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update pipeline',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 