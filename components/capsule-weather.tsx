import { weatherEmoji, type CapsuleWeather } from "@/lib/weather";

export function CapsuleWeatherCard({
  weather,
  className = "",
}: {
  weather: CapsuleWeather | null;
  className?: string;
}) {
  if (!weather) {
    return null;
  }

  return (
    <div
      className={`w-full rounded-[1.75rem] border border-wood/20 bg-parchment px-6 py-6 text-left ${className}`}
    >
      <p className="text-xs font-medium tracking-wide text-wood">묻은 날의 하늘</p>
      <p className="mt-3 text-xl font-semibold text-cream">
        {weatherEmoji(weather.condition)} {weather.condition}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-wood/15 bg-bark/40 px-4 py-3">
          <dt className="text-[11px] tracking-wide text-cream-dim">기온</dt>
          <dd className="mt-1 text-lg font-semibold text-cream">
            {weather.temperature !== null ? `${weather.temperature}°C` : "—"}
          </dd>
        </div>
        <div className="rounded-2xl border border-wood/15 bg-bark/40 px-4 py-3">
          <dt className="text-[11px] tracking-wide text-cream-dim">습도</dt>
          <dd className="mt-1 text-lg font-semibold text-cream">
            {weather.humidity !== null ? `${weather.humidity}%` : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
