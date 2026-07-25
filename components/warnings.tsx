import type { Severity, Warning } from "@/lib/weather";
import { dict, type Lang } from "@/lib/i18n";
import { WarningIcon } from "./glyphs";

export const SEVERITY_COLOR: Record<Severity, string> = {
  good: "var(--good)",
  warning: "var(--warning)",
  serious: "var(--serious)",
  critical: "var(--critical)",
};

// A single warning chip: status colour + icon + label, never colour alone.
export function WarningBadge({ warning, lang, size = "md" }: { warning: Warning; lang: Lang; size?: "sm" | "md" }) {
  const t = dict(lang);
  const color = SEVERITY_COLOR[warning.severity];
  const meta = t.warning[warning.type];
  const pad = size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-[13px] gap-1.5";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${pad}`}
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)` }}
    >
      <WarningIcon type={warning.type} size={size === "sm" ? 13 : 15} />
      <span>{meta.short}</span>
      <span className="tnum opacity-70">{warning.value}</span>
    </span>
  );
}

// The full-width alert row used on the city detail page.
export function WarningRow({ warning, lang }: { warning: Warning; lang: Lang }) {
  const t = dict(lang);
  const color = SEVERITY_COLOR[warning.severity];
  const meta = t.warning[warning.type];
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3.5 py-3"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, var(--surface-1))`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 35%, transparent)` }}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{ color, backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}>
        <WarningIcon type={warning.type} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-ink">{meta.title}</span>
          <span className="tnum text-sm text-ink-2">{warning.value}</span>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color }}>
          {t.severity[warning.severity]}
        </span>
      </div>
    </div>
  );
}
