import Link from "next/link";
import { supabaseConfigured } from "@/lib/supabase/env";
import { GoogleButton } from "@/components/google-button";
import { Card } from "@/components/ui/primitives";

export const metadata = { title: "Sign in · Vouch" };

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const configured = supabaseConfigured();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="font-display text-3xl tracking-[-0.03em] text-ink">
        Vouch
      </Link>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Collect testimonials through a link, approve the good ones, embed a wall.
      </p>

      <Card elevated className="mt-8 p-6">
        {configured ? (
          <>
            <GoogleButton next={next} />
            {error && (
              <p role="alert" className="mt-3 text-[13px] text-danger">
                {decodeURIComponent(error)}
              </p>
            )}
            <p className="mt-5 text-[12.5px] leading-relaxed text-subtle">
              Only you sign in. The people writing your testimonials never need an
              account.
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-ink">Supabase is not configured yet.</p>
            <p className="text-[13px] leading-relaxed text-muted">
              Copy{" "}
              <code className="rounded-xs bg-sunk px-1 py-0.5 font-mono text-[12px]">
                .env.example
              </code>{" "}
              to{" "}
              <code className="rounded-xs bg-sunk px-1 py-0.5 font-mono text-[12px]">
                .env.local
              </code>
              , fill in the project URL and anon key, then restart the dev server.
            </p>
          </div>
        )}
      </Card>
    </main>
  );
}
