import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";
import { deleteCapsulePhotos, type CapsulePhoto } from "@/lib/storage";

export type Capsule = {
  id: string;
  ownerId: string;
  recipient: string;
  letter: string;
  openAt: Date | null;
  photos: CapsulePhoto[];
  createdAt: Date | null;
};

export type CreateCapsuleInput = {
  ownerId: string;
  recipient: string;
  letter: string;
  openAt: string;
  photos: CapsulePhoto[];
};

function getDb() {
  return getFirestore(getFirebaseApp());
}

function toDate(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function toPhotos(value: unknown): CapsulePhoto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((photo) => {
    if (
      typeof photo !== "object" ||
      photo === null ||
      !("path" in photo) ||
      !("url" in photo) ||
      typeof photo.path !== "string" ||
      typeof photo.url !== "string"
    ) {
      return [];
    }

    return [{ path: photo.path, url: photo.url }];
  });
}

function toCapsule(id: string, data: DocumentData): Capsule {
  return {
    id,
    ownerId: typeof data.ownerId === "string" ? data.ownerId : "",
    recipient: typeof data.recipient === "string" ? data.recipient : "",
    letter: typeof data.letter === "string" ? data.letter : "",
    openAt: toDate(data.openAt),
    photos: toPhotos(data.photos),
    createdAt: toDate(data.createdAt),
  };
}

export async function createCapsule(input: CreateCapsuleInput) {
  const docRef = await addDoc(collection(getDb(), "capsules"), {
    ownerId: input.ownerId,
    recipient: input.recipient,
    letter: input.letter,
    openAt: input.openAt ? Timestamp.fromDate(new Date(input.openAt)) : null,
    photos: input.photos,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getCapsule(id: string): Promise<Capsule | null> {
  const snapshot = await getDoc(doc(getDb(), "capsules", id));

  if (!snapshot.exists()) {
    return null;
  }

  return toCapsule(snapshot.id, snapshot.data());
}

export async function listMyCapsules(ownerId: string) {
  const snapshot = await getDocs(
    query(collection(getDb(), "capsules"), where("ownerId", "==", ownerId)),
  );

  return snapshot.docs
    .map((item) => toCapsule(item.id, item.data()))
    .sort((left, right) => {
      const leftTime = left.openAt?.getTime() ?? Number.POSITIVE_INFINITY;
      const rightTime = right.openAt?.getTime() ?? Number.POSITIVE_INFINITY;
      return leftTime - rightTime;
    });
}

export async function deleteCapsule(capsule: Capsule) {
  await deleteCapsulePhotos(capsule.photos);
  await deleteDoc(doc(getDb(), "capsules", capsule.id));
}
