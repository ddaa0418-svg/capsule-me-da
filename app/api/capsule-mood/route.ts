import { generateCapsuleMood } from "@/lib/gemini";
import { fallbackCapsuleMood } from "@/lib/capsule-mood";
import { isCapsuleWeather, type CapsuleWeather } from "@/lib/weather";

export const runtime = "nodejs";
export const maxDuration = 30;

function readWeather(value: unknown): CapsuleWeather | null {
  return isCapsuleWeather(value) ? value : null;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const payload = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    const weather = readWeather(payload.weather);
    const letter = typeof payload.letter === "string" ? payload.letter : "";
    const recipient = typeof payload.recipient === "string" ? payload.recipient : "";

    const mood = await generateCapsuleMood({ weather, letter, recipient });
    return Response.json(mood);
  } catch (error) {
    const message = error instanceof Error ? error.message : "capsule mood failed";
    console.error(message);
    return Response.json(fallbackCapsuleMood(null));
  }
}
