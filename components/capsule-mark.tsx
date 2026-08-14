"use client";

import { useId } from "react";

export function SealedCapsuleMark({ size = 64 }: { size?: number }) {
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
          <stop offset="0%" stopColor="#F4F1E4" />
          <stop offset="55%" stopColor="#D7E4C4" />
          <stop offset="100%" stopColor="#B7C9A1" stopOpacity="0.7" />
        </radialGradient>
        <linearGradient id={`${uid}-wood`} x1="28" y1="14" x2="54" y2="68">
          <stop offset="0%" stopColor="#E6C8A0" />
          <stop offset="45%" stopColor="#C49663" />
          <stop offset="100%" stopColor="#8B5A36" />
        </linearGradient>
        <linearGradient id={`${uid}-cork`} x1="30" y1="10" x2="50" y2="26">
          <stop offset="0%" stopColor="#F0E0C4" />
          <stop offset="100%" stopColor="#C4A06A" />
        </linearGradient>
        <linearGradient id={`${uid}-leaf`} x1="34" y1="36" x2="58" y2="58">
          <stop offset="0%" stopColor="#A7C47A" />
          <stop offset="100%" stopColor="#4F7A3E" />
        </linearGradient>
      </defs>

      <circle cx="40" cy="40" r="36" fill={`url(#${uid}-mist)`} />
      <ellipse cx="40" cy="67" rx="16" ry="4.5" fill="#6B4F32" fillOpacity="0.16" />

      <path
        d="M18 58c4 2 8 1 10-2 2 4 7 5 11 2 3 4 9 3 11-1 3 3 8 2 10-2"
        stroke="#6B8F4E"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      <rect x="29" y="18" width="22" height="44" rx="10" fill={`url(#${uid}-wood)`} />
      <path d="M33 24c6 4 10 12 11 22" stroke="#8B5A36" strokeOpacity="0.28" strokeWidth="1.4" />
      <path d="M36 28c4 5 7 12 8 20" stroke="#F3E2C7" strokeOpacity="0.28" strokeWidth="1.2" />
      <rect x="31" y="24" width="5" height="22" rx="2.5" fill="#FFF8EA" fillOpacity="0.22" />

      <rect x="28" y="13" width="24" height="13" rx="6" fill={`url(#${uid}-cork)`} />
      <rect x="31" y="17" width="18" height="2.2" rx="1.1" fill="#8B5A36" fillOpacity="0.18" />
      <path
        d="M40 9c0 4-3 6-3 6s3 0 3 4c0-4 3-4 3-4s-3-2-3-6Z"
        fill="#6F8F4A"
      />

      <path
        d="M41 40c9-1 16 8 10 16-9 2-18-6-16-14 1-1 3-2 6-2Z"
        fill={`url(#${uid}-leaf)`}
      />
      <path d="M43 42c5 4 8 9 7 13" stroke="#EAF3D8" strokeOpacity="0.55" strokeWidth="1" />

      <circle cx="58" cy="24" r="1.6" fill="#F6E27A" />
      <circle cx="22" cy="32" r="1.2" fill="#F6E27A" fillOpacity="0.8" />
    </svg>
  );
}

export function OpenedCapsuleMark({ size = 64 }: { size?: number }) {
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
        <radialGradient id={`${uid}-mist`} cx="50%" cy="46%" r="58%">
          <stop offset="0%" stopColor="#FFF8E4" />
          <stop offset="60%" stopColor="#E4EFC8" />
          <stop offset="100%" stopColor="#B7C9A1" stopOpacity="0.7" />
        </radialGradient>
        <linearGradient id={`${uid}-wood`} x1="28" y1="22" x2="54" y2="70">
          <stop offset="0%" stopColor="#E6C8A0" />
          <stop offset="100%" stopColor="#8B5A36" />
        </linearGradient>
        <linearGradient id={`${uid}-cork`} x1="44" y1="8" x2="66" y2="26">
          <stop offset="0%" stopColor="#F0E0C4" />
          <stop offset="100%" stopColor="#C4A06A" />
        </linearGradient>
      </defs>

      <circle cx="40" cy="40" r="36" fill={`url(#${uid}-mist)`} />
      <ellipse cx="40" cy="67" rx="16" ry="4.5" fill="#6B4F32" fillOpacity="0.16" />

      <rect x="29" y="24" width="22" height="38" rx="10" fill={`url(#${uid}-wood)`} />
      <path d="M34 32c5 8 9 14 10 20" stroke="#F3E2C7" strokeOpacity="0.28" strokeWidth="1.2" />
      <path
        d="M33 30h14c1 7-2 13-7 18-5-5-8-11-7-18Z"
        fill="#F6E27A"
        fillOpacity="0.72"
      />

      <g transform="rotate(-26 54 18)">
        <rect x="42" y="10" width="24" height="13" rx="6" fill={`url(#${uid}-cork)`} />
        <path d="M54 7c0 3-2 5-2 5s2 0 2 3c0-3 2-3 2-3s-2-2-2-5Z" fill="#6F8F4A" />
      </g>

      <circle cx="40" cy="28" r="1.8" fill="#F6E27A" />
      <circle cx="57" cy="30" r="1.3" fill="#F6E27A" fillOpacity="0.85" />
      <circle cx="24" cy="36" r="1.1" fill="#F6E27A" fillOpacity="0.7" />
    </svg>
  );
}
