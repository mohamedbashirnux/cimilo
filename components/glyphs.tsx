import type { Glyph, WarningType } from "@/lib/weather";

type IconProps = { size?: number; className?: string };

const SUN = "#fab219";
const CLOUD = "#c3ccd6";
const CLOUD_DARK = "#8a94a0";
const DROP = "#4da3ff";
const BOLT = "#facc3a";

// Weather condition glyph, keyed to the WMO glyph family.
export function WeatherGlyph({ glyph, day = true, size = 40, className }: IconProps & { glyph: Glyph; day?: boolean }) {
  const common = { width: size, height: size, viewBox: "0 0 48 48", className, "aria-hidden": true } as const;

  const cloud = (
    <path
      d="M14 34a7 7 0 0 1-.6-13.97A10 10 0 0 1 33 21.2 6.5 6.5 0 0 1 33 34z"
      fill={CLOUD}
    />
  );
  const drops = (dy: number, color = DROP) => (
    <g fill={color}>
      <path d={`M18 ${37 + dy}l-2 4a2 2 0 0 0 4 0z`} />
      <path d={`M27 ${37 + dy}l-2 4a2 2 0 0 0 4 0z`} />
      <path d={`M23 ${40 + dy}l-1.4 3a1.5 1.5 0 0 0 2.8 0z`} />
    </g>
  );

  switch (glyph) {
    case "clear":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="9" fill={day ? SUN : "#dfe6ee"} />
          {day && (
            <g stroke={SUN} strokeWidth="2.4" strokeLinecap="round">
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i * Math.PI) / 4;
                return (
                  <line
                    key={i}
                    x1={24 + Math.cos(a) * 13}
                    y1={24 + Math.sin(a) * 13}
                    x2={24 + Math.cos(a) * 17}
                    y2={24 + Math.sin(a) * 17}
                  />
                );
              })}
            </g>
          )}
        </svg>
      );
    case "partly":
      return (
        <svg {...common}>
          <circle cx="18" cy="18" r="7" fill={day ? SUN : "#dfe6ee"} />
          {day && (
            <g stroke={SUN} strokeWidth="2.2" strokeLinecap="round">
              {[0, 1, 2, 3, 4].map((i) => {
                const a = (-Math.PI / 2) + (i - 2) * 0.5;
                return (
                  <line key={i}
                    x1={18 + Math.cos(a) * 10} y1={18 + Math.sin(a) * 10}
                    x2={18 + Math.cos(a) * 14} y2={18 + Math.sin(a) * 14} />
                );
              })}
            </g>
          )}
          {cloud}
        </svg>
      );
    case "cloud":
      return <svg {...common}><path d="M14 36a8 8 0 0 1-.7-15.96A11 11 0 0 1 34 21.4 7 7 0 0 1 34 36z" fill={CLOUD} /></svg>;
    case "fog":
      return (
        <svg {...common}>
          {cloud}
          <g stroke={CLOUD_DARK} strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="40" x2="34" y2="40" />
            <line x1="16" y1="44" x2="30" y2="44" />
          </g>
        </svg>
      );
    case "drizzle":
      return <svg {...common}>{cloud}{drops(-2)}</svg>;
    case "rain":
      return <svg {...common}>{cloud}{drops(0)}</svg>;
    case "heavy-rain":
      return (
        <svg {...common}>
          {cloud}
          <g stroke={DROP} strokeWidth="2.6" strokeLinecap="round">
            <line x1="16" y1="37" x2="14" y2="45" />
            <line x1="23" y1="37" x2="21" y2="45" />
            <line x1="30" y1="37" x2="28" y2="45" />
          </g>
        </svg>
      );
    case "showers":
      return <svg {...common}>{cloud}{drops(0)}<circle cx="23" cy="47" r="1.4" fill={DROP} /></svg>;
    case "thunder":
      return (
        <svg {...common}>
          {cloud}
          <path d="M24 34l-6 8h5l-3 7 9-10h-5l4-5z" fill={BOLT} />
        </svg>
      );
  }
}

// Warning-type icon (storm / rain / wind / heat). Uses currentColor.
export function WarningIcon({ type, size = 20, className }: IconProps & { type: WarningType }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className, "aria-hidden": true };
  switch (type) {
    case "storm":
      return (
        <svg {...common}>
          <path d="M20 10a5 5 0 0 0-9.6-1.9A4 4 0 1 0 8 16h8" />
          <path d="M12 13l-2.5 4H13l-2.5 4.5" stroke={undefined} />
        </svg>
      );
    case "rain":
      return (
        <svg {...common}>
          <path d="M18 11a5 5 0 0 0-9.6-1.9A4 4 0 1 0 6 15h12a3.5 3.5 0 0 0 0-4z" />
          <line x1="9" y1="18" x2="8" y2="21" />
          <line x1="13" y1="18" x2="12" y2="21" />
          <line x1="17" y1="18" x2="16" y2="21" />
        </svg>
      );
    case "wind":
      return (
        <svg {...common}>
          <path d="M3 8h12a3 3 0 1 0-3-3" />
          <path d="M3 12h16a3 3 0 1 1-3 3" />
          <path d="M3 16h9a2.5 2.5 0 1 1-2.5 2.5" />
        </svg>
      );
    case "heat":
      return (
        <svg {...common}>
          <path d="M12 3a3 3 0 0 1 3 3v7.3a5 5 0 1 1-6 0V6a3 3 0 0 1 3-3z" />
          <line x1="12" y1="14" x2="12" y2="18.5" />
        </svg>
      );
    case "flood":
      return (
        <svg {...common}>
          <path d="M2 15c1.7 0 1.7-1.2 3.3-1.2S7 15 8.7 15s1.7-1.2 3.3-1.2S13.7 15 15.3 15 17 13.8 18.7 13.8 20.3 15 22 15" />
          <path d="M2 20c1.7 0 1.7-1.2 3.3-1.2S7 20 8.7 20s1.7-1.2 3.3-1.2S13.7 20 15.3 20 17 18.8 18.7 18.8 20.3 20 22 20" />
          <path d="M6 10l3-6 3 6" />
        </svg>
      );
  }
}
