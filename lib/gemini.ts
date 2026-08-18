import { GoogleGenAI } from "@google/genai";
import {
  CAPSULE_SHAPES,
  fallbackCapsuleMood,
  normalizeCapsuleMood,
  type CapsuleMood,
} from "@/lib/capsule-mood";
import type { CapsuleWeather } from "@/lib/weather";

const MODELS = ["gemini-3.7-flash", "gemini-3.5-flash"] as const;

const MOOD_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["quote", "keywords", "style"],
  properties: {
    quote: {
      type: "string",
      description: "날씨를 담은 짧은 한국어 한마디. 한 문장, 40자 이내. 편지 내용을 직접 인용하지 말 것.",
    },
    keywords: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" },
      description: "편지 분위기와 주제를 암시하는 한국어 키워드 3~5개. 문장·고유명사·직접 인용 금지. 2~8자.",
    },
    style: {
      type: "object",
      additionalProperties: false,
      required: [
        "shape",
        "bodyFrom",
        "bodyTo",
        "cork",
        "glow",
        "accent",
        "mistFrom",
        "mistTo",
        "ornament",
        "scale",
      ],
      properties: {
        shape: {
          type: "string",
          enum: [...CAPSULE_SHAPES],
          description: "이 편지와 날씨만의 독특한 캡슐 형태",
        },
        bodyFrom: { type: "string", description: "캡슐 본체 그라데이션 시작 hex (#RRGGBB)" },
        bodyTo: { type: "string", description: "캡슐 본체 그라데이션 끝 hex (#RRGGBB)" },
        cork: { type: "string", description: "마개 색 hex" },
        glow: { type: "string", description: "하이라이트 hex" },
        accent: { type: "string", description: "장식 색 hex" },
        mistFrom: { type: "string", description: "배경 안개 밝은 색 hex" },
        mistTo: { type: "string", description: "배경 안개 어두운 색 hex" },
        ornament: {
          type: "string",
          enum: ["none", "ribbon", "seal", "vine", "frost", "spark", "halo"],
          description: "캡슐을 구별하는 장식",
        },
        scale: {
          type: "number",
          description: "화면 크기 0.75~1.35. 강렬한 감정은 크게, 고요한 편지는 작게.",
        },
      },
    },
  },
};

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.API_KEY || "";
}

function buildPrompt(input: {
  weather: CapsuleWeather | null;
  letter: string;
  recipient: string;
}) {
  const weather = input.weather
    ? [
        `하늘: ${input.weather.condition}`,
        input.weather.temperature !== null ? `기온: ${input.weather.temperature}°C` : null,
        input.weather.humidity !== null ? `습도: ${input.weather.humidity}%` : null,
        input.weather.rainfall !== null ? `강수: ${input.weather.rainfall}mm` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "날씨 정보 없음";

  const letter = input.letter.trim().slice(0, 1500) || "(편지 없음)";
  const recipient = input.recipient.trim() || "(받는 사람 없음)";

  return `공공데이터 날씨와 편지를 보고 타임캡슐의 분위기 JSON을 만들어라.

[날씨]
${weather}

[받는 사람]
${recipient}

[편지]
${letter}

규칙:
- quote는 날씨(기온·습도·하늘)를 담은 서정적인 한마디. 편지 문장을 베끼지 말 것.
- keywords는 열기 전에 봐도 편지 내용이 직접 드러나지 않되, 본인이면 "아하" 할 수 있는 힌트. 예: 설렘, 비오는밤, 그리움.
- 각 캡슐은 서로 다른 유물처럼 보여야 한다. 평범한 갈색 유리병을 반복하지 말 것.
- shape 선택 가이드(편지 분위기로 예외 허용):
  - 눈 → crystal
  - 비/소나기/빗방울 → droplet
  - 맑고 따뜻함 → lantern 또는 orb
  - 구름많음/흐림 → cloud
  - 습하고 따뜻함 → seed
  - 기다림·시간이 뚜렷한 편지 → hourglass
  - 그 외 → bottle
- ornament: ribbon(다정함), seal(비밀/약속), vine(자연/성장), frost(추위/눈), spark(비/설렘), halo(맑음/온기), none(담백)
- 색은 이 순간의 기온·습도·하늘에 맞게 선명하게. 따뜻하면 앰버·코랄·금, 추우면 블루·실버·라벤더. 습하면 깊은 톤.
- scale은 0.75~1.35.
- 모든 색은 #RRGGBB.`;
}

async function requestMood(model: string, prompt: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 없습니다.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const interaction = await ai.interactions.create({
    model,
    store: false,
    system_instruction:
      "너는 한국어 타임캡슐 앱의 감성 큐레이터다. 요청한 JSON 스키마만 반환한다.",
    input: prompt,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: MOOD_SCHEMA,
    },
  });

  const text = interaction.output_text;
  if (!text) {
    throw new Error("Gemini가 빈 응답을 반환했습니다.");
  }

  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(trimmed) as unknown;
}

export async function generateCapsuleMood(input: {
  weather: CapsuleWeather | null;
  letter: string;
  recipient: string;
}): Promise<CapsuleMood> {
  const fallback = fallbackCapsuleMood(input.weather);
  const prompt = buildPrompt(input);

  if (!getApiKey()) {
    return fallback;
  }

  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const raw = await requestMood(model, prompt);
      return normalizeCapsuleMood(raw, fallback);
    } catch (error) {
      lastError = error;
    }
  }

  console.error("Gemini capsule mood failed", lastError);
  return fallback;
}
