import { cn } from "@/lib/cn";

/** The mark. Used in empty states and as the single-quote layout's flourish. */
export function QuoteGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={cn("h-6", className)} fill="currentColor" aria-hidden>
      <path d="M0 24V13.2C0 5.9 4.2 1.1 11.6 0l1.2 3.9C8.4 5.2 6.2 7.6 6.2 11h5.2v13H0Zm18.6 0V13.2C18.6 5.9 22.8 1.1 30.2 0l1.2 3.9c-4.4 1.3-6.6 3.7-6.6 7.1h5.2v13h-11.4Z" />
    </svg>
  );
}
