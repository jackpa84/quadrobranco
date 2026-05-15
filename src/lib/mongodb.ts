import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "annotations";

if (!uri) {
  console.warn("MONGODB_URI is not set. API routes that touch MongoDB will fail.");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri!).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri!).connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export type PostKind = "text" | "image" | "video" | "youtube" | "link" | "mixed";

export interface PostMedia {
  kind: "image" | "video" | "youtube" | "link";
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  durationSec?: number;
}

export interface PostDoc {
  _id?: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  caption: string;
  kind: PostKind;
  media: PostMedia[];
  accent: string;
  span: "sm" | "md" | "lg" | "xl";
  likes: number;
  createdAt: Date;
}
