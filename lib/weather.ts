export type CapsuleWeather = {
  temperature: number | null;
  humidity: number | null;
  condition: string;
  rainfall: number | null;
  observedAt: string;
};

export const WEATHER_KINDS = [
  "snow",
  "sleet",
  "rain",
  "overcast",
  "cloud",
  "clear",
  "mild",
] as const;

export type WeatherKind = (typeof WEATHER_KINDS)[number];

export function weatherKind(condition: string): WeatherKind {
  if (condition.includes("비") && condition.includes("눈")) {
    return "sleet";
  }

  if (condition.includes("눈")) {
    return "snow";
  }

  if (condition.includes("비") || condition.includes("소나기") || condition.includes("빗방울")) {
    return "rain";
  }

  if (condition === "흐림") {
    return "overcast";
  }

  if (condition === "구름많음") {
    return "cloud";
  }

  if (condition === "맑음") {
    return "clear";
  }

  return "mild";
}

export function isShower(condition: string) {
  return condition.includes("소나기");
}

export const SEOUL_COORDS = { lat: 37.5665, lon: 126.978 };

export function isCapsuleWeather(value: unknown): value is CapsuleWeather {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const weather = value as Record<string, unknown>;

  return (
    (weather.temperature === null || typeof weather.temperature === "number") &&
    (weather.humidity === null || typeof weather.humidity === "number") &&
    typeof weather.condition === "string" &&
    (weather.rainfall === null || typeof weather.rainfall === "number") &&
    typeof weather.observedAt === "string"
  );
}

export function weatherEmoji(condition: string) {
  switch (weatherKind(condition)) {
    case "snow":
      return "❄️";
    case "sleet":
      return "🌨️";
    case "rain":
      return isShower(condition) ? "🌦️" : "🌧️";
    case "overcast":
      return "☁️";
    case "cloud":
      return "⛅";
    case "clear":
      return "☀️";
    default:
      return "🌤️";
  }
}

export function formatWeatherSummary(weather: CapsuleWeather) {
  const parts = [weather.condition];

  if (weather.temperature !== null) {
    parts.push(`${weather.temperature}°C`);
  }

  if (weather.humidity !== null) {
    parts.push(`습도 ${weather.humidity}%`);
  }

  return parts.join(" · ");
}

export async function getBrowserCoords() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return SEOUL_COORDS;
  }

  return new Promise<{ lat: number; lon: number }>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => resolve(SEOUL_COORDS),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600_000 },
    );
  });
}

export async function fetchCapsuleWeather(coords = SEOUL_COORDS) {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lon: String(coords.lon),
  });
  const response = await fetch(`/api/weather?${params.toString()}`);

  if (!response.ok) {
    throw new Error("날씨 정보를 불러오지 못했습니다.");
  }

  const data: unknown = await response.json();

  if (!isCapsuleWeather(data)) {
    throw new Error("날씨 정보가 올바르지 않습니다.");
  }

  return data;
}
