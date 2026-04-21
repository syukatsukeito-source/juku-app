// 1. Deno用のURLから直接インポートする
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ★追加：CORSの通行証（ブラウザからのアクセスを許可）
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// 2. req に Request 型を指定する
serve(async (req: Request) => {
  // ★追加：ブラウザからの「事前挨拶（OPTIONS）」が来たら、速やかに通行証を見せて「OK」を返す
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, password, name, phone } = body;
    if (!email || !password || !name) {
      return new Response('Missing required fields', { 
        status: 400, 
        headers: corsHeaders // ★エラーの時も通行証を持たせる
      });
    }

    // Create user with admin privileges (service role)
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name, phone },
      email_confirm: true,
    });

    if (createError) {
      console.error('createUser error', createError);
      return new Response(JSON.stringify({ error: createError.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = data?.user?.id;

    // Insert profile row using service role (bypass RLS)
    if (userId) {
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: name,
        phone,
      });
      if (upsertError) {
        console.warn('profile upsert failed', upsertError.message);
      }
    }

    // ★成功した時も通行証を持たせる
    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message || String(e) }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
