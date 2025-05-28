import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Teams bağlantılarını getir
    const { data: connections, error } = await supabase
      .from('teams_connections')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      connections: connections || [] 
    })
  } catch (error) {
    console.error('Teams connections fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Teams connections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationName, adminEmail, description, tenantId } = body

    if (!organizationName || !adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Organization name and admin email are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Yeni Teams bağlantısı oluştur
    const { data: connection, error } = await supabase
      .from('teams_connections')
      .insert([
        {
          name: organizationName,
          tenant_id: tenantId || `temp-${Date.now()}`,
          admin_email: adminEmail,
          description,
          status: 'pending',
          permissions: [],
          channel_count: 0,
          member_count: 0
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    // Microsoft Graph API ile bağlantı kurma simülasyonu
    // Gerçek implementasyonda burada OAuth flow başlatılacak
    
    return NextResponse.json({ 
      success: true, 
      connection,
      message: 'Teams connection initiated. Please check your email for approval.' 
    })
  } catch (error) {
    console.error('Teams connection creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create Teams connection' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, permissions, channelCount, memberCount } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Connection ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const updateData: any = {}
    if (status) updateData.status = status
    if (permissions) updateData.permissions = permissions
    if (channelCount !== undefined) updateData.channel_count = channelCount
    if (memberCount !== undefined) updateData.member_count = memberCount
    if (status === 'connected') updateData.connected_at = new Date().toISOString()

    const { data: connection, error } = await supabase
      .from('teams_connections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      connection 
    })
  } catch (error) {
    console.error('Teams connection update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update Teams connection' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Connection ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('teams_connections')
      .update({ status: 'disconnected' })
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true,
      message: 'Teams connection disconnected successfully' 
    })
  } catch (error) {
    console.error('Teams connection deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect Teams connection' },
      { status: 500 }
    )
  }
} 