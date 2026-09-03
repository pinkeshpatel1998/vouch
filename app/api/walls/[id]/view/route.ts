import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "@/lib/supabase/env";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/** One raw view count. Always answers 204 -- a failed count must never surface. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  if (id === "demo" || !supabaseConfigured()) {
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { referrer_domain?: string };
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    await supabase.rpc("record_wall_view", {
      p_wall_id: id,
      p_referrer_domain: body.referrer_domain ?? null,
    });
  } catch {
    /* counting is best effort */
  }

  return new NextResponse(null, { status: 204, headers: CORS });
}
