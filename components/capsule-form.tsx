"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { CapsuleKeywords, CapsuleQuote, SealedCapsuleMark } from "@/components/capsule-mark";
import ForestPage from "@/components/forest-page";
import { getCurrentUser } from "@/lib/auth";
import { fallbackCapsuleMood, fetchCapsuleMood, type CapsuleMood } from "@/lib/capsule-mood";
import { createCapsule } from "@/lib/capsules";
import { trackEvent } from "@/lib/gtag";
import { uploadCapsulePhotos } from "@/lib/storage";
import { useLiveWeather } from "@/lib/use-live-weather";
import { CapsuleWeatherCard } from "@/components/capsule-weather";
import { fetchCapsuleWeather, formatWeatherSummary, getBrowserCoords, type CapsuleWeather } from "@/lib/weather";

export default function CapsuleForm() {
  const [recipient, setRecipient] = useState("");
  const [letter, setLetter] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [buriedId, setBuriedId] = useState<string | null>(null);
  const [buriedMood, setBuriedMood] = useState<CapsuleMood | null>(null);
  const [buriedWeather, setBuriedWeather] = useState<CapsuleWeather | null>(null);
  const weather = useLiveWeather();
  const previewMood = fallbackCapsuleMood(weather);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = getCurrentUser();
    if (!user) {
      alert("로그인 먼저!");
      return;
    }

    setPending(true);
    setStatus("날씨를 담는 중...");

    try {
      const [photos, capturedWeather] = await Promise.all([
        uploadCapsulePhotos(user.uid, files),
        weather
          ? Promise.resolve(weather)
          : getBrowserCoords()
              .then((coords) => fetchCapsuleWeather(coords))
              .catch(() => null),
      ]);
      setStatus("그날의 한마디를 짓는 중...");
      const mood = await fetchCapsuleMood({
        weather: capturedWeather,
        letter,
        recipient,
      });
      setStatus("캡슐을 묻는 중...");
      const capsuleId = await createCapsule({
        ownerId: user.uid,
        recipient,
        letter,
        openAt,
        photos,
        weather: capturedWeather,
        mood,
      });
      trackEvent("capsule_create", {
        has_photos: photos.length > 0,
        photo_count: photos.length,
      });
      setBuriedMood(mood);
      setBuriedWeather(capturedWeather);
      setBuriedId(capsuleId);
    } finally {
      setPending(false);
      setStatus("");
    }
  }

  return (
    <ForestPage weather={buriedWeather ?? weather} className="flex items-center justify-center px-6 py-16">
      <main className="card-glass w-full max-w-lg rounded-3xl px-8 py-12 sm:px-10">
        {buriedId ? (
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-cream">묻었습니다!</h1>
            <CapsuleWeatherCard weather={buriedWeather ?? weather} className="mt-8" />
            {buriedMood ? (
              <div className="mt-8 flex flex-col items-center gap-4">
                <span className="capsule-drift" style={{ ["--amp" as string]: "10px" }}>
                  <SealedCapsuleMark size={108} style={buriedMood.style} />
                </span>
                <CapsuleQuote quote={buriedMood.quote} />
                <CapsuleKeywords keywords={buriedMood.keywords} className="justify-center" />
              </div>
            ) : null}
            <p className="mt-6 text-sm text-cream-dim">열람일이 되면 다시 열어볼 수 있어요</p>
            <Link
              href="/"
              className="btn-wood mt-10 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium tracking-wide shadow-md"
            >
              바로 홈으로 돌아가기
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <span className="capsule-drift" style={{ ["--amp" as string]: "8px" }}>
                <SealedCapsuleMark size={84} style={previewMood.style} />
              </span>
              <h1 className="mt-5 text-center text-4xl font-semibold tracking-tight text-cream">
                캡슐 묻기
              </h1>
              <p className="mt-3 text-center text-sm text-cream-dim">
                지금 하늘 아래로 사진과 편지를 묻어요
              </p>
              {weather ? (
                <p className="mt-2 text-center text-xs font-medium text-wood">
                  {formatWeatherSummary(weather)}
                </p>
              ) : (
                <p className="mt-2 text-center text-xs text-cream-dim/70">
                  위치 권한을 허용하면 지금 있는 곳의 날씨를 담아요
                </p>
              )}
            </div>

            <form className="mt-10 flex flex-col gap-6" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-left text-sm font-medium text-cream-dim">
                받는 사람
                <input
                  type="text"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  className="field-wood rounded-2xl px-4 py-3 text-sm font-normal outline-none transition"
                />
              </label>

              <label className="flex flex-col gap-2 text-left text-sm font-medium text-cream-dim">
                편지
                <textarea
                  value={letter}
                  onChange={(event) => setLetter(event.target.value)}
                  rows={6}
                  className="field-wood resize-y rounded-2xl px-4 py-3 text-sm font-normal outline-none transition"
                />
              </label>

              <label className="flex flex-col gap-2 text-left text-sm font-medium text-cream-dim">
                열람일
                <input
                  type="datetime-local"
                  value={openAt}
                  onChange={(event) => setOpenAt(event.target.value)}
                  className="field-wood rounded-2xl px-4 py-3 text-sm font-normal outline-none transition"
                />
              </label>

              <label className="flex flex-col gap-2 text-left text-sm font-medium text-cream-dim">
                사진
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    setFiles(Array.from(event.target.files ?? []));
                  }}
                  className="text-sm font-normal file:mr-4 file:rounded-full file:border-0 file:bg-wood file:px-4 file:py-2 file:text-sm file:font-medium file:text-parchment"
                />
              </label>

              {previews.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {previews.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-20 w-20 rounded-full object-cover ring-1 ring-wood/30"
                    />
                  ))}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="btn-wood mt-2 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium tracking-wide shadow-md disabled:cursor-wait disabled:opacity-70"
              >
                {pending ? status || "뭍는 중..." : "캡슐 묻기"}
              </button>
            </form>

            <div className="mt-6 flex justify-center">
              <HomeButton />
            </div>
          </>
        )}
      </main>
    </ForestPage>
  );
}

function HomeButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`btn-ghost inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium ${className}`}
    >
      홈으로 돌아가기
    </Link>
  );
}
