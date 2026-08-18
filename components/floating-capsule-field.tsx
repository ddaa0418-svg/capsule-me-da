"use client";

import Link from "next/link";
import { useMemo } from "react";
import { OpenedCapsuleMark, SealedCapsuleMark } from "@/components/capsule-mark";
import { visualStyleForCapsule } from "@/lib/capsule-mood";
import { layoutCapsules, type CapsulePlacement } from "@/lib/capsule-layout";
import type { Capsule } from "@/lib/capsules";
import { formatCountdown, isCapsuleOpen } from "@/lib/countdown";

export default function FloatingCapsuleField({
  capsules,
  now,
  ready,
  hasAny,
  deletingId,
  onDelete,
}: {
  capsules: Capsule[];
  now: Date;
  ready: boolean;
  hasAny: boolean;
  deletingId: string | null;
  onDelete: (capsule: Capsule) => void;
}) {
  const minute = Math.floor(now.getTime() / 60_000);
  const layoutNow = useMemo(() => new Date(minute * 60_000), [minute]);
  const placements = useMemo(
    () => layoutCapsules(capsules, layoutNow),
    [capsules, layoutNow],
  );
  const placementById = useMemo(() => {
    const map = new Map<string, CapsulePlacement>();
    for (const placement of placements) {
      map.set(placement.id, placement);
    }
    return map;
  }, [placements]);

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden pt-28 pb-8">
      <div className="relative mx-auto h-[calc(100svh-5rem)] min-h-[720px] w-full">
        {!ready ? (
          <p className="hud-glass absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-2 text-sm">
            캡슐이 떠오르는 중...
          </p>
        ) : capsules.length === 0 ? (
          <EmptyField hasAny={hasAny} />
        ) : (
          capsules.map((capsule) => {
            const placement = placementById.get(capsule.id);
            if (!placement) {
              return null;
            }

            return (
              <FloatingCapsule
                key={capsule.id}
                capsule={capsule}
                now={now}
                placement={placement}
                deleting={deletingId === capsule.id}
                onDelete={() => onDelete(capsule)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyField({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="absolute left-1/2 top-[42%] w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 text-center">
      <div className="hud-glass rounded-3xl px-8 py-10">
        <p className="text-sm text-cream-dim">
          {hasAny ? "이 조건에 맞는 캡슐이 떠 있지 않아요" : "아직 묻은 캡슐이 없어요"}
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
    </div>
  );
}

function FloatingCapsule({
  capsule,
  now,
  placement,
  deleting,
  onDelete,
}: {
  capsule: Capsule;
  now: Date;
  placement: CapsulePlacement;
  deleting: boolean;
  onDelete: () => void;
}) {
  const open = isCapsuleOpen(capsule.openAt, now);
  const style = visualStyleForCapsule(capsule);
  const name = capsule.recipient ? `${capsule.recipient}에게` : "이름 없는 캡슐";

  return (
    <div
      className="floating-capsule group absolute -translate-x-1/2 -translate-y-1/2 hover:!z-50"
      style={{
        left: `${placement.x}%`,
        top: `${placement.y}%`,
        zIndex: 8 + placement.z,
        width: placement.size,
      }}
    >
      <span
        className="capsule-drift relative mx-auto block"
        style={{
          width: placement.size,
          height: placement.size,
          ["--tilt" as string]: `${placement.tilt}deg`,
          ["--amp" as string]: `${placement.amplitude}px`,
          ["--dx" as string]: `${placement.dx}px`,
          ["--drift-duration" as string]: `${placement.duration}s`,
          animationDelay: `${-placement.delay}s`,
        }}
      >
        <span
          className={`pointer-events-none absolute inset-[-28%] rounded-full blur-3xl ${open ? "opacity-90" : "opacity-50"}`}
          style={{ background: style.glow }}
        />
        <Link
          href={`/capsule/${capsule.id}`}
          className="relative z-10 block rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-wood/50"
          aria-label={`${name}, ${formatCountdown(capsule.openAt, now)}`}
        >
          {open ? (
            <OpenedCapsuleMark size={placement.size} style={style} />
          ) : (
            <SealedCapsuleMark size={placement.size} style={style} />
          )}
        </Link>
        <span className="pointer-events-none absolute inset-x-2 bottom-2 z-10 text-center">
          <span className="inline-block max-w-full truncate rounded-full bg-[rgba(36,53,40,0.55)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
            {name}
          </span>
          <span className="mt-1 block text-[10px] font-medium text-white/90 drop-shadow">
            {formatCountdown(capsule.openAt, now)}
          </span>
        </span>
      </span>

      <span className="mt-1 flex items-center justify-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <Link
          href={`/capsule/${capsule.id}`}
          className="btn-wood rounded-full px-3 py-1 text-[11px] font-medium"
        >
          {open ? "열기" : "보기"}
        </Link>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="hud-glass rounded-full px-3 py-1 text-[11px] font-medium hover:text-[#b42318] disabled:opacity-60"
        >
          {deleting ? "삭제 중" : "삭제"}
        </button>
      </span>
    </div>
  );
}
