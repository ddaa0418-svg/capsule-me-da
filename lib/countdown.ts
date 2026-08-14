import { useEffect, useState } from "react";

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return now;
}

export function isCapsuleOpen(openAt: Date | null, now = new Date()) {
  return !openAt || openAt.getTime() <= now.getTime();
}

export function formatCountdown(openAt: Date | null, now = new Date()) {
  if (!openAt) {
    return "언제든 열 수 있어요";
  }

  const diff = openAt.getTime() - now.getTime();

  if (diff <= 0) {
    return "지금 열 수 있어요";
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  if (days > 0) {
    return `${days}일 ${hours}시간 남음`;
  }

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  }

  if (minutes > 0) {
    return `${minutes}분 ${seconds}초 남음`;
  }

  return `${seconds}초 남음`;
}
