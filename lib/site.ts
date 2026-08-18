export const siteConfig = {
  name: "캡슐미",
  shortName: "캡슐미",
  title: "캡슐미 | 사진과 편지를 묻는 타임캡슐",
  description:
    "사진과 편지를 묻고, 열람일에 함께 여는 타임캡슐. 오늘의 날씨와 마음을 담아 미래의 나에게 보내세요.",
  locale: "ko_KR",
  language: "ko",
  category: "lifestyle",
  keywords: [
    "캡슐미",
    "타임캡슐",
    "미래편지",
    "사진 편지",
    "추억",
    "다이어리",
    "열람일",
  ],
} as const;

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;

  if (explicit) {
    return stripTrailingSlash(explicit);
  }

  return "https://capsule-me-da.vercel.app";
}

export function getAbsoluteUrl(path = "/") {
  const pathname = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${pathname === "/" ? "" : pathname}`;
}

export function getGaMeasurementId() {
  const id =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    "G-B55QN23LE3";

  return /^G-[A-Z0-9]+$/.test(id) ? id : null;
}
