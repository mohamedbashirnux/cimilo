import type { ForecastDay } from "@/lib/weather";
import { codeInfo } from "@/lib/weather";
import { dict, formatDay, type Lang } from "@/lib/i18n";
import { WeatherGlyph } from "./glyphs";

// The heat scale used across the week's range bars (cool → extreme).
const HEAT_GRADIENT =
  "linear-gradient(90deg,#4da3ff 0%,#7fb2e8 22%,#fab219 55%,#ec835a 78%,#d03b3b 100%)";

export function ForecastChart({ days, lang }: { days: ForecastDay[]; lang: Lang }) {
  const t = dict(lang);
  const gMin = Math.floor(Math.min(...days.map((d) => d.tempMin)));
  const gMax = Math.ceil(Math.max(...days.map((d) => d.tempMax)));
  const span = Math.max(1, gMax - gMin);
  const pct = (v: number) => ((v - gMin) / span) * 100;

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-surface-1">
      {/* scale legend */}
      <div className="flex items-center gap-3 px-4 pt-4 text-xs text-muted">
        <span className="tnum">{gMin}°</span>
        <span className="h-1.5 flex-1 rounded-full" style={{ background: HEAT_GRADIENT }} />
        <span className="tnum">{gMax}°</span>
      </div>

      <ul className="divide-y divide-[color:var(--border)] px-2 sm:px-4">
        {days.map((d, i) => {
          const info = codeInfo(d.weatherCode);
          const { weekday } = formatDay(d.date, t);
          const left = pct(d.tempMin);
          const right = 100 - pct(d.tempMax);
          const wet = d.precipitationProbability >= 20 || d.precipitation >= 1;
          return (
            <li key={d.date} className="grid grid-cols-[3.2rem_2rem_1fr_auto] items-center gap-3 py-3">
              <span className={`text-sm font-medium ${i === 0 ? "text-brand" : "text-ink-2"}`}>
                {i === 0 ? t.today : weekday}
              </span>

              <WeatherGlyph glyph={info.glyph} size={26} />

              {/* range bar on the shared heat scale */}
              <div className="flex items-center gap-2">
                <span className="tnum w-8 shrink-0 text-right text-sm text-ink-2">{Math.round(d.tempMin)}°</span>
                <div className="relative h-2 flex-1 rounded-full bg-[color:var(--surface-2)]">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: HEAT_GRADIENT,
                      // reveal only this day's min→max window of the scale
                      maskImage: `linear-gradient(90deg,transparent ${left}%,#000 ${left}%,#000 ${100 - right}%,transparent ${100 - right}%)`,
                      WebkitMaskImage: `linear-gradient(90deg,transparent ${left}%,#000 ${left}%,#000 ${100 - right}%,transparent ${100 - right}%)`,
                    }}
                  />
                </div>
                <span className="tnum w-8 shrink-0 text-sm font-semibold text-ink">{Math.round(d.tempMax)}°</span>
              </div>

              {/* precip chance */}
              <span className={`tnum flex w-12 items-center justify-end gap-1 text-xs ${wet ? "text-brand" : "text-muted"}`}>
                <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
                  <path d="M5 0C5 0 0 5.5 0 8.2A5 5 0 0 0 10 8.2C10 5.5 5 0 5 0z" fill="currentColor" opacity={wet ? 1 : 0.4} />
                </svg>
                {Math.round(d.precipitationProbability)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
