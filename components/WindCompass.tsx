import { compassPoint, dict, type Lang } from "@/lib/i18n";

// A compass rose with an arrow pointing in the direction the wind travels
// (meteorological bearing is "from", so the arrow points at from + 180).
// Arrow length scales with speed; gust ring hints at peak.
export function WindCompass({
  direction,
  speed,
  gusts,
  lang,
  size = 132,
}: {
  direction: number;
  speed: number;
  gusts: number;
  lang: Lang;
  size?: number;
}) {
  const t = dict(lang);
  const c = size / 2;
  const r = c - 10;
  const travel = (direction + 180) % 360; // heading the wind moves toward
  const rad = ((travel - 90) * Math.PI) / 180;
  const len = r * Math.min(1, 0.35 + speed / 90); // 0..1 scaled reach
  const tipX = c + Math.cos(rad) * len;
  const tipY = c + Math.sin(rad) * len;
  const tailX = c - Math.cos(rad) * (len * 0.5);
  const tailY = c - Math.sin(rad) * (len * 0.5);

  const ticks = t.compass; // N, NE, E ...
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {/* outer ring */}
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--grid)" strokeWidth="1.5" />
        <circle cx={c} cy={c} r={r * 0.62} fill="none" stroke="var(--grid)" strokeWidth="1" strokeDasharray="2 4" />
        {/* cardinal ticks + labels */}
        {ticks.map((label, i) => {
          const a = ((i * 45 - 90) * Math.PI) / 180;
          const isCardinal = i % 2 === 0;
          const x1 = c + Math.cos(a) * r;
          const y1 = c + Math.sin(a) * r;
          const x2 = c + Math.cos(a) * (r - (isCardinal ? 8 : 5));
          const y2 = c + Math.sin(a) * (r - (isCardinal ? 8 : 5));
          const lx = c + Math.cos(a) * (r - 18);
          const ly = c + Math.sin(a) * (r - 18);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted)" strokeWidth={isCardinal ? 1.6 : 1} />
              {isCardinal && (
                <text x={lx} y={ly} fill="var(--muted)" fontSize="10" fontWeight="600" textAnchor="middle" dominantBaseline="central">
                  {label}
                </text>
              )}
            </g>
          );
        })}
        {/* wind vector */}
        <defs>
          <marker id="wind-arrow" markerWidth="7" markerHeight="7" refX="4" refY="3.5" orient="auto">
            <path d="M0 0L7 3.5L0 7z" fill="var(--brand)" />
          </marker>
        </defs>
        <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" markerEnd="url(#wind-arrow)" />
        <circle cx={c} cy={c} r="3.5" fill="var(--brand)" />
        {/* center speed readout */}
        <text x={c} y={c + 24} fill="var(--ink)" fontSize="15" fontWeight="700" textAnchor="middle" className="tnum">
          {Math.round(speed)}
        </text>
        <text x={c} y={c + 37} fill="var(--muted)" fontSize="8.5" textAnchor="middle" letterSpacing="0.5">
          km/h
        </text>
      </svg>
      <div className="mt-1 flex items-center gap-3 text-xs text-ink-2">
        <span>{compassPoint(direction, t)}</span>
        <span className="text-muted">·</span>
        <span className="tnum">{t.gusts} {Math.round(gusts)}</span>
      </div>
    </div>
  );
}
