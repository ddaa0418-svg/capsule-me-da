import { weatherKind, type CapsuleWeather } from "@/lib/weather";

export const CAPSULE_SHAPES = [
  "bottle",
  "droplet",
  "crystal",
  "orb",
  "cloud",
  "seed",
  "lantern",
  "hourglass",
] as const;

export type CapsuleShape = (typeof CAPSULE_SHAPES)[number];

export const CAPSULE_ORNAMENTS = [
  "none",
  "ribbon",
  "seal",
  "vine",
  "frost",
  "spark",
  "halo",
] as const;

export type CapsuleOrnament = (typeof CAPSULE_ORNAMENTS)[number];

export type CapsuleMoodStyle = {
  shape: CapsuleShape;
  bodyFrom: string;
  bodyTo: string;
  cork: string;
  glow: string;
  accent: string;
  mistFrom: string;
  mistTo: string;
  ornament?: CapsuleOrnament;
  scale?: number;
};

export type CapsuleMood = {
  quote: string;
  keywords: string[];
  style: CapsuleMoodStyle;
};

export const DEFAULT_CAPSULE_STYLE: CapsuleMoodStyle = {
  shape: "bottle",
  bodyFrom: "#E6C8A0",
  bodyTo: "#8B5A36",
  cork: "#F0E0C4",
  glow: "#F6E27A",
  accent: "#6F8F4A",
  mistFrom: "#F4F1E4",
  mistTo: "#B7C9A1",
  ornament: "seal",
  scale: 1,
};

const HEX = /^#?[0-9A-Fa-f]{6}$/;

function isCapsuleShape(value: unknown): value is CapsuleShape {
  return typeof value === "string" && CAPSULE_SHAPES.includes(value as CapsuleShape);
}

function isCapsuleOrnament(value: unknown): value is CapsuleOrnament {
  return typeof value === "string" && CAPSULE_ORNAMENTS.includes(value as CapsuleOrnament);
}

export function inferOrnament(shape: CapsuleShape): CapsuleOrnament {
  switch (shape) {
    case "bottle":
      return "seal";
    case "droplet":
      return "spark";
    case "crystal":
      return "frost";
    case "orb":
      return "halo";
    case "cloud":
      return "none";
    case "seed":
      return "vine";
    case "lantern":
      return "halo";
    case "hourglass":
      return "ribbon";
    default:
      return "none";
  }
}

export function inferScale(shape: CapsuleShape) {
  switch (shape) {
    case "orb":
      return 1.12;
    case "lantern":
      return 1.1;
    case "crystal":
      return 1.06;
    case "hourglass":
      return 1.02;
    case "droplet":
      return 0.96;
    case "seed":
      return 0.88;
    case "cloud":
      return 1.04;
    default:
      return 1;
  }
}

function sanitizeScale(value: unknown, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(1.35, Math.max(0.75, value));
}

export function resolveCapsuleStyle(style?: CapsuleMoodStyle | null): CapsuleMoodStyle {
  const resolved = style ?? DEFAULT_CAPSULE_STYLE;

  return {
    ...resolved,
    ornament: resolved.ornament ?? inferOrnament(resolved.shape),
    scale: resolved.scale ?? inferScale(resolved.shape),
  };
}

const UNIQUE_PALETTES: Array<Omit<CapsuleMoodStyle, "shape" | "ornament" | "scale">> = [
  { bodyFrom: "#E6C8A0", bodyTo: "#8B5A36", cork: "#F0E0C4", glow: "#F6E27A", accent: "#6F8F4A", mistFrom: "#F4F1E4", mistTo: "#B7C9A1" },
  { bodyFrom: "#9FD0E8", bodyTo: "#2F5F86", cork: "#D7EAF4", glow: "#E8F6FF", accent: "#4F8FBF", mistFrom: "#E7F2F8", mistTo: "#A9C5D6" },
  { bodyFrom: "#F6B6C8", bodyTo: "#B23B62", cork: "#FADDE5", glow: "#FFE4EE", accent: "#E07A9A", mistFrom: "#FFF0F4", mistTo: "#E7B7C6" },
  { bodyFrom: "#C9E4A8", bodyTo: "#3F6F32", cork: "#E7F3D4", glow: "#F3FFD8", accent: "#7BA85A", mistFrom: "#F3F8E8", mistTo: "#C3D6A8" },
  { bodyFrom: "#DCC4F4", bodyTo: "#6A3F9A", cork: "#EFE2FA", glow: "#F6EAFF", accent: "#A77BD4", mistFrom: "#F7F0FF", mistTo: "#D2B8EA" },
  { bodyFrom: "#F8D48A", bodyTo: "#C45E1A", cork: "#FFE7B8", glow: "#FFE9A8", accent: "#E09A3A", mistFrom: "#FFF6E0", mistTo: "#E8C98A" },
  { bodyFrom: "#B8E4DE", bodyTo: "#1F6F6A", cork: "#D8F3EF", glow: "#E5FFFA", accent: "#4AA8A0", mistFrom: "#ECF8F6", mistTo: "#B4D8D3" },
  { bodyFrom: "#F3C9A8", bodyTo: "#8A3A2A", cork: "#FBE0CC", glow: "#FFE0C8", accent: "#D97848", mistFrom: "#FFF1E6", mistTo: "#E7C4A8" },
  { bodyFrom: "#C5D4F4", bodyTo: "#334A9A", cork: "#E3EAFB", glow: "#EEF3FF", accent: "#6B86D4", mistFrom: "#F0F4FF", mistTo: "#C2CDEA" },
  { bodyFrom: "#F4E2A8", bodyTo: "#7A6A22", cork: "#F8EEC4", glow: "#FFF6C8", accent: "#C4B04A", mistFrom: "#FFFBE8", mistTo: "#E4D8A0" },
];

function hashId(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function uniqueStyleForId(id: string): CapsuleMoodStyle {
  const hash = hashId(id);
  const shape = CAPSULE_SHAPES[hash % CAPSULE_SHAPES.length];
  const palette = UNIQUE_PALETTES[(hash >>> 3) % UNIQUE_PALETTES.length];
  const ornament = CAPSULE_ORNAMENTS[(hash >>> 7) % CAPSULE_ORNAMENTS.length];

  return resolveCapsuleStyle({
    ...palette,
    shape,
    ornament,
    scale: inferScale(shape),
  });
}

export function visualStyleForCapsule(capsule: {
  id: string;
  mood?: CapsuleMood | null;
  weather?: CapsuleWeather | null;
}): CapsuleMoodStyle {
  const unique = uniqueStyleForId(capsule.id);

  if (!capsule.mood) {
    return unique;
  }

  return resolveCapsuleStyle({
    ...unique,
    glow: capsule.mood.style.glow,
    mistFrom: capsule.mood.style.mistFrom,
    mistTo: capsule.mood.style.mistTo,
  });
}

export function moodForCapsule(capsule: { id: string; mood?: CapsuleMood | null; weather?: CapsuleWeather | null }): CapsuleMood {
  const fallback = fallbackCapsuleMood(capsule.weather ?? null);

  if (capsule.mood) {
    return {
      ...capsule.mood,
      style: visualStyleForCapsule(capsule),
    };
  }

  return {
    ...fallback,
    style: uniqueStyleForId(capsule.id),
  };
}

export function sanitizeHex(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const hex = value.trim();
  if (!HEX.test(hex)) {
    return fallback;
  }

  return hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
}

function sanitizeKeywords(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const keyword = item.replace(/^#/, "").replace(/\s+/g, "").slice(0, 8);
    if (keyword.length < 2 || seen.has(keyword)) {
      continue;
    }

    seen.add(keyword);
    keywords.push(keyword);

    if (keywords.length >= 5) {
      break;
    }
  }

  return keywords;
}

function sanitizeQuote(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const quote = value.replace(/\s+/g, " ").trim();
  if (!quote) {
    return fallback;
  }

  return quote.slice(0, 48);
}

export function normalizeCapsuleMood(
  value: unknown,
  fallback: CapsuleMood,
): CapsuleMood {
  if (typeof value !== "object" || value === null) {
    return fallback;
  }

  const mood = value as Record<string, unknown>;
  const styleValue =
    typeof mood.style === "object" && mood.style !== null
      ? (mood.style as Record<string, unknown>)
      : mood;
  const fallbackStyle = fallback.style;

  return {
    quote: sanitizeQuote(mood.quote, fallback.quote),
    keywords: (() => {
      const keywords = sanitizeKeywords(mood.keywords);
      return keywords.length > 0 ? keywords : fallback.keywords;
    })(),
    style: {
      shape: isCapsuleShape(styleValue.shape) ? styleValue.shape : fallbackStyle.shape,
      bodyFrom: sanitizeHex(styleValue.bodyFrom, fallbackStyle.bodyFrom),
      bodyTo: sanitizeHex(styleValue.bodyTo, fallbackStyle.bodyTo),
      cork: sanitizeHex(styleValue.cork, fallbackStyle.cork),
      glow: sanitizeHex(styleValue.glow, fallbackStyle.glow),
      accent: sanitizeHex(styleValue.accent, fallbackStyle.accent),
      mistFrom: sanitizeHex(styleValue.mistFrom, fallbackStyle.mistFrom),
      mistTo: sanitizeHex(styleValue.mistTo, fallbackStyle.mistTo),
      ornament: isCapsuleOrnament(styleValue.ornament)
        ? styleValue.ornament
        : (fallbackStyle.ornament ?? inferOrnament(isCapsuleShape(styleValue.shape) ? styleValue.shape : fallbackStyle.shape)),
      scale: sanitizeScale(
        styleValue.scale,
        fallbackStyle.scale ?? inferScale(isCapsuleShape(styleValue.shape) ? styleValue.shape : fallbackStyle.shape),
      ),
    },
  };
}

export function isCapsuleMood(value: unknown): value is CapsuleMood {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const mood = value as Record<string, unknown>;
  const style = mood.style;

  if (typeof mood.quote !== "string" || !Array.isArray(mood.keywords)) {
    return false;
  }

  if (typeof style !== "object" || style === null) {
    return false;
  }

  const nextStyle = style as Record<string, unknown>;

  return (
    isCapsuleShape(nextStyle.shape) &&
    typeof nextStyle.bodyFrom === "string" &&
    typeof nextStyle.bodyTo === "string" &&
    typeof nextStyle.cork === "string" &&
    typeof nextStyle.glow === "string" &&
    typeof nextStyle.accent === "string" &&
    typeof nextStyle.mistFrom === "string" &&
    typeof nextStyle.mistTo === "string"
  );
}

export function fallbackCapsuleMood(weather: CapsuleWeather | null): CapsuleMood {
  const kind = weather ? weatherKind(weather.condition) : "mild";
  const temperature = weather?.temperature;
  const humidity = weather?.humidity;
  const hot = temperature !== null && temperature !== undefined && temperature >= 28;
  const cold = temperature !== null && temperature !== undefined && temperature <= 5;
  const humid = humidity !== null && humidity !== undefined && humidity >= 75;

  const presets: Record<string, CapsuleMood> = {
    snow: {
      quote: "하얀 하루를 유리병에 담아 두었어요",
      keywords: ["눈꽃", "고요", "겨울"],
      style: {
        shape: "crystal",
        bodyFrom: "#F7FBFF",
        bodyTo: "#8FB3D9",
        cork: "#E8F1FA",
        glow: "#FFFFFF",
        accent: "#D6E7F7",
        mistFrom: "#F4F8FF",
        mistTo: "#C5D8EE",
        ornament: "frost",
        scale: 1.06,
      },
    },
    sleet: {
      quote: "비와 눈이 섞인 하루를 함께 묻었어요",
      keywords: ["진눈깨비", "경계", "오늘"],
      style: {
        shape: "hourglass",
        bodyFrom: "#D5E4F2",
        bodyTo: "#5C7A99",
        cork: "#EAF2F8",
        glow: "#F7FBFF",
        accent: "#9BB4C9",
        mistFrom: "#EEF3F8",
        mistTo: "#B7C6D4",
        ornament: "frost",
        scale: 1.02,
      },
    },
    rain: {
      quote: "빗소리 사이로 오늘의 마음을 묻었어요",
      keywords: ["빗줄기", "촉촉", "우산"],
      style: {
        shape: "droplet",
        bodyFrom: "#9FD0E8",
        bodyTo: "#2F5F86",
        cork: "#D7EAF4",
        glow: "#E8F6FF",
        accent: "#4F8FBF",
        mistFrom: "#E7F2F8",
        mistTo: "#A9C5D6",
        ornament: "spark",
        scale: 0.98,
      },
    },
    overcast: {
      quote: "흐린 하늘도 오늘은 포근하게 머물렀어요",
      keywords: ["흐림", "잔잔", "안개"],
      style: {
        shape: "cloud",
        bodyFrom: "#D5D9DE",
        bodyTo: "#6E767E",
        cork: "#E8EAED",
        glow: "#F2F3F4",
        accent: "#8A929A",
        mistFrom: "#EEF0F2",
        mistTo: "#C4C9CE",
        ornament: "none",
        scale: 1.04,
      },
    },
    cloud: {
      quote: "구름 틈으로 스며든 빛을 함께 넣었어요",
      keywords: ["구름", "볕", "사이"],
      style: {
        shape: "cloud",
        bodyFrom: "#E4E9F2",
        bodyTo: "#7B8BA3",
        cork: "#F3F5F8",
        glow: "#FFF6D6",
        accent: "#A7B4C7",
        mistFrom: "#F3F6FA",
        mistTo: "#C9D3E2",
        ornament: "halo",
        scale: 1.04,
      },
    },
    clear: {
      quote: "맑은 햇살이 편지 위에 오래 머물렀어요",
      keywords: ["햇살", "맑음", "오후"],
      style: {
        shape: "orb",
        bodyFrom: "#FFE08A",
        bodyTo: "#E0892E",
        cork: "#FFF1C4",
        glow: "#FFF6A8",
        accent: "#F0C14A",
        mistFrom: "#FFF8E0",
        mistTo: "#E7D08A",
        ornament: "halo",
        scale: 1.12,
      },
    },
    mild: {
      quote: "오늘의 공기를 캡슐 속에 가만히 담았어요",
      keywords: ["오늘", "공기", "기록"],
      style: DEFAULT_CAPSULE_STYLE,
    },
  };

  const mood = structuredClone(presets[kind] ?? presets.mild);

  if (hot) {
    mood.style.bodyFrom = "#FFC9A3";
    mood.style.bodyTo = "#D45A3A";
    mood.style.glow = "#FFD7A8";
    mood.style.shape = kind === "clear" ? "lantern" : mood.style.shape;
    mood.style.ornament = kind === "clear" ? "halo" : mood.style.ornament;
    mood.keywords = [...mood.keywords.slice(0, 2), "더위"];
  } else if (cold) {
    mood.style.bodyFrom = "#DCE9F7";
    mood.style.bodyTo = "#4E6F93";
    mood.style.glow = "#F4FAFF";
    mood.style.ornament = "frost";
    mood.keywords = [...mood.keywords.slice(0, 2), "서늘"];
  }

  if (humid && kind !== "rain" && kind !== "sleet") {
    mood.style.shape = mood.style.shape === "orb" ? "seed" : mood.style.shape;
    mood.style.ornament = mood.style.shape === "seed" ? "vine" : mood.style.ornament;
    mood.keywords = [...mood.keywords.slice(0, 2), "촉촉"];
  }

  return mood;
}

export async function fetchCapsuleMood(input: {
  weather: CapsuleWeather | null;
  letter: string;
  recipient: string;
}) {
  try {
    const response = await fetch("/api/capsule-mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return fallbackCapsuleMood(input.weather);
    }

    const data: unknown = await response.json();
    return normalizeCapsuleMood(data, fallbackCapsuleMood(input.weather));
  } catch {
    return fallbackCapsuleMood(input.weather);
  }
}
