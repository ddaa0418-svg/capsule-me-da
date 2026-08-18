import { createOgImage, ogContentType, ogSize } from "@/lib/og-image";

export const alt = "사진과 편지를 타임캡슐에 담고, 함께 열 날짜를 정하세요.";
export const size = ogSize;
export const contentType = ogContentType;

export default async function NewOpenGraphImage() {
  return createOgImage({
    title: "새 캡슐 묻기",
    description: "사진과 편지를 타임캡슐에 담고, 함께 열 날짜를 정하세요.",
  });
}
