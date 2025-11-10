/**
 * Core ERP Plugin Template Generator - Backend Templates
 * 
 * This module contains templates for backend Edge Functions.
 * Edge Functions are Deno-based serverless functions that run on Supabase.
 */

import { TemplateContext } from '../types.js'

/**
 * Generates Edge Function for CRUD operations
 * 
 * Creates a complete Supabase Edge Function with:
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Authentication and authorization
 * - Input validation
 * - Error handling
 * - CORS support
 * - Service role client for bypassing RLS
 * 
 * @param ctx - Template context
 * @returns Edge Function content
 */
export function edgeFunctionTemplate(ctx: TemplateContext): string {
  return `/**
 * ${ctx.pluginName} - Manage ${ctx.resourceNamePlural} Edge Function
 * 
 * Provides CRUD operations for ${ctx.resourceNameLowerPlural}.
 * 
 * Actions:
 * - list: Get all ${ctx.resourceNameLowerPlural}
 * - get: Get a single ${ctx.resourceNameLower} by ID
 * - create: Create a new ${ctx.resourceNameLower}
 * - update: Update an existing ${ctx.resourceNameLower}
 * - delete: Delete a ${ctx.resourceNameLower}
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Main handler function
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the authorization token from the request header
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
    
    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
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
    const { action, id, data, filters } = await req.json()
    
    // Route to appropriate handler
    let result
    
    switch (action) {
      case 'list':
        result = await handleList(supabase, user, filters)
        break
      
      case 'get':
        if (!id) {
          throw new Error('ID is required for get action')
        }
        result = await handleGet(supabase, user, id)
        break
      
      case 'create':
        if (!data) {
          throw new Error('Data is required for create action')
        }
        result = await handleCreate(supabase, user, data)
        break
      
      case 'update':
        if (!id || !data) {
          throw new Error('ID and data are required for update action')
        }
        result = await handleUpdate(supabase, user, id, data)
        break
      
      case 'delete':
        if (!id) {
          throw new Error('ID is required for delete action')
        }
        result = await handleDelete(supabase, user, id)
        break
      
      default:
        throw new Error(\`Unknown action: \${action}\`)
    }
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
    
  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/**
 * Handle LIST action - Get all ${ctx.resourceNameLowerPlural}
 */
async function handleList(supabase: any, user: any, filters?: any) {
  // Check permission (you can implement your own permission check logic)
  // const hasPermission = await checkPermission(supabase, user.id, '${ctx.pluginId}:view')
  // if (!hasPermission) {
  //   throw new Error('Permission denied')
  // }
  
  let query = supabase
    .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
    .select('*')
    .order('created_at', { ascending: false })
  
  // Apply filters if provided
  if (filters) {
    if (filters.search) {
      query = query.ilike('name', \`%\${filters.search}%\`)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(\`Failed to fetch ${ctx.resourceNameLowerPlural}: \${error.message}\`)
  }
  
  return { data, count: data.length }
}

/**
 * Handle GET action - Get a single ${ctx.resourceNameLower}
 */
async function handleGet(supabase: any, user: any, id: string) {
  const { data, error } = await supabase
    .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('${ctx.resourceName} not found')
    }
    throw new Error(\`Failed to fetch ${ctx.resourceNameLower}: \${error.message}\`)
  }
  
  return { data }
}

/**
 * Handle CREATE action - Create a new ${ctx.resourceNameLower}
 */
async function handleCreate(supabase: any, user: any, data: any) {
  // Validate required fields
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Name is required')
  }
  
  if (data.name.length > 100) {
    throw new Error('Name must be at most 100 characters')
  }
  
  if (data.description && data.description.length > 500) {
    throw new Error('Description must be at most 500 characters')
  }
  
  // Create the ${ctx.resourceNameLower}
  const { data: created, error } = await supabase
    .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
    .insert([{
      name: data.name.trim(),
      description: data.description?.trim() || null,
    }])
    .select()
    .single()
  
  if (error) {
    throw new Error(\`Failed to create ${ctx.resourceNameLower}: \${error.message}\`)
  }
  
  // Log the action (optional)
  await logAction(supabase, user.id, 'create', '${ctx.resourceNameLower}', created.id)
  
  return { data: created }
}

/**
 * Handle UPDATE action - Update an existing ${ctx.resourceNameLower}
 */
async function handleUpdate(supabase: any, user: any, id: string, data: any) {
  // Validate fields
  if (data.name && data.name.length > 100) {
    throw new Error('Name must be at most 100 characters')
  }
  
  if (data.description && data.description.length > 500) {
    throw new Error('Description must be at most 500 characters')
  }
  
  // Update the ${ctx.resourceNameLower}
  const updates: any = {}
  if (data.name !== undefined) updates.name = data.name.trim()
  if (data.description !== undefined) updates.description = data.description?.trim() || null
  
  const { data: updated, error } = await supabase
    .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('${ctx.resourceName} not found')
    }
    throw new Error(\`Failed to update ${ctx.resourceNameLower}: \${error.message}\`)
  }
  
  // Log the action (optional)
  await logAction(supabase, user.id, 'update', '${ctx.resourceNameLower}', id)
  
  return { data: updated }
}

/**
 * Handle DELETE action - Delete a ${ctx.resourceNameLower}
 */
async function handleDelete(supabase: any, user: any, id: string) {
  const { error } = await supabase
    .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new Error(\`Failed to delete ${ctx.resourceNameLower}: \${error.message}\`)
  }
  
  // Log the action (optional)
  await logAction(supabase, user.id, 'delete', '${ctx.resourceNameLower}', id)
  
  return { success: true }
}

/**
 * Helper function to log actions to audit log (optional)
 */
async function logAction(
  supabase: any,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
) {
  try {
    await supabase
      .from('audit_log')
      .insert([{
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        timestamp: new Date().toISOString(),
      }])
  } catch (error) {
    // Log error but don't throw - audit log failure shouldn't break the operation
    console.error('Failed to write audit log:', error)
  }
}
`
}

