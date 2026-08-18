"use client";

import { useEffect, useRef, useState } from "react";
import CapsuleDashboard from "@/components/capsule-dashboard";
import ForestPage from "@/components/forest-page";
import { useLiveWeather } from "@/lib/use-live-weather";
import { trackEvent } from "@/lib/gtag";
import {
  getGoogleSignInErrorMessage,
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
  type User,
} from "@/lib/auth";

export default function HomeAuthCard() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signingInRef = useRef(false);
  const weather = useLiveWeather();

  useEffect(() => {
    try {
      return subscribeToAuth((nextUser) => {
        setUser(nextUser);
        setReady(true);
      });
    } catch (authError) {
      setError(getGoogleSignInErrorMessage(authError));
      setReady(true);
    }
  }, []);

  async function handleGoogleSignIn() {
    if (signingInRef.current) {
      return;
    }

    signingInRef.current = true;

    try {
      await signInWithGoogle();
      trackEvent("login", { method: "google" });
      setError(null);
    } catch (signInError) {
      setError(getGoogleSignInErrorMessage(signInError));
    } finally {
      signingInRef.current = false;
    }
  }

  async function handleSignOut() {
    setError(null);
    setPending(true);

    try {
      await signOutUser();
    } catch {
      setError("로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(false);
    }
  }

  return user ? (
    <CapsuleDashboard user={user} pending={pending} onSignOut={handleSignOut} />
  ) : (
    <ForestPage weather={weather} className="flex items-center justify-center px-6">
      <main className="card-glass w-full max-w-lg rounded-3xl px-10 py-16 text-center">
        <p className="text-xs font-medium tracking-[0.28em] text-wood">FOREST CAPSULE</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-cream sm:text-6xl">
          캡슐미
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-cream-dim">
          사진과 편지를 묻고, 열람일에 함께 열어요
        </p>

        {!ready ? (
          <p className="mt-10 text-sm text-cream-dim/70">로그인 상태를 확인하는 중...</p>
        ) : (
          <GoogleSignInButton pending={pending} onClick={handleGoogleSignIn} />
        )}

        {error ? <p className="mt-4 text-sm text-[#b42318]">{error}</p> : null}
      </main>
    </ForestPage>
  );
}

function GoogleSignInButton({
  pending,
  onClick,
}: {
  pending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="btn-ghost mt-10 inline-flex items-center justify-center gap-3 rounded-full px-7 py-3.5 text-sm font-medium shadow-sm disabled:cursor-wait disabled:opacity-70"
    >
      <GoogleMark />
      {pending ? "로그인 중..." : "Google로 계속하기"}
    </button>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46c-0.28 1.5-1.12 2.77-2.39 3.62v3.01h3.87c2.26-2.08 3.55-5.14 3.55-8.66z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3.01c-1.08.72-2.46 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.27v3.1C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.25 14.26A7.2 7.2 0 0 1 4.87 12c0-.79.14-1.55.38-2.26V6.64H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.36l3.98-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.64l3.98 3.1C6.2 6.87 8.86 4.75 12 4.75z"
      />
    </svg>
  );
}
