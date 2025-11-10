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

    // Check if requesting user has permission
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
    const { email, name, phone, role_ids } = await req.json()

    // Validate input
    if (!email || !name || !role_ids || role_ids.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: email, name, role_ids' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create auth user with random password (user can reset later)
    const randomPassword = crypto.randomUUID()
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
    })

    if (authError) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create auth user: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user profile
    const { data: userData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email,
        name,
        phone: phone || null,
        is_active: true,
      })
      .select()
      .single()

    if (profileError) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create user profile: ${profileError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Assign roles
    const roleAssignments = role_ids.map((role_id: string) => ({
      user_id: userData.id,
      role_id,
      assigned_by: requestingUserData.id,
    }))

    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .insert(roleAssignments)

    if (rolesError) {
      // Rollback: delete user and auth user
      await supabaseAdmin.from('users').delete().eq('id', userData.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ success: false, error: `Failed to assign roles: ${rolesError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log to audit
    await supabaseAdmin.from('audit_log').insert({
      user_id: requestingUserData.id,
      action: 'user_created',
      resource_type: 'user',
      resource_id: userData.id,
      changes: {
        email,
        name,
        phone,
        role_ids,
      },
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData,
        message: 'User created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

