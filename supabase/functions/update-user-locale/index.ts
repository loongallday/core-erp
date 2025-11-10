import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  user_id: string
  locale: string
  timezone?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create Supabase client with service role (to bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Verify the user's token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const body: RequestBody = await req.json()
    const { user_id, locale, timezone } = body

    // Validate input
    if (!user_id || !locale) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, locale' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate locale value
    if (!['en', 'th'].includes(locale)) {
      return new Response(
        JSON.stringify({ error: 'Invalid locale. Must be "en" or "th"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get user's profile to verify they own this record or have permission
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id, auth_user_id')
      .eq('id', user_id)
      .single()

    if (!profile || profile.auth_user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You can only update your own locale preference' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update user's locale preference
    const updateData: Record<string, string> = { locale }
    if (timezone) {
      updateData.timezone = timezone
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user locale:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update locale preference' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          locale: data.locale,
          timezone: data.timezone,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

