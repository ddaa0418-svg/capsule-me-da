import { FirebaseError } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase";

function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export type { User };

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export function getCurrentUser() {
  return getFirebaseAuth().currentUser;
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  auth.useDeviceLanguage();
  await signInWithPopup(auth, createGoogleProvider());
}

export async function signOutUser() {
  await signOut(getFirebaseAuth());
}

function getErrorCode(error: unknown) {
  if (error instanceof FirebaseError) {
    return error.code;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}

export function getGoogleSignInErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("Firebase 웹 설정이 없습니다")) {
    return error.message;
  }

  const code = getErrorCode(error);

  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "auth/popup-blocked":
    case "auth/operation-not-supported-in-this-environment":
      return "팝업이 차단되어 로그인할 수 없습니다. Chrome이나 Edge에서 http://localhost:3000 을 직접 열어주세요.";
    case "auth/unauthorized-domain": {
      const host = typeof window !== "undefined" ? window.location.hostname : "";
      return host
        ? `이 주소(${host})는 Firebase 인증에 허용되지 않았습니다. 콘솔 → Authentication → Settings → Authorized domains에 추가해주세요.`
        : "이 도메인은 Firebase 인증에 허용되지 않았습니다. 콘솔의 승인된 도메인을 확인해주세요.";
    }
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "Firebase API 키가 없습니다. .env 파일을 저장한 뒤 개발 서버를 다시 시작해주세요.";
    default:
      return code
        ? `구글 로그인에 실패했습니다. (${code})`
        : "구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
}
