import { cn } from "@/lib/cn";

/* Shared tables scroll inside their panel on narrow screens. */
export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div
      className="max-w-full overflow-x-auto rounded-lg border border-line bg-surface p-2"
      role="region"
      aria-label="Scrollable data table"
      tabIndex={0}
    >
      <table
        className={cn("w-full border-collapse text-[14px]", className)}
        {...props}
      />
    </div>
  );
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

export function Th({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
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

export function Tr({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-[background-color]", className)}
      style={{
        background: ruleFade(
          "color-mix(in srgb, var(--v-text) 8%, transparent)",
        ),
      }}
      {...props}
    />
  );
}

export function Td({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-2 py-2 align-middle", className)} {...props} />;
}
