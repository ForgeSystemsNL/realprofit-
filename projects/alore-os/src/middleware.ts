///// middleware.ts
/////
///// Protects all /dashboard/* routes.
// ///If user is not logged in → redirect to /login.
///// If user is logged in and visits /login → redirect to /dashboard.
///// Also refreshes the Supabase session on every request (required for SSR auth).

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  /////Supabase client that can read/write cookies in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  ///// Refresh the session — this keeps the user logged in across tab reloads.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  ///// If user is NOT logged in and tries to access /dashboard → send to /login
  if (!user && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  ///// If user IS logged in and visits /login → send to /dashboard
  if (user && pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  ////// All other requests — pass through with refreshed session cookies
  return supabaseResponse;
}

///// Define which routes this middleware runs on.
///// Runs on /dashboard/* and /login. Skips static files, images, and API routes.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
  ],
};