import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: getAbsoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getAbsoluteUrl("/new"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
