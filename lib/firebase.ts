import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDFYn4Oe-wzBCjbZwkAYmEmDllebOfj0mA",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dahye-94990.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dahye-94990",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "dahye-94990.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "991261685025",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:991261685025:web:5248284d6631549085ba60",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-B55QN23LE3",
};

export function getFirebaseApp(): FirebaseApp {
  const existing = getApps()[0];
  if (existing?.options.projectId) {
    return existing;
  }

  return initializeApp(firebaseConfig);
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  const { getAnalytics, isSupported } = await import("firebase/analytics");

  if (!(await isSupported())) {
    return null;
  }

  return getAnalytics(getFirebaseApp());
}
