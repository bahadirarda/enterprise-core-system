import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side için Supabase client oluştur
function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function POST(request: NextRequest) {
  try {
    const { branch, environment, reason } = await request.json()
    
    if (!branch) {
      return NextResponse.json({ error: 'Branch is required' }, { status: 400 })
    }

    console.log(`🚀 Triggering pipeline for branch: ${branch}`)

    // Simulate git webhook call to trigger pipeline
    const webhookPayload = {
      ref: `refs/heads/${branch}`,
      commits: [{
        id: generateCommitSha(),
        message: reason || 'Manual pipeline trigger',
        author: {
          name: 'Admin User',
          email: 'admin@system.com'
        },
        timestamp: new Date().toISOString()
      }],
      repository: {
        name: 'hrms-system',
        full_name: 'organization/hrms-system'
      },
      pusher: {
        name: 'Admin User',
        email: 'admin@system.com'
      }
    }

    // Call our webhook API
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:4003'}/api/webhooks/git`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('Webhook call failed:', errorText)
      throw new Error(`Webhook call failed: ${webhookResponse.status}`)
    }

    const result = await webhookResponse.json()

    console.log(`✅ Pipeline triggered successfully for ${branch}, pipeline ID: ${result.pipeline_id}`)

    return NextResponse.json({
      success: true,
      message: `Pipeline triggered for ${branch}`,
      pipeline_id: result.pipeline_id
    })

  } catch (error) {
    console.error('Manual trigger error:', error)
    return NextResponse.json({ 
      error: 'Failed to trigger pipeline',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateCommitSha(): string {
  return Math.random().toString(36).substring(2, 10)
} 