"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { dict, formatTime, type Lang } from "@/lib/i18n";
import type { MapCity } from "./maps/types";
import { mostSevere } from "./maps/types";
import { OutlineMap } from "./maps/OutlineMap";
import { RadarMap } from "./maps/RadarMap";
import { WindFlowMap } from "./maps/WindFlowMap";
import { MapPanel, SeverityLegend, HeatLegend } from "./maps/MapPanel";

// Leaflet touches `window`, so load it only on the client, only when picked.
const LeafletMap = dynamic(() => import("./maps/LeafletMap"), {
  ssr: false,
  loading: () => <div className="skeleton h-[440px] w-full rounded-xl sm:h-[540px]" />,
});

type TabKey = "outline" | "real" | "radar" | "wind";

const TABS: { key: TabKey; so: string; en: string }[] = [
  { key: "outline", so: "Khariidad", en: "Outline" },
  { key: "real", so: "Sawir dhab", en: "Real map" },
  { key: "radar", so: "Kulayl", en: "Heat" },
  { key: "wind", so: "Dabayl", en: "Wind" },
];

export function MapSwitcher({ cities, lang, hourlyTimes }: { cities: MapCity[]; lang: Lang; hourlyTimes: string[] }) {
  const t = dict(lang);
  const [tab, setTab] = useState<TabKey>("outline");
  const [selected, setSelected] = useState<string | null>(() => mostSevere(cities));
  const [hour, setHour] = useState(0);
  const sel = cities.find((c) => c.slug === selected) ?? null;

  const temps = useMemo(
    () => cities.map((c) => (tab === "radar" && c.hourlyTemps[hour] != null ? c.hourlyTemps[hour] : c.temp)),
    [cities, tab, hour],
  );
  const tMin = Math.min(...temps);
  const tMax = Math.max(...temps);
  const maxHour = Math.max(0, Math.min(23, hourlyTimes.length - 1));

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-surface-1 p-3 sm:p-4">
      {/* variant tabs */}
      <div className="mb-3 grid grid-cols-4 gap-1 rounded-full bg-surface-2 p-1">
        {TABS.map((tb) => {
          const on = tb.key === tab;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`rounded-full px-2 py-1.5 text-[13px] font-medium transition-colors ${
                on ? "bg-brand text-[#04121f]" : "text-ink-2 hover:text-ink"
              }`}
              aria-pressed={on}
            >
              {lang === "so" ? tb.so : tb.en}
            </button>
          );
        })}
      </div>

      {/* active variant */}
      <div className="relative">
        {tab === "outline" && <OutlineMap cities={cities} selected={selected} onSelect={setSelected} />}
        {tab === "radar" && <RadarMap cities={cities} selected={selected} onSelect={setSelected} hourIndex={hour} />}
        {tab === "wind" && <WindFlowMap cities={cities} selected={selected} onSelect={setSelected} />}
        {tab === "real" && <LeafletMap cities={cities} selected={selected} onSelect={setSelected} />}
        <p className="pointer-events-none absolute bottom-1 right-2 text-[11px] text-muted">{t.mapHint}</p>
      </div>

      {/* 24-hour time slider (radar only) */}
      {tab === "radar" && hourlyTimes.length > 1 && (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
          <span className="shrink-0 text-xs font-medium text-ink-2">{t.hour}</span>
          <input
            type="range"
            min={0}
            max={maxHour}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[color:var(--grid)] accent-[color:var(--brand)]"
            aria-label={t.hour}
          />
          <span className="tnum w-14 shrink-0 text-right text-sm font-semibold text-ink">
            {hour === 0 ? t.now : formatTime(hourlyTimes[hour])}
          </span>
        </div>
      )}

      {sel && <MapPanel sel={sel} lang={lang} />}

      {tab === "radar" ? <HeatLegend min={tMin} max={tMax} /> : <SeverityLegend lang={lang} />}
    </div>
  );
}
