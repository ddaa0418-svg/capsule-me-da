import { siteConfig } from "@/lib/site";
import { createOgImage, ogContentType, ogSize } from "@/lib/og-image";

export const alt = siteConfig.description;
export const size = ogSize;
export const contentType = ogContentType;

export default async function OpenGraphImage() {
  return createOgImage();
}
