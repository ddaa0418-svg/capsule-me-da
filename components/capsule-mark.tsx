"use client";

import { useId } from "react";
import {
  DEFAULT_CAPSULE_STYLE,
  inferOrnament,
  resolveCapsuleStyle,
  type CapsuleMoodStyle,
  type CapsuleOrnament,
  type CapsuleShape,
} from "@/lib/capsule-mood";

function resolvedStyle(style?: CapsuleMoodStyle | null): CapsuleMoodStyle {
  return resolveCapsuleStyle(style ?? DEFAULT_CAPSULE_STYLE);
}

export function SealedCapsuleMark({
  size = 64,
  style,
}: {
  size?: number;
  style?: CapsuleMoodStyle | null;
}) {
  return <WeatherCapsuleMark size={size} sealed style={resolvedStyle(style)} />;
}

export function OpenedCapsuleMark({
  size = 64,
  style,
}: {
  size?: number;
  style?: CapsuleMoodStyle | null;
}) {
  return <WeatherCapsuleMark size={size} sealed={false} style={resolvedStyle(style)} />;
}

export function CapsuleQuote({ quote }: { quote: string }) {
  return <p className="text-sm leading-relaxed text-cream italic">&ldquo;{quote}&rdquo;</p>;
}

export function CapsuleKeywords({
  keywords,
  className = "",
}: {
  keywords: string[];
  className?: string;
}) {
  if (keywords.length === 0) {
    return null;
  }

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {keywords.map((keyword) => (
        <li
          key={keyword}
          className="rounded-full border border-wood/20 bg-parchment px-2.5 py-1 text-[11px] font-medium tracking-wide text-cream-dim"
        >
          #{keyword}
        </li>
      ))}
    </ul>
  );
}

function WeatherCapsuleMark({
  size,
  sealed,
  style,
}: {
  size: number;
  sealed: boolean;
  style: CapsuleMoodStyle;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-mist`} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor={style.mistFrom} />
          <stop offset="100%" stopColor={style.mistTo} stopOpacity="0.72" />
        </radialGradient>
        <linearGradient id={`${uid}-body`} x1="28" y1="14" x2="54" y2="68">
          <stop offset="0%" stopColor={style.bodyFrom} />
          <stop offset="100%" stopColor={style.bodyTo} />
        </linearGradient>
        <linearGradient id={`${uid}-cork`} x1="30" y1="10" x2="50" y2="26">
          <stop offset="0%" stopColor={style.cork} />
          <stop offset="100%" stopColor={style.bodyTo} />
        </linearGradient>
      </defs>

      <circle cx="40" cy="40" r="36" fill={`url(#${uid}-mist)`} />
      <ellipse cx="40" cy="67" rx="16" ry="4.5" fill={style.bodyTo} fillOpacity="0.18" />
      <CapsuleBody uid={uid} shape={style.shape} sealed={sealed} style={style} />
      <CapsuleOrnament
        ornament={style.ornament ?? inferOrnament(style.shape)}
        style={style}
      />
      <circle cx="58" cy="22" r="1.5" fill={style.glow} />
      <circle cx="22" cy="32" r="1.1" fill={style.glow} fillOpacity="0.8" />
    </svg>
  );
}

function CapsuleBody({
  uid,
  shape,
  sealed,
  style,
}: {
  uid: string;
  shape: CapsuleShape;
  sealed: boolean;
  style: CapsuleMoodStyle;
}) {
  const body = `url(#${uid}-body)`;
  const cork = `url(#${uid}-cork)`;

  if (shape === "droplet") {
    return (
      <>
        <path
          d="M40 14C40 14 58 34 58 48C58 58.5 50.2 66 40 66C29.8 66 22 58.5 22 48C22 34 40 14 40 14Z"
          fill={body}
        />
        <path d="M34 28c6 8 9 16 9 24" stroke={style.glow} strokeOpacity="0.35" strokeWidth="1.3" />
        {sealed ? (
          <ellipse cx="40" cy="18" rx="8" ry="5" fill={cork} />
        ) : (
          <g transform="rotate(-28 56 16)">
            <ellipse cx="56" cy="16" rx="8" ry="5" fill={cork} />
          </g>
        )}
        <path d="M40 38c8 2 10 12 4 18-8 1-14-8-12-16 2-1 5-2 8-2Z" fill={style.accent} fillOpacity="0.35" />
      </>
    );
  }

  if (shape === "crystal") {
    return (
      <>
        <path d="M40 12L56 28L48 64H32L24 28Z" fill={body} />
        <path d="M40 12L46 28L40 64L34 28Z" fill={style.glow} fillOpacity="0.28" />
        <path d="M24 28h32" stroke={style.glow} strokeOpacity="0.35" />
        {sealed ? (
          <polygon points="34,12 40,6 46,12 40,16" fill={cork} />
        ) : (
          <g transform="rotate(-24 58 16)">
            <polygon points="52,10 58,4 64,10 58,14" fill={cork} />
          </g>
        )}
        <circle cx="40" cy="36" r="2" fill={style.glow} fillOpacity="0.8" />
      </>
    );
  }

  if (shape === "orb") {
    return (
      <>
        <circle cx="40" cy="44" r="20" fill={body} />
        <ellipse cx="33" cy="38" rx="7" ry="10" fill={style.glow} fillOpacity="0.28" />
        {sealed ? (
          <rect x="30" y="16" width="20" height="12" rx="6" fill={cork} />
        ) : (
          <g transform="rotate(-26 56 18)">
            <rect x="46" y="12" width="20" height="12" rx="6" fill={cork} />
          </g>
        )}
        <path d="M40 12c0 3-2 5-2 5s2 0 2 3c0-3 2-3 2-3s-2-2-2-5Z" fill={style.accent} />
      </>
    );
  }

  if (shape === "cloud") {
    return (
      <>
        <ellipse cx="32" cy="38" rx="12" ry="11" fill={body} />
        <ellipse cx="48" cy="38" rx="13" ry="12" fill={body} />
        <ellipse cx="40" cy="30" rx="11" ry="10" fill={body} />
        <rect x="28" y="40" width="24" height="22" rx="10" fill={body} />
        {sealed ? (
          <ellipse cx="40" cy="20" rx="10" ry="6" fill={cork} />
        ) : (
          <g transform="rotate(-20 58 18)">
            <ellipse cx="58" cy="18" rx="10" ry="6" fill={cork} />
          </g>
        )}
        <path d="M30 48c4 6 10 10 16 8" stroke={style.glow} strokeOpacity="0.4" strokeWidth="1.2" />
      </>
    );
  }

  if (shape === "seed") {
    return (
      <>
        <path
          d="M40 16C52 22 58 36 50 56C46 64 34 64 30 56C22 36 28 22 40 16Z"
          fill={body}
        />
        {sealed ? (
          <path d="M28 24c8 2 16 2 24 0-4 8-8 12-12 14-4-2-8-6-12-14Z" fill={cork} />
        ) : (
          <g transform="rotate(-30 58 18)">
            <path d="M46 10c8 2 16 2 24 0-4 8-8 12-12 14-4-2-8-6-12-14Z" fill={cork} />
          </g>
        )}
        <path d="M40 30c0 14-1 22-1 30" stroke={style.accent} strokeOpacity="0.55" strokeWidth="1.2" />
      </>
    );
  }

  if (shape === "lantern") {
    return (
      <>
        <path d="M40 10c0 4-3 6-3 6s3 0 3 4c0-4 3-4 3-4s-3-2-3-6Z" fill={style.accent} />
        <rect x="31" y="16" width="18" height="6" rx="3" fill={cork} />
        <path
          d="M26 28c0-6 6-8 14-8s14 2 14 8v26c0 8-6 14-14 14s-14-6-14-14V28Z"
          fill={body}
        />
        <rect x="31" y="32" width="18" height="20" rx="4" fill={style.glow} fillOpacity="0.45" />
        <path d="M30 28h20" stroke={style.accent} strokeOpacity="0.5" />
        {sealed ? null : (
          <g transform="rotate(-22 58 18)">
            <rect x="50" y="12" width="16" height="6" rx="3" fill={cork} />
          </g>
        )}
        <ellipse cx="40" cy="64" rx="10" ry="3" fill={style.glow} fillOpacity="0.35" />
      </>
    );
  }

  if (shape === "hourglass") {
    return (
      <>
        <path d="M28 16h24l-10 22 10 22H28l10-22L28 16Z" fill={body} />
        <path d="M34 20h12l-6 14-6-14Z" fill={style.accent} fillOpacity="0.55" />
        <path d="M36 52h8l-4 8-4-8Z" fill={style.glow} fillOpacity="0.4" />
        <rect x="26" y="13" width="28" height="7" rx="3" fill={sealed ? cork : style.bodyTo} />
        <rect x="26" y="60" width="28" height="7" rx="3" fill={cork} />
        {!sealed ? (
          <g transform="rotate(-30 60 16)">
            <rect x="48" y="8" width="22" height="7" rx="3" fill={cork} />
          </g>
        ) : null}
        <circle cx="40" cy="38" r="2.2" fill={style.glow} />
      </>
    );
  }

  return (
    <>
      <rect x="29" y={sealed ? 18 : 24} width="22" height={sealed ? 44 : 38} rx="10" fill={body} />
      <path d="M33 28c6 8 10 16 11 24" stroke={style.glow} strokeOpacity="0.28" strokeWidth="1.3" />
      {sealed ? (
        <rect x="28" y="13" width="24" height="13" rx="6" fill={cork} />
      ) : (
        <g transform="rotate(-26 54 18)">
          <rect x="42" y="10" width="24" height="13" rx="6" fill={cork} />
        </g>
      )}
      <path d="M40 9c0 4-3 6-3 6s3 0 3 4c0-4 3-4 3-4s-3-2-3-6Z" fill={style.accent} />
      <path
        d="M41 40c9-1 16 8 10 16-9 2-18-6-16-14 1-1 3-2 6-2Z"
        fill={style.accent}
        fillOpacity="0.85"
      />
    </>
  );
}

function CapsuleOrnament({
  ornament,
  style,
}: {
  ornament: CapsuleOrnament;
  style: CapsuleMoodStyle;
}) {
  if (ornament === "ribbon") {
    return (
      <path
        d="M24 46c8 6 24 6 32 0-4 8-8 12-16 12s-12-4-16-12Z"
        fill={style.accent}
        fillOpacity="0.7"
      />
    );
  }

  if (ornament === "seal") {
    return (
      <>
        <circle cx="52" cy="50" r="7" fill={style.accent} />
        <circle cx="52" cy="50" r="3.2" fill={style.glow} fillOpacity="0.8" />
      </>
    );
  }

  if (ornament === "vine") {
    return (
      <path
        d="M24 30c8 4 10 14 6 22 8-2 14 4 18 10"
        stroke={style.accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    );
  }

  if (ornament === "frost") {
    return (
      <>
        <path d="M18 24l4 2-4 2 2-4-2-4 4 2Z" fill={style.glow} fillOpacity="0.8" />
        <path d="M58 48l3 1.5-3 1.5 1.5-3-1.5-3 3 1.5Z" fill={style.glow} />
        <path d="M22 52l2.5 1-2.5 1 1-2.5-1-2.5 2.5 1Z" fill={style.glow} fillOpacity="0.7" />
      </>
    );
  }

  if (ornament === "spark") {
    return (
      <>
        <circle cx="20" cy="28" r="1.4" fill={style.glow} />
        <circle cx="60" cy="36" r="1.1" fill={style.glow} />
        <circle cx="56" cy="58" r="1.6" fill={style.glow} fillOpacity="0.85" />
      </>
    );
  }

  if (ornament === "halo") {
    return (
      <ellipse
        cx="40"
        cy="40"
        rx="28"
        ry="30"
        stroke={style.glow}
        strokeOpacity="0.45"
        strokeWidth="1.4"
        fill="none"
      />
    );
  }

  return null;
}
