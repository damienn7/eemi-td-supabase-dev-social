import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const privateRoutePrefixes = [
  "/feed",
  "/fil",
  "/post",
  "/posts",
  "/profil",
  "/profile",
];

const authRoutes = ["/login", "/register", "/auth/login", "/auth/signup"];

function isPrivateRoute(pathname: string) {
  if (pathname === "/") {
    return true;
  }

  return privateRoutePrefixes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string) {
  return authRoutes.includes(pathname);
}

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options);
  });
}
 
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
 
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
 
  // Rafraîchit la session (ne pas exécuter de logique entre createServerClient et getUser).
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if ((error || !user) && isPrivateRoute(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyResponseCookies(supabaseResponse, redirectResponse);

    return redirectResponse;
  }

  if (user && isAuthRoute(pathname)) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    copyResponseCookies(supabaseResponse, redirectResponse);

    return redirectResponse;
  }
 
  return supabaseResponse;
}
