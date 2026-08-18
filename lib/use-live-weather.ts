"use client";

import { useEffect, useState } from "react";
import { fetchCapsuleWeather, getBrowserCoords, type CapsuleWeather } from "@/lib/weather";

export function useLiveWeather() {
  const [weather, setWeather] = useState<CapsuleWeather | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getBrowserCoords()
      .then((coords) => fetchCapsuleWeather(coords))
      .then((nextWeather) => {
        if (!cancelled) {
          setWeather(nextWeather);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWeather(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return weather;
}
