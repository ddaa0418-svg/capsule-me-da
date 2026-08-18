"use client";

import {
  isShower,
  weatherKind,
  type CapsuleWeather,
  type WeatherKind,
} from "@/lib/weather";

type ScenePalette = {
  sky: string;
  glow: string;
  ground: string;
  sun: string;
  fog: string;
  dark: boolean;
};

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function particles(count: number, salt: number) {
  return Array.from({ length: count }, (_, index) => ({
    left: seeded(index, salt) * 100,
    delay: seeded(index, salt + 1) * 6,
    duration: 1.1 + seeded(index, salt + 2) * 3.4,
    size: 0.45 + seeded(index, salt + 3) * 1.4,
    opacity: 0.22 + seeded(index, salt + 4) * 0.65,
    drift: -18 + seeded(index, salt + 5) * 36,
  }));
}

function paletteFor(weather: CapsuleWeather | null): ScenePalette {
  const kind: WeatherKind = weather ? weatherKind(weather.condition) : "mild";
  const temperature = weather?.temperature ?? 18;
  const humidity = weather?.humidity ?? 50;
  const hot = temperature >= 28;
  const cold = temperature <= 5;

  const palettes: Record<WeatherKind, ScenePalette> = {
    clear: {
      sky: hot
        ? "linear-gradient(180deg, #2F8FD6 0%, #7EC4F0 28%, #F3C56A 62%, #E8894A 100%)"
        : cold
          ? "linear-gradient(180deg, #6EBAEA 0%, #B7E0F7 42%, #EEF6EA 100%)"
          : "linear-gradient(180deg, #4EA3E0 0%, #A9D8F5 38%, #F4ECC0 78%, #E7D7A4 100%)",
      glow: hot ? "rgba(255, 186, 92, 0.45)" : "rgba(255, 236, 160, 0.4)",
      ground: hot ? "#C48A4A" : "#8FA86A",
      sun: hot ? "#FFC85A" : "#FFE58A",
      fog: `rgba(255, 250, 235, ${Math.min(0.28, humidity / 400)})`,
      dark: false,
    },
    cloud: {
      sky: "linear-gradient(180deg, #7C97B3 0%, #B7C7D6 36%, #E4DFC8 100%)",
      glow: "rgba(255, 244, 210, 0.22)",
      ground: "#8B9A70",
      sun: "#F3E2A8",
      fog: `rgba(220, 228, 236, ${0.12 + humidity / 420})`,
      dark: false,
    },
    overcast: {
      sky: "linear-gradient(180deg, #4E5A66 0%, #73808C 40%, #A9A89A 100%)",
      glow: "rgba(180, 190, 200, 0.18)",
      ground: "#6F7464",
      sun: "#D5D0C2",
      fog: `rgba(170, 178, 186, ${0.2 + humidity / 380})`,
      dark: true,
    },
    rain: {
      sky: "linear-gradient(180deg, #1C2A38 0%, #31475C 38%, #4A5E55 100%)",
      glow: "rgba(130, 170, 200, 0.16)",
      ground: "#3E4A40",
      sun: "#8AA3B8",
      fog: "rgba(40, 58, 72, 0.28)",
      dark: true,
    },
    snow: {
      sky: "linear-gradient(180deg, #9BB3CC 0%, #D5E2EF 46%, #F6FAFF 100%)",
      glow: "rgba(255, 255, 255, 0.4)",
      ground: "#E8EEF5",
      sun: "#F7FBFF",
      fog: `rgba(240, 246, 255, ${0.16 + humidity / 500})`,
      dark: false,
    },
    sleet: {
      sky: "linear-gradient(180deg, #4A5D70 0%, #7B8FA3 42%, #D5DDE6 100%)",
      glow: "rgba(210, 224, 236, 0.25)",
      ground: "#9AA7B0",
      sun: "#E8EEF4",
      fog: "rgba(190, 202, 214, 0.28)",
      dark: true,
    },
    mild: {
      sky: "linear-gradient(180deg, #eef5e4 0%, #dce9cc 48%, #e6dcc4 100%)",
      glow: "rgba(168, 196, 122, 0.32)",
      ground: "#C4B48A",
      sun: "#F0D889",
      fog: "rgba(232, 241, 220, 0.12)",
      dark: false,
    },
  };

  return palettes[kind];
}

export default function WeatherAtmosphere({
  weather,
}: {
  weather: CapsuleWeather | null;
}) {
  const kind = weather ? weatherKind(weather.condition) : "mild";
  const palette = paletteFor(weather);
  const humidity = weather?.humidity ?? 45;
  const rainfall = weather?.rainfall ?? 0;
  const temperature = weather?.temperature ?? 18;
  const shower = weather ? isShower(weather.condition) : false;
  const rainCount = kind === "rain" || kind === "sleet" ? 22 + Math.min(18, Math.round(rainfall * 5)) : 0;
  const snowCount = kind === "snow" ? 34 : kind === "sleet" ? 16 : 0;
  const moteCount = kind === "clear" ? (temperature >= 28 ? 22 : 14) : kind === "mild" ? 8 : 0;
  const cloudCount = kind === "cloud" ? 6 : kind === "overcast" ? 7 : kind === "clear" ? 3 : kind === "rain" ? 5 : 4;

  return (
    <div
      className="weather-scene"
      data-kind={kind}
      data-dark={palette.dark ? "true" : "false"}
      aria-hidden="true"
    >
      <div className="weather-sky" style={{ background: palette.sky }} />
      <div
        className="weather-glow"
        style={{ background: `radial-gradient(ellipse 70% 40% at 50% -10%, ${palette.glow}, transparent 60%)` }}
      />

      {kind === "clear" || kind === "mild" || kind === "cloud" ? (
        <span
          className={`weather-sun ${temperature >= 28 ? "weather-sun-hot" : ""}`}
          style={{ background: palette.sun, boxShadow: `0 0 80px 28px ${palette.glow}` }}
        />
      ) : null}

      <div className="weather-clouds">
        {particles(cloudCount, 3).map((cloud, index) => (
          <span
            key={`cloud-${index}`}
            className="weather-cloud"
            style={{
              left: `${(index * 19 + cloud.left * 0.18) % 100}%`,
              top: `${8 + seeded(index, 9) * 28}%`,
              animationDuration: `${28 + cloud.duration * 10}s`,
              animationDelay: `${-cloud.delay * 4}s`,
              opacity: kind === "overcast" ? 0.55 : kind === "clear" ? 0.28 : 0.42,
              transform: `scale(${0.8 + cloud.size * 0.7})`,
            }}
          />
        ))}
      </div>

      {kind === "overcast" || humidity >= 70 ? (
        <div className="weather-fog" style={{ background: palette.fog }} />
      ) : null}

      {rainCount > 0
        ? particles(rainCount, 11).map((drop, index) => (
            <span
              key={`rain-${index}`}
              className="weather-rain"
              style={{
                left: `${drop.left}%`,
                animationDelay: `${-drop.delay}s`,
                animationDuration: `${0.7 + drop.duration * 0.45}s`,
                height: `${12 + drop.size * 16}px`,
                opacity: drop.opacity,
              }}
            />
          ))
        : null}

      {snowCount > 0
        ? particles(snowCount, 17).map((flake, index) => (
            <span
              key={`snow-${index}`}
              className="weather-snow"
              style={{
                left: `${flake.left}%`,
                width: `${3 + flake.size * 5}px`,
                height: `${3 + flake.size * 5}px`,
                animationDelay: `${-flake.delay}s`,
                animationDuration: `${6 + flake.duration * 5}s`,
                opacity: flake.opacity,
                ["--drift" as string]: `${flake.drift}px`,
              }}
            />
          ))
        : null}

      {moteCount > 0
        ? particles(moteCount, 23).map((mote, index) => (
            <span
              key={`mote-${index}`}
              className="weather-mote"
              style={{
                left: `${mote.left}%`,
                top: `${12 + seeded(index, 29) * 60}%`,
                animationDelay: `${-mote.delay}s`,
                animationDuration: `${7 + mote.duration * 4}s`,
                opacity: mote.opacity,
              }}
            />
          ))
        : null}

      {temperature >= 28 && kind === "clear" ? <div className="weather-heat" /> : null}
      {shower ? <div className="weather-lightning" /> : null}

      <div
        className="weather-ground"
        style={{
          background: `linear-gradient(180deg, transparent, ${palette.ground})`,
        }}
      />
    </div>
  );
}
