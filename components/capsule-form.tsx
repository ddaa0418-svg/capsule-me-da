"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import ForestPage from "@/components/forest-page";
import { getCurrentUser } from "@/lib/auth";
import { createCapsule } from "@/lib/capsules";
import { uploadCapsulePhotos } from "@/lib/storage";

export default function CapsuleForm() {
  const [recipient, setRecipient] = useState("");
  const [letter, setLetter] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [buriedId, setBuriedId] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = getCurrentUser();
    if (!user) {
      alert("로그인 먼저!");
      return;
    }

    setPending(true);

    try {
      const photos = await uploadCapsulePhotos(user.uid, files);
      const capsuleId = await createCapsule({
        ownerId: user.uid,
        recipient,
        letter,
        openAt,
        photos,
      });
      console.log({ capsuleId, photos });
      setBuriedId(capsuleId);
    } finally {
      setPending(false);
    }
  }

  return (
    <ForestPage className="flex items-center justify-center px-6 py-16">
      <main className="card-wood w-full max-w-lg rounded-3xl px-8 py-12 sm:px-10">
        {buriedId ? (
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-cream">묻었습니다!</h1>
            <p className="mt-4 text-sm text-cream-dim">열람일이 되면 다시 열어볼 수 있어요</p>
            <Link
              href="/"
              className="btn-wood mt-10 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium tracking-wide shadow-md"
            >
              바로 홈으로 돌아가기
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-center text-4xl font-semibold tracking-tight text-cream">
              캡슐 묻기
            </h1>
            <p className="mt-3 text-center text-sm text-cream-dim">
              사진과 편지를 묻고, 열람일에 함께 열어요
            </p>

            <form className="mt-10 flex flex-col gap-6" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-left text-sm font-medium text-cream-dim">
                받는 사람
                <input
                  type="text"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  className="field-wood rounded-2xl px-4 py-3 text-sm font-normal outline-none transition"
                />
              </label>

              <label className="flex flex-col gap-2 text-left text-sm font-medium text-cream-dim">
                편지
                <textarea
                  value={letter}
                  onChange={(event) => setLetter(event.target.value)}
                  rows={6}
                  className="field-wood resize-y rounded-2xl px-4 py-3 text-sm font-normal outline-none transition"
                />
              </label>

              <label className="flex flex-col gap-2 text-left text-sm font-medium text-cream-dim">
                열람일
                <input
                  type="datetime-local"
                  value={openAt}
                  onChange={(event) => setOpenAt(event.target.value)}
                  className="field-wood rounded-2xl px-4 py-3 text-sm font-normal outline-none transition"
                />
              </label>

              <label className="flex flex-col gap-2 text-left text-sm font-medium text-cream-dim">
                사진
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    setFiles(Array.from(event.target.files ?? []));
                  }}
                  className="text-sm font-normal file:mr-4 file:rounded-full file:border-0 file:bg-wood file:px-4 file:py-2 file:text-sm file:font-medium file:text-parchment"
                />
              </label>

              {previews.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {previews.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-20 w-20 rounded-full object-cover ring-1 ring-wood/30"
                    />
                  ))}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="btn-wood mt-2 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium tracking-wide shadow-md disabled:cursor-wait disabled:opacity-70"
              >
                {pending ? "뭍는 중..." : "캡슐 묻기"}
              </button>
            </form>

            <div className="mt-6 flex justify-center">
              <HomeButton />
            </div>
          </>
        )}
      </main>
    </ForestPage>
  );
}

function HomeButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`btn-ghost inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium ${className}`}
    >
      홈으로 돌아가기
    </Link>
  );
}
