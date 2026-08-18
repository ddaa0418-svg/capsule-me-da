import { weatherKind, type CapsuleWeather } from "@/lib/weather";

export function sceneIsDark(weather: CapsuleWeather | null) {
  if (!weather) {
    return false;
  }

  const kind = weatherKind(weather.condition);
  return kind === "rain" || kind === "overcast" || kind === "sleet";
}
