import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user_id)

    if (rolesError) throw rolesError

    const roleIds = userRoles.map(ur => ur.role_id)

    if (roleIds.length === 0) {
      return new Response(
        JSON.stringify({ permissions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get permissions for those roles
    const { data: rolePermissions, error: permsError } = await supabase
      .from('role_permissions')
      .select('permission:permissions(code)')
      .in('role_id', roleIds)

    if (permsError) throw permsError

    // Extract unique permission codes
    const permissions = [...new Set(rolePermissions.map((rp: any) => rp.permission.code))]

    return new Response(
      JSON.stringify({ permissions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

