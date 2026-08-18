import { getCurrentWeather } from "@/lib/kma-weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  try {
    const weather = await getCurrentWeather(
      Number.isFinite(lat) ? lat : undefined,
      Number.isFinite(lon) ? lon : undefined,
    );

    return Response.json(weather);
  } catch (error) {
    const message = error instanceof Error ? error.message : "weather fetch failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
