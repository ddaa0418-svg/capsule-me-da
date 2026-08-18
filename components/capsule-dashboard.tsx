"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FloatingCapsuleField from "@/components/floating-capsule-field";
import ForestPage from "@/components/forest-page";
import { deleteCapsule, listMyCapsules, type Capsule } from "@/lib/capsules";
import { isCapsuleOpen, useNow } from "@/lib/countdown";
import type { User } from "@/lib/auth";
import { useLiveWeather } from "@/lib/use-live-weather";
import { formatWeatherSummary } from "@/lib/weather";
import { sceneIsDark } from "@/lib/weather-scene";

type Filter = "all" | "waiting" | "open";

export default function CapsuleDashboard({
  user,
  pending,
  onSignOut,
}: {
  user: User;
  pending: boolean;
  onSignOut: () => void;
}) {
  const now = useNow();
  const weather = useLiveWeather();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void listMyCapsules(user.uid)
      .then((nextCapsules) => {
        if (!cancelled) {
          setCapsules(nextCapsules);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("캡슐 목록을 불러오지 못했습니다.");
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
  }, [user.uid]);

  const waitingCount = capsules.filter((capsule) => !isCapsuleOpen(capsule.openAt, now)).length;
  const openCount = capsules.length - waitingCount;

  const visibleCapsules = useMemo(() => {
    return capsules.filter((capsule) => {
      const open = isCapsuleOpen(capsule.openAt, now);

      if (filter === "waiting") {
        return !open;
      }

      if (filter === "open") {
        return open;
      }

      return true;
    });
  }, [capsules, filter, now]);

  async function handleDelete(capsule: Capsule) {
    if (!window.confirm("이 캡슐을 삭제할까요?")) {
      return;
    }

    setDeletingId(capsule.id);
    setError(null);

    try {
      await deleteCapsule(capsule);
      setCapsules((current) => current.filter((item) => item.id !== capsule.id));
    } catch {
      setError("캡슐을 삭제하지 못했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  const displayName = user.displayName ?? user.email ?? "로그인됨";
  const darkScene = sceneIsDark(weather);
  const titleClass = darkScene
    ? "text-white drop-shadow-md"
    : "text-cream drop-shadow-[0_1px_10px_rgba(255,255,255,0.65)]";
  const kickerClass = darkScene ? "text-white/80 drop-shadow" : "text-cream-dim";

  return (
    <ForestPage weather={weather} className="px-0 py-0">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 p-4 sm:p-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <div className="pointer-events-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`text-xs font-medium tracking-[0.22em] ${kickerClass}`}>
                MY TIME CAPSULES
              </p>
              <h1 className={`mt-1 text-4xl font-semibold tracking-tight ${titleClass}`}>
                캡슐미
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {weather ? (
                <div className="hud-glass rounded-full px-4 py-2 text-sm font-medium">
                  {formatWeatherSummary(weather)}
                </div>
              ) : null}

              <div className="hud-glass flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss-dark text-sm font-medium text-cream">
                    {displayName.slice(0, 1)}
                  </span>
                )}
                <span className="max-w-[8rem] truncate text-sm font-medium">{displayName}</span>
              </div>

              <Link
                href="/new"
                className="btn-wood inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium shadow-md"
              >
                캡슐 묻기
              </Link>

              <button
                type="button"
                onClick={onSignOut}
                disabled={pending}
                className="hud-glass rounded-full px-4 py-2 text-sm transition hover:bg-white/90 disabled:opacity-60"
              >
                로그아웃
              </button>
            </div>
          </div>

          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              {`전체 ${capsules.length}`}
            </FilterChip>
            <FilterChip active={filter === "waiting"} onClick={() => setFilter("waiting")}>
              {`기다리는 중 ${waitingCount}`}
            </FilterChip>
            <FilterChip active={filter === "open"} onClick={() => setFilter("open")}>
              {`열람 가능 ${openCount}`}
            </FilterChip>
          </div>

          {error ? (
            <p className="pointer-events-auto hud-glass w-fit rounded-full px-4 py-2 text-sm text-[#b42318]">
              {error}
            </p>
          ) : null}
        </div>
      </header>

      <FloatingCapsuleField
        capsules={visibleCapsules}
        now={now}
        ready={ready}
        hasAny={capsules.length > 0}
        deletingId={deletingId}
        onDelete={handleDelete}
      />
    </ForestPage>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "btn-wood rounded-full px-4 py-2 text-sm font-medium"
          : "hud-glass rounded-full px-4 py-2 text-sm font-medium"
      }
    >
      {children}
    </button>
  );
}
