import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except static assets, and -- importantly -- except /api and
     * the embed script. The wall endpoint is anonymous and edge-cached; running
     * auth middleware over it would defeat the cache.
     */
    "/((?!_next/static|_next/image|favicon.ico|api|embed.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)$).*)",
  ],
};
