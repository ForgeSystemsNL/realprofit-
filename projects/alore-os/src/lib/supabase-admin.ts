// src/lib/supabase-admin.ts
// Place at: projects/alore-os/src/lib/supabase-admin.ts
//
// Server-only admin client — bypasses RLS.
// Use this in API routes and webhook handlers that need to
// read/write any tenant's data without user auth context.
//
// ⚠️ NEVER import this in client components ("use client")
// ⚠️ NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser

import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);