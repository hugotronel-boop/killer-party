import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SecretCard({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title?: string;
  body?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), 8000);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className={cn(
        "relative w-full overflow-hidden rounded-xl bg-surface p-5 text-left shadow-[var(--shadow-border)]",
        "transition-transform duration-200 ease-out active:scale-[0.99]",
        "min-h-36",
      )}
    >
      <p className="font-mono text-2xs tracking-caps text-muted uppercase">{kicker}</p>
      {open ? (
        <div className="mt-3">
          {title ? (
            <p className="font-display text-4xl font-medium leading-none tracking-tight text-fg">{title}</p>
          ) : null}
          {body ? (
            <p className={cn("text-base leading-relaxed text-fg", title ? "mt-3 text-muted" : "mt-2")}>{body}</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 py-2">
          <div className="flex w-3/4 flex-col gap-2" aria-hidden>
            <div className="h-2.5 rounded-xs bg-surface-2" />
            <div className="h-2.5 w-2/3 rounded-xs bg-surface-2" />
          </div>
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <Eye className="size-4" strokeWidth={1.6} />
            Appuie pour révéler
          </span>
        </div>
      )}
    </button>
  );
}
