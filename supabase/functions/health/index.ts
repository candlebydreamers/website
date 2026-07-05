// supabase/functions/health/index.ts
// Health check endpoint to keep the backend and database active.
// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    let database_connected = false;
    let database_error = null;

    if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Make a lightweight query to ensure the database registers activity
        // (This helps prevent Supabase free tier from pausing due to inactivity)
        const { error } = await supabase.from('settings').select('key').limit(1);
        if (!error) {
            database_connected = true;
        } else {
            database_error = error.message;
        }
    }

    return new Response(
      JSON.stringify({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        database_connected,
        ...(database_error && { error: database_error })
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ status: "error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
