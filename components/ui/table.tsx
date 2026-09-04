import { cn } from "@/lib/cn";

/**
 * Nocturne tables paint their row rules as row-level background strips rather
 * than cell borders, so the rule fades out at both ends across the whole row
 * instead of stopping dead at each cell edge. That end-fade is the system's
 * signature; a plain `border-bottom` loses it.
 */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full border-collapse text-[14px]", className)} {...props} />;
}

const ruleFade = (color: string) =>
  `linear-gradient(to right, transparent, ${color} 48px, ${color} calc(100% - 48px), transparent) no-repeat bottom / 100% 1px`;

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr style={{ background: ruleFade("var(--v-border)") }}>{children}</tr>
    </thead>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-2 py-1.5 text-left text-[11px] uppercase tracking-[0.08em] text-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-[background-color]", className)}
      style={{ background: ruleFade("color-mix(in srgb, var(--v-text) 8%, transparent)") }}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-2 py-2 align-middle", className)} {...props} />;
}
