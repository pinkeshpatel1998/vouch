import { NextResponse, type NextRequest } from "next/server";

/**
 * iframe fallback for platforms that accept an embed URL but not a script tag.
 *
 * Deliberately a route handler rather than a page: it returns a bare document
 * with no site chrome, transparent background, and auto-height reporting to the
 * parent. It loads the same embed.js, so there is one widget implementation.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const origin = req.nextUrl.origin;
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Testimonials</title>
<style>html,body{margin:0;padding:0;background:transparent;}</style>
</head>
<body>
<script src="${origin}/embed.js" data-wall="${safeId}" async></script>
<script>
// Report our height so the parent can size the iframe without a scrollbar.
(function () {
  var last = 0;
  function send() {
    var h = document.documentElement.scrollHeight;
    if (h !== last) {
      last = h;
      parent.postMessage({ type: "vouch:height", wall: ${JSON.stringify(safeId)}, height: h }, "*");
    }
  }
  new ResizeObserver(send).observe(document.documentElement);
  setInterval(send, 1000);
})();
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
