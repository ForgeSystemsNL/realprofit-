// src/app/auth/confirm/route.ts
// Place at: projects/alore-os/src/app/auth/confirm/route.ts
//
// Handles the email confirmation link from Supabase.
// Supabase redirects here after user clicks the confirmation email.
// This route exchanges the token for a session, then redirects to success page.

import { createServerClient } from "@supabase/ssr";
import { cookies }            from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const token_hash = searchParams.get("token_hash");
  const type       = searchParams.get("type");

  // If no token — redirect to login
  if (!token_hash || !type) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: { [key: string]: string } }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // Verify the token with Supabase
  const { error } = await supabase.auth.verifyOtp({
    type:       type as string,
    token_hash,
  });

  if (error) {
    // Token invalid or expired — redirect to login with error message
    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", request.url)
    );
  }

  // Success — redirect to the confirmation success page
  return NextResponse.redirect(
    new URL("/auth/confirmed", request.url)
  );
}