import type { Metadata } from "next";
import CapsuleForm from "@/components/capsule-form";

export const metadata: Metadata = {
  title: "새 캡슐 묻기",
  description: "사진과 편지를 타임캡슐에 담고, 함께 열 날짜를 정하세요.",
  alternates: {
    canonical: "/new",
    languages: {
      "ko-KR": "/new",
    },
  },
  openGraph: {
    title: "새 캡슐 묻기",
    description: "사진과 편지를 타임캡슐에 담고, 함께 열 날짜를 정하세요.",
    url: "/new",
  },
  twitter: {
    title: "새 캡슐 묻기",
    description: "사진과 편지를 타임캡슐에 담고, 함께 열 날짜를 정하세요.",
  },
};

export default function NewCapsulePage() {
  return <CapsuleForm />;
}
