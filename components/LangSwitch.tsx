"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { dict, type Lang } from "@/lib/i18n";

// Toggles ?lang=en/so on the current URL. A plain link, so it works with JS
// disabled and keeps everything server-rendered for slow connections.
export function LangSwitch({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const t = dict(lang);
  const next = lang === "so" ? "en" : "so";
  const qs = new URLSearchParams(params.toString());
  qs.set("lang", next);

  return (
    <Link
      href={`${pathname}?${qs.toString()}`}
      prefetch={false}
      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] bg-surface-1 px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2"
      aria-label={t.langLabel}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
      {t.otherLang}
    </Link>
  );
}
