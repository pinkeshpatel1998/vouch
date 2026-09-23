import Link from "next/link";
import { supabaseConfigured } from "@/lib/supabase/env";
import { GoogleButton } from "@/components/google-button";
import { Brand, Arrow } from "@/components/brand";
import { buttonStyles } from "@/components/ui/button";
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
      <Brand />
      <span className="mt-10 text-[10px] tracking-[.15em] text-accent">
        YOUR NEXT CHAPTER STARTS HERE
      </span>
      <h1 className="mt-3 font-display text-[42px] text-ink">
        Welcome to
        <br />
        the good words.
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Collect testimonials through a link, approve the good ones, embed a
        wall.
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
              Only you sign in. The people writing your testimonials never need
              an account.
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-ink">Take a look around.</p>
            <p className="text-[13px] leading-relaxed text-muted">
              This workspace is running locally. Explore the app and try a demo
              space. Your changes are saved in this browser.
            </p>
            <Link href="/app" className={buttonStyles("primary", "lg")}>
              Enter your workspace <Arrow />
            </Link>
          </div>
        )}
      </Card>
    </main>
  );
}
