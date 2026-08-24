import { cn } from "@/lib/utils";

export function DaggerMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-fg", className)} fill="none" aria-hidden>
      <path d="M16 2.5 L18.4 8.2 L16 29.5 L13.6 8.2 Z" fill="currentColor" />
      <path d="M10 9.2 H22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="8.2" r="1.35" fill="var(--color-accent)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DaggerMark className="size-5" />
      <span className="font-display text-sm font-medium tracking-caps text-fg uppercase">Killer Party</span>
    </div>
  );
}
