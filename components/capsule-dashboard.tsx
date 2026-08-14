"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { OpenedCapsuleMark, SealedCapsuleMark } from "@/components/capsule-mark";
import ForestPage from "@/components/forest-page";
import { deleteCapsule, listMyCapsules, type Capsule } from "@/lib/capsules";
import { formatCountdown, isCapsuleOpen, useNow } from "@/lib/countdown";
import type { User } from "@/lib/auth";

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
      setError("캡슐을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDeletingId(null);
    }
  }

  const displayName = user.displayName ?? user.email ?? "로그인됨";

  return (
    <ForestPage className="px-6 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-wood">나의 타임캡슐</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight text-cream">캡슐미</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-wood/20 bg-parchment px-3 py-2 pr-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-moss-dark text-sm font-medium text-cream">
                  {displayName.slice(0, 1)}
                </span>
              )}
              <span className="text-sm font-medium text-cream">{displayName}</span>
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
              className="text-sm text-cream-dim transition hover:text-cream disabled:opacity-60"
            >
              로그아웃
            </button>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3">
          <StatCard label="전체" value={capsules.length} />
          <StatCard label="기다리는 중" value={waitingCount} />
          <StatCard label="열람 가능" value={openCount} />
        </section>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            전체
          </FilterChip>
          <FilterChip active={filter === "waiting"} onClick={() => setFilter("waiting")}>
            기다리는 중
          </FilterChip>
          <FilterChip active={filter === "open"} onClick={() => setFilter("open")}>
            열람 가능
          </FilterChip>
        </div>

        {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}

        {!ready ? (
          <p className="text-sm text-cream-dim/70">캡슐을 불러오는 중...</p>
        ) : visibleCapsules.length === 0 ? (
          <EmptyState hasAny={capsules.length > 0} />
        ) : (
          <ul className="flex flex-col gap-4">
            {visibleCapsules.map((capsule) => (
              <CapsuleListItem
                key={capsule.id}
                capsule={capsule}
                now={now}
                deleting={deletingId === capsule.id}
                onDelete={() => handleDelete(capsule)}
              />
            ))}
          </ul>
        )}
      </div>
    </ForestPage>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-wood rounded-3xl px-4 py-5 text-center">
      <p className="text-2xl font-semibold text-cream">{value}</p>
      <p className="mt-1 text-xs text-cream-dim">{label}</p>
    </div>
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
          : "btn-ghost rounded-full px-4 py-2 text-sm font-medium"
      }
    >
      {children}
    </button>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="rounded-3xl border border-dashed border-wood/30 bg-bark/40 px-8 py-16 text-center">
      <p className="text-cream-dim">
        {hasAny ? "이 조건에 맞는 캡슐이 없어요" : "아직 묻은 캡슐이 없어요"}
      </p>
      {hasAny ? null : (
        <Link
          href="/new"
          className="btn-wood mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium"
        >
          첫 캡슐 묻기
        </Link>
      )}
    </div>
  );
}

function CapsuleListItem({
  capsule,
  now,
  deleting,
  onDelete,
}: {
  capsule: Capsule;
  now: Date;
  deleting: boolean;
  onDelete: () => void;
}) {
  const open = isCapsuleOpen(capsule.openAt, now);
  const preview = open ? capsule.photos[0]?.url : undefined;

  return (
    <li className="card-wood flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center">
      {preview ? (
        <img
          src={preview}
          alt=""
          referrerPolicy="no-referrer"
          className="h-16 w-16 rounded-full object-cover ring-1 ring-wood/30"
        />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-moss-dark ring-1 ring-wood/20">
          {open ? <OpenedCapsuleMark size={64} /> : <SealedCapsuleMark size={64} />}
        </span>
      )}

      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-base font-semibold text-cream">
          {capsule.recipient ? `${capsule.recipient}에게` : "이름 없는 캡슐"}
        </p>
        <p className="mt-1 text-sm text-cream-dim">{formatCountdown(capsule.openAt, now)}</p>
        {capsule.openAt ? (
          <p className="mt-1 text-xs text-cream-dim/70">
            열람일 {capsule.openAt.toLocaleString("ko-KR")}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/capsule/${capsule.id}`}
          className="btn-wood inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium"
        >
          {open ? "열기" : "보기"}
        </Link>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="btn-ghost inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium hover:border-[#b42318]/40 hover:text-[#b42318] disabled:opacity-60"
        >
          {deleting ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </li>
  );
}
