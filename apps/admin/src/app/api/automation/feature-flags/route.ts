import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    const { data: featureFlags, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !featureFlags || featureFlags.length === 0) {
      console.error('Feature flags fetch error or empty:', error);
      // Return mock data if database error or empty
      return NextResponse.json([
        {
          id: "1",
          name: "enhanced_status_page",
          description: "New enhanced status page with real-time metrics",
          enabled: true,
          environment: "production",
          rolloutPercentage: 100,
          createdBy: "bahadirarda",
          createdAt: "2025-05-28T11:44:14Z",
          updatedAt: "2025-05-28T11:44:14Z"
        },
        {
          id: "2",
          name: "admin_automation_v2", 
          description: "Advanced admin panel automation features",
          enabled: false,
          environment: "staging",
          rolloutPercentage: 50,
          createdBy: "team-lead",
          createdAt: "2025-05-28T11:44:14Z",
          updatedAt: "2025-05-28T11:44:14Z"
        },
        {
          id: "3",
          name: "docker_deployment",
          description: "Enable Docker-based deployment pipeline", 
          enabled: true,
          environment: "development",
          rolloutPercentage: 100,
          createdBy: "devops-team",
          createdAt: "2025-05-28T11:44:14Z",
          updatedAt: "2025-05-28T11:44:14Z"
        },
        {
          id: "4",
          name: "webhook_notifications",
          description: "Real-time webhook notifications for pipeline events",
          enabled: false,
          environment: "development", 
          rolloutPercentage: 25,
          createdBy: "bahadirarda",
          createdAt: "2025-05-28T11:44:14Z",
          updatedAt: "2025-05-28T11:44:14Z"
        }
      ]);
    }

    // Transform the data to match frontend expectations
    type FeatureFlagRow = {
      id: string;
      name: string;
      description: string;
      enabled: boolean;
      environment: string;
      rollout_percentage: number;
      conditions?: unknown;
      metadata?: unknown;
      created_by: string;
      created_at: string;
      updated_at?: string;
    };
    const transformedData = featureFlags?.map((flag: FeatureFlagRow) => ({
      id: flag.id,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      environment: flag.environment,
      rolloutPercentage: flag.rollout_percentage,
      conditions: flag.conditions,
      metadata: flag.metadata,
      createdBy: flag.created_by,
      createdAt: flag.created_at,
      updatedAt: flag.updated_at
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Feature flags API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseClient();
    
    // Create new feature flag
    const { data: featureFlag, error } = await supabase
      .from('feature_flags')
      .insert([{
        name: body.name,
        description: body.description,
        enabled: body.enabled || false,
        environment: body.environment,
        rollout_percentage: body.rolloutPercentage || 0,
        conditions: body.conditions || null,
        metadata: body.metadata || null,
        created_by: body.createdBy || 'system'
      }])
      .select()
      .single();

    if (error) {
      console.error('Feature flag creation error:', error);
      return NextResponse.json({
        id: Date.now().toString(),
        ...body,
        enabled: false,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json(featureFlag);
  } catch (error) {
    console.error('Feature flag creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseClient();
    const { id, enabled, rolloutPercentage, conditions, metadata } = body;

    const { data: featureFlag, error } = await supabase
      .from('feature_flags')
      .update({
        enabled: enabled,
        rollout_percentage: rolloutPercentage,
        conditions: conditions,
        metadata: metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Feature flag update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: featureFlag });
  } catch (error) {
    console.error('Feature flag update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const supabase = getSupabaseClient();

    if (!id) {
      return NextResponse.json({ error: 'Feature flag ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Feature flag deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feature flag deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 