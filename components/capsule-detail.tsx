"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CapsuleKeywords, CapsuleQuote, OpenedCapsuleMark, SealedCapsuleMark } from "@/components/capsule-mark";
import ForestPage from "@/components/forest-page";
import { deleteCapsule, getCapsule, type Capsule } from "@/lib/capsules";
import { formatCountdown, isCapsuleOpen, useNow } from "@/lib/countdown";
import { CapsuleWeatherCard } from "@/components/capsule-weather";

const isDev = process.env.NODE_ENV === "development";

export default function CapsuleDetail({ id }: { id: string }) {
  const router = useRouter();
  const now = useNow();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [ready, setReady] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getCapsule(id)
      .then((nextCapsule) => {
        if (!cancelled) {
          setCapsule(nextCapsule);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!capsule || !window.confirm("이 캡슐을 삭제할까요?")) {
      return;
    }

    setDeleting(true);

    try {
      await deleteCapsule(capsule);
      router.push("/");
    } catch {
      setDeleting(false);
      window.alert("캡슐을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  const open = capsule ? isCapsuleOpen(capsule.openAt, now) : false;
  const showContents = open || previewOpen;

  return (
    <ForestPage weather={capsule?.weather ?? null} className="flex items-center justify-center px-6 py-16">
      <main className="card-glass w-full max-w-xl rounded-[2rem] px-8 py-12 sm:px-12">
        {!ready ? (
          <p className="text-center text-sm text-cream-dim/70">캡슐을 여는 중...</p>
        ) : capsule ? (
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-medium tracking-[0.2em] text-wood">TIME CAPSULE</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-cream">
              {capsule.recipient ? `${capsule.recipient}에게` : "이름 없는 캡슐"}
            </h1>

            {showContents ? (
              <OpenedCapsule capsule={capsule} preview={previewOpen && !open} />
            ) : (
              <LockedCapsule
                capsule={capsule}
                now={now}
                onPreview={() => setPreviewOpen(true)}
              />
            )}

            {previewOpen && !open ? (
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="mt-6 text-xs text-cream-dim/70 transition hover:text-cream-dim"
              >
                미리보기 닫기
              </button>
            ) : null}

            <Link
              href="/"
              className="btn-ghost mt-10 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium"
            >
              홈으로 돌아가기
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="mt-4 text-sm text-cream-dim/80 transition hover:text-[#b42318] disabled:opacity-60"
            >
              {deleting ? "삭제 중..." : "캡슐 삭제"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-cream-dim">캡슐을 찾을 수 없어요</p>
            <Link
              href="/"
              className="btn-ghost mt-8 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium"
            >
              홈으로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </ForestPage>
  );
}

function LockedCapsule({
  capsule,
  now,
  onPreview,
}: {
  capsule: Capsule;
  now: Date;
  onPreview: () => void;
}) {
  return (
    <div className="mt-10 w-full">
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-white/25 px-6 py-12 backdrop-blur-md"
        style={
          capsule.mood
            ? {
                background: `linear-gradient(to bottom, ${capsule.mood.style.mistFrom}cc, ${capsule.mood.style.mistTo}99)`,
              }
            : undefined
        }
      >
        <div className="pointer-events-none absolute -left-12 -top-10 h-40 w-40 rounded-full bg-leaf/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-wood/15 blur-3xl" />
        <span className="firefly firefly-a" />
        <span className="firefly firefly-b" />
        <span className="firefly firefly-c" />

        <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-wood/20" />
          <span className="absolute inset-3 rounded-full border border-dashed border-leaf/30" />
          <span className="capsule-float">
            <SealedCapsuleMark size={92} style={capsule.mood?.style} />
          </span>
        </div>
        <p className="relative mt-6 text-xl font-semibold text-cream">숲에서 잠드는 중</p>
        {capsule.mood?.quote ? (
          <div className="relative mt-4">
            <CapsuleQuote quote={capsule.mood.quote} />
          </div>
        ) : null}
        {capsule.mood?.keywords.length ? (
          <div className="relative mt-4 flex justify-center">
            <CapsuleKeywords keywords={capsule.mood.keywords} className="justify-center" />
          </div>
        ) : null}
        <p className="relative mt-5 text-sm leading-relaxed text-cream-dim">
          열람일이 되어야 사진과 편지를 볼 수 있어요. 그날의 하늘은 이미 캡슐을 감싸고 있어요.
        </p>
        <p className="relative mt-6 text-2xl font-semibold tracking-tight text-wood">
          {formatCountdown(capsule.openAt, now)}
        </p>
        {capsule.openAt ? (
          <p className="relative mt-2 text-xs text-cream-dim/70">
            {capsule.openAt.toLocaleString("ko-KR")}
          </p>
        ) : null}
      </div>

      <CapsuleWeatherCard weather={capsule.weather} className="mt-6" />

      {isDev ? (
        <button
          type="button"
          onClick={onPreview}
          className="mt-8 text-xs text-cream-dim/50 transition hover:text-cream-dim"
        >
          바로보기
        </button>
      ) : null}
    </div>
  );
}

function OpenedCapsule({
  capsule,
  preview,
}: {
  capsule: Capsule;
  preview: boolean;
}) {
  return (
    <div className="mt-10 w-full">
      {preview ? (
        <p className="mb-6 text-xs tracking-wide text-cream-dim/60">개발 미리보기</p>
      ) : (
        <p className="mb-6 text-sm font-medium text-wood">지금 열 수 있어요</p>
      )}

      {capsule.mood ? (
        <div className="mb-8 flex flex-col items-center gap-3">
          <OpenedCapsuleMark size={72} style={capsule.mood.style} />
          <p className="text-xs font-medium tracking-wide text-wood">그날의 한마디</p>
          <CapsuleQuote quote={capsule.mood.quote} />
          <CapsuleKeywords keywords={capsule.mood.keywords} className="justify-center" />
        </div>
      ) : null}

      {capsule.photos.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3">
          {capsule.photos.map((photo) => (
            <img
              key={photo.path}
              src={photo.url}
              alt=""
              referrerPolicy="no-referrer"
              className="h-28 w-28 rounded-3xl object-cover shadow-md shadow-black/30 ring-1 ring-wood/20"
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-cream-dim/70">담긴 사진이 없어요</p>
      )}

      {capsule.letter ? (
        <div className="mt-8 rounded-[1.75rem] border border-wood/20 bg-parchment px-6 py-7 text-left">
          <p className="text-xs font-medium tracking-wide text-wood">편지</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-cream">
            {capsule.letter}
          </p>
        </div>
      ) : (
        <p className="mt-8 text-sm text-cream-dim/70">담긴 편지가 없어요</p>
      )}

      <CapsuleWeatherCard weather={capsule.weather} className="mt-6" />

      {capsule.openAt ? (
        <p className="mt-6 text-xs text-cream-dim/70">
          열람일 {capsule.openAt.toLocaleString("ko-KR")}
        </p>
      ) : null}
    </div>
  );
}
