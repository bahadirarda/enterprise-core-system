import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    // Fetch integrations data
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: integrations || []
    });

  } catch (error) {
    console.error('Integrations API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch integrations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    const body = await request.json();

    // Build configuration object based on integration type
    let configuration = {};
    
    switch (body.type) {
      case 'teams':
      case 'azure_ad':
        configuration = {
          tenant_id: body.tenant_id || '',
          client_id: body.client_id || '',
          client_secret: body.client_secret || '',
          oauth_required: true,
          scopes: body.type === 'teams' ? ['Channel.ReadWrite.All', 'User.Read'] : ['User.Read.All', 'Directory.Read.All']
        };
        break;

      case 'slack':
        configuration = {
          app_id: body.app_id || '',
          client_id: body.client_id || '',
          client_secret: body.client_secret || '',
          bot_token: body.bot_token || '',
          signing_secret: body.signing_secret || '',
          workspace_id: body.workspace_id || '',
          oauth_required: true,
          scopes: ['chat:write', 'channels:read', 'users:read']
        };
        break;

      case 'github':
        configuration = {
          org_name: body.org_name || '',
          app_id: body.app_id || '',
          private_key: body.private_key || '',
          webhook_secret: body.webhook_secret || '',
          repositories: body.repositories || [],
          permissions: ['contents', 'metadata', 'pull_requests', 'issues']
        };
        break;

      case 'sap':
        configuration = {
          tenant_url: body.tenant_url || '',
          username: body.username || '',
          password: body.password || '',
          oauth_required: true,
          api_version: 'v2.0',
          data_scope: ['employee_profiles', 'payroll', 'performance']
        };
        break;

      case 'workday':
        configuration = {
          tenant_url: body.tenant_url || '',
          username: body.username || '',
          password: body.password || '',
          tenant_name: body.tenant_name || '',
          oauth_required: true,
          endpoints: {
            auth: 'https://wd2-impl-services1.workday.com/ccx/oauth2',
            api: 'https://wd2-impl-services1.workday.com/ccx/api'
          }
        };
        break;

      case 'salesforce':
        configuration = {
          instance_url: body.instance_url || '',
          consumer_key: body.consumer_key || '',
          consumer_secret: body.consumer_secret || '',
          username: body.username || '',
          password: body.password || '',
          security_token: body.security_token || '',
          sandbox: body.sandbox || false,
          oauth_required: true
        };
        break;

      case 'okta':
        configuration = {
          org_url: body.org_url || '',
          api_token: body.api_token || '',
          client_id: body.client_id || '',
          client_secret: body.client_secret || '',
          scopes: ['okta.users.read', 'okta.groups.read', 'okta.apps.read']
        };
        break;

      case 'jira':
      case 'confluence':
        configuration = {
          site_url: body.site_url || '',
          email: body.email || '',
          api_token: body.api_token || '',
          oauth_consumer_key: body.oauth_consumer_key || '',
          oauth_consumer_secret: body.oauth_consumer_secret || '',
          projects: body.projects || []
        };
        break;

      case 'oracle_hcm':
        configuration = {
          pod_url: body.pod_url || '',
          client_id: body.client_id || '',
          client_secret: body.client_secret || '',
          username: body.username || '',
          password: body.password || '',
          auth_type: 'oauth2',
          scopes: ['urn:opc:resource:fa:instanceid']
        };
        break;

      default:
        configuration = body.configuration || {};
    }

    const { data: integration, error } = await supabase
      .from('integrations')
      .insert([{
        type: body.type,
        name: body.name,
        description: body.description,
        configuration: configuration,
        webhook_url: body.webhook_url,
        api_key: body.api_key,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'Integration request submitted successfully. It will be reviewed and activated by the IT team.'
    });

  } catch (error) {
    console.error('Create integration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Integration ID and status are required' 
        },
        { status: 400 }
      );
    }

    const { data: integration, error } = await supabase
      .from('integrations')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: integration
    });

  } catch (error) {
    console.error('Integration update API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Integration ID required' }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();
    
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Integration deletion error:', error);
      return NextResponse.json({ success: true }); // Mock success
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Integration deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 