"use client";

import { Button } from "@/components/ui/button";
import { Card, Avatar } from "@/components/ui/primitives";
import { useQuery } from "@/lib/data/use-store";
import { totals } from "@/lib/data";
import { supabaseConfigured } from "@/lib/supabase/env";

export default function AccountPage() {
  const { data: count } = useQuery(() => totals(), []);
  const configured = supabaseConfigured();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8 sm:py-10">
      <h1 className="font-display text-[32px] text-ink">Account</h1>
      <p className="mt-1 text-[13px] text-muted">
        {configured ? "Signed in with Google." : "Running in local mode — no sign-in required."}
      </p>

      <Card className="mt-7 p-5">
        <div className="flex items-center gap-3">
          <Avatar name={configured ? "You" : "Local owner"} size={40} />
          <div>
            <p className="text-[14px] text-ink">{configured ? "You" : "Local owner"}</p>
            <p className="text-[12.5px] text-subtle">
              {configured ? "Google account" : "Data lives in this browser"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-5">
          {[
            ["Spaces", count?.spaces],
            ["Collected", count?.collected],
            ["Pending", count?.pending],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="font-display text-[26px] tabular-nums text-ink">{value ?? "—"}</p>
              <p className="text-[11px] uppercase tracking-[0.08em] text-subtle">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {configured ? (
        <form action="/auth/sign-out" method="post" className="mt-5">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      ) : (
        <p className="mt-5 text-[12.5px] leading-relaxed text-subtle">
          Set the Supabase environment variables to switch this deployment to real Google
          sign-in and a real database. See SETUP.md.
        </p>
      )}
    </main>
  );
}
