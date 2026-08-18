import type { Metadata } from "next";
import HomeAuthCard from "@/components/home-auth-card";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      "ko-KR": "/",
    },
  },
  openGraph: {
    url: "/",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function Home() {
  return <HomeAuthCard />;
}
