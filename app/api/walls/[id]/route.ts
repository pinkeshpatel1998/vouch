import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "@/lib/supabase/env";
import { demoWallPayload } from "@/lib/demo-wall";

/**
 * The widget's only endpoint. Anonymous, cross-origin, edge-cached.
 *
 * No cookies are read, so this stays cacheable -- middleware skips /api for
 * the same reason.
 */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
};

const CACHE = {
  // Short edge cache: an owner who approves a testimonial should see it live
  // within a minute, not after a purge.
  "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  if (id === "demo") {
    // ?layout= and ?theme= let the demo wall exercise every layout without a
    // database, which is what public/embed-test.html uses.
    const q = req.nextUrl.searchParams;
    const layout = q.get("layout");
    const theme = q.get("theme");
    const style = q.get("style");
    const payload = {
      ...demoWallPayload,
      wall: {
        ...demoWallPayload.wall,
        layout:
          layout === "carousel" || layout === "single" || layout === "masonry"
            ? layout
            : demoWallPayload.wall.layout,
        carousel_style:
          style === "marquee" || style === "spotlight" || style === "rail"
            ? style
            : demoWallPayload.wall.carousel_style,
        theme:
          theme === "light" || theme === "dark" || theme === "auto"
            ? theme
            : demoWallPayload.wall.theme,
      },
    };
    return NextResponse.json(payload, { headers: { ...CORS, ...CACHE } });
  }

  if (!supabaseConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "This deployment has no database yet, so only /api/walls/demo will answer. See SETUP.md.",
      },
      { status: 503, headers: CORS },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase.rpc("wall_payload", { p_wall_id: id });

  if (error) {
    return NextResponse.json({ error: "lookup_failed" }, { status: 502, headers: CORS });
  }
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  }

  return NextResponse.json(data, { headers: { ...CORS, ...CACHE } });
}
