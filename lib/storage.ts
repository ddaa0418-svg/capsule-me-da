import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase";

export type CapsulePhoto = {
  path: string;
  url: string;
};

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "image/avif": ".avif",
};

function getFirebaseStorage() {
  return getStorage(getFirebaseApp());
}

function getSafeExtension(file: File) {
  const fromType = IMAGE_EXTENSIONS[file.type.toLowerCase()];
  if (fromType) {
    return fromType;
  }

  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (/^[a-z0-9]{1,5}$/.test(fromName)) {
    return `.${fromName}`;
  }

  return ".bin";
}

export async function uploadCapsulePhotos(uid: string, files: File[]) {
  const storage = getFirebaseStorage();
  const timestamp = Date.now();

  const photos = await Promise.all(
    files.map(async (file, index) => {
      const path = `capsules/${uid}/${timestamp}-${index}${getSafeExtension(file)}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file, {
        contentType: file.type || "application/octet-stream",
      });

      return {
        path,
        url: await getDownloadURL(fileRef),
      } satisfies CapsulePhoto;
    }),
  );

  return photos;
}

export async function deleteCapsulePhotos(photos: CapsulePhoto[]) {
  const storage = getFirebaseStorage();

  await Promise.all(
    photos.map(async (photo) => {
      try {
        await deleteObject(ref(storage, photo.path));
      } catch {
        // Storage 파일이 없어도 캡슐 문서는 지울 수 있게 둡니다.
      }
    }),
  );
}
