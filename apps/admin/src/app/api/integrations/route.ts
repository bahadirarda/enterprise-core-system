import { NextRequest, NextResponse } from 'next/server'
import { isIntegrationEnabled, setIntegrationEnabled } from '@/lib/integrationSettings'

export async function GET() {
  // support only teams for now
  const teamsEnabled = await isIntegrationEnabled('teams')
  return NextResponse.json({ success: true, integrations: { teams: teamsEnabled } })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { integration, enabled } = body

    if (!integration || typeof enabled !== 'boolean') {
      return NextResponse.json({ success: false, error: 'integration and enabled required' }, { status: 400 })
    }

    await setIntegrationEnabled(integration, enabled, 'admin')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 })
  }
} 