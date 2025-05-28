import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const environment = searchParams.get('environment')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('pipelines')
      .select(`
        *,
        pipeline_jobs (
          id,
          name,
          status,
          duration,
          started_at,
          finished_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (environment) {
      query = query.eq('environment', environment)
    }

    const { data: pipelines, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: pipelines,
      count: pipelines?.length || 0
    })

  } catch (error) {
    console.error('Pipeline fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pipelines' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      branch, 
      commit_sha, 
      author, 
      message, 
      environment = 'development',
      jobs = []
    } = body

    // Create pipeline
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .insert({
        branch,
        commit_sha,
        author,
        message,
        environment,
        status: 'pending'
      })
      .select()
      .single()

    if (pipelineError) {
      return NextResponse.json({ error: pipelineError.message }, { status: 500 })
    }

    // Create pipeline jobs if provided
    if (jobs.length > 0) {
      const jobsData = jobs.map((job: any) => ({
        pipeline_id: pipeline.id,
        name: job.name,
        status: 'pending'
      }))

      const { error: jobsError } = await supabase
        .from('pipeline_jobs')
        .insert(jobsData)

      if (jobsError) {
        console.error('Failed to create jobs:', jobsError)
      }
    }

    return NextResponse.json({
      success: true,
      data: pipeline
    })

  } catch (error) {
    console.error('Pipeline creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create pipeline' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, action } = body

    if (action === 'retry') {
      // Reset pipeline and jobs to pending
      const { error: pipelineError } = await supabase
        .from('pipelines')
        .update({ 
          status: 'pending', 
          started_at: new Date().toISOString(),
          finished_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (pipelineError) {
        return NextResponse.json({ error: pipelineError.message }, { status: 500 })
      }

      // Reset jobs to pending
      const { error: jobsError } = await supabase
        .from('pipeline_jobs')
        .update({ 
          status: 'pending',
          started_at: null,
          finished_at: null,
          duration: null
        })
        .eq('pipeline_id', id)

      if (jobsError) {
        console.error('Failed to reset jobs:', jobsError)
      }

    } else if (action === 'cancel') {
      // Cancel pipeline and running jobs
      const { error: pipelineError } = await supabase
        .from('pipelines')
        .update({ 
          status: 'cancelled',
          finished_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (pipelineError) {
        return NextResponse.json({ error: pipelineError.message }, { status: 500 })
      }

      // Cancel running jobs
      const { error: jobsError } = await supabase
        .from('pipeline_jobs')
        .update({ 
          status: 'cancelled',
          finished_at: new Date().toISOString()
        })
        .eq('pipeline_id', id)
        .in('status', ['pending', 'running'])

      if (jobsError) {
        console.error('Failed to cancel jobs:', jobsError)
      }

    } else {
      // Update pipeline status
      const { error } = await supabase
        .from('pipelines')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'running' ? { started_at: new Date().toISOString() } : {}),
          ...(status === 'success' || status === 'failed' ? { finished_at: new Date().toISOString() } : {})
        })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pipeline ${action || 'updated'} successfully`
    })

  } catch (error) {
    console.error('Pipeline update error:', error)
    return NextResponse.json(
      { error: 'Failed to update pipeline' },
      { status: 500 }
    )
  }
} 