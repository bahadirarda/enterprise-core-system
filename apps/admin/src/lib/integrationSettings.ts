import { getSupabaseClient } from './supabase'

/**
 * Simple helper to read/write integration enabled flags.
 * If `integration_settings` table does not exist yet, all integrations default to true.
 */
export async function isIntegrationEnabled(name: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('integration_settings')
      .select('enabled')
      .eq('integration', name)
      .single()

    if (error) {
      // table missing or row missing – assume enabled so that feature works by default
      return true
    }
    return data?.enabled ?? true
  } catch (err) {
    console.error('integrationSettings error', err)
    return true
  }
}

export async function setIntegrationEnabled(name: string, enabled: boolean, adminEmail?: string) {
  const supabase = getSupabaseClient()
  // upsert row
  await supabase
    .from('integration_settings')
    .upsert({ integration: name, enabled, updated_by: adminEmail || 'system' }, { onConflict: 'integration' })
} 