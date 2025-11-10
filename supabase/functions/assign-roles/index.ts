import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase clients
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get requesting user
    const { data: { user: requestingUser }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !requestingUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get requesting user data
    const { data: requestingUserData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_user_id', requestingUser.id)
      .single()

    if (!requestingUserData) {
      return new Response(
        JSON.stringify({ success: false, error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get request body
    const { user_id, role_ids } = await req.json()

    // Validate input
    if (!user_id || !role_ids || !Array.isArray(role_ids)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: user_id, role_ids (array)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current roles for audit
    const { data: currentRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role_id, role:roles(name)')
      .eq('user_id', user_id)

    // Delete all existing roles for this user
    const { error: deleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', user_id)

    if (deleteError) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to remove existing roles: ${deleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert new roles (if any provided)
    if (role_ids.length > 0) {
      const roleAssignments = role_ids.map((role_id: string) => ({
        user_id,
        role_id,
        assigned_by: requestingUserData.id,
      }))

      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert(roleAssignments)

      if (insertError) {
        return new Response(
          JSON.stringify({ success: false, error: `Failed to assign roles: ${insertError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get new roles for audit
    const { data: newRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role_id, role:roles(name)')
      .eq('user_id', user_id)

    // Log to audit
    await supabaseAdmin.from('audit_log').insert({
      user_id: requestingUserData.id,
      action: 'roles_assigned',
      resource_type: 'user',
      resource_id: user_id,
      changes: {
        before: currentRoles || [],
        after: newRoles || [],
        assigned_role_ids: role_ids,
      },
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Roles assigned successfully',
        role_count: role_ids.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in assign-roles function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

