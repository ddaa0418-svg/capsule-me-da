import type { Metadata } from "next";
import CapsuleDetail from "@/components/capsule-detail";

export async function generateMetadata({
  params,
}: PageProps<"/capsule/[id]">): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "타임캡슐",
    description: "묻고 기다렸던 타임캡슐을 열어보세요.",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
    alternates: {
      canonical: `/capsule/${id}`,
    },
    openGraph: {
      title: "타임캡슐",
      description: "묻고 기다렸던 타임캡슐을 열어보세요.",
      url: `/capsule/${id}`,
    },
    twitter: {
      title: "타임캡슐",
      description: "묻고 기다렸던 타임캡슐을 열어보세요.",
    },
  };
}

export default async function CapsulePage({
  params,
}: PageProps<"/capsule/[id]">) {
  const { id } = await params;

  return <CapsuleDetail id={id} />;
}
