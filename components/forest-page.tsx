import type { ReactNode } from "react";
import WeatherAtmosphere from "@/components/weather-atmosphere";
import type { CapsuleWeather } from "@/lib/weather";

export default function ForestPage({
  children,
  className = "",
  weather = null,
}: {
  children: ReactNode;
  className?: string;
  weather?: CapsuleWeather | null;
}) {
  return (
    <div className="page-scene">
      <WeatherAtmosphere weather={weather} />
      <div className={`relative z-10 min-h-screen ${className}`}>{children}</div>
    </div>
  );
}
