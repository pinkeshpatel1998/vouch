import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfigured, supabaseEnv } from "./env";

/** Routes that require a signed-in owner. Everything else is public. */
const PROTECTED = ["/app"];

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

  // LOCAL MODE. Without env vars the app runs against lib/data/store.ts, so
  // /app is browsable with no sign-in. Every screen is built against the same
  // function signatures the Supabase RPCs will have, so wiring the real backend
  // later is an adapter swap rather than a rewrite. See SETUP.md.
  if (!supabaseConfigured()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const { url, key } = supabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser(), not getSession() -- this revalidates the token with the auth
  // server rather than trusting a cookie the client could have written.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/sign-in";
    signIn.searchParams.set("next", path);
    return NextResponse.redirect(signIn);
  }

  if (user && path === "/sign-in") {
    const app = request.nextUrl.clone();
    app.pathname = "/app";
    app.search = "";
    return NextResponse.redirect(app);
  }

  return response;
}
