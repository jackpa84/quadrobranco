import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb, type PostDoc, type PostKind, type PostMedia } from "@/lib/mongodb";

const ACCENTS = ["#b48cff", "#ff6ec7", "#5ef0ff", "#c8ff5e", "#ffb15e"];
const SPANS: PostDoc["span"][] = ["sm", "md", "lg", "xl"];

export async function GET() {
  try {
    const db = await getDb();
    const posts = await db
      .collection<PostDoc>("posts")
      .find({})
      .sort({ createdAt: -1 })
      .limit(80)
      .toArray();

    return NextResponse.json({
      posts: posts.map((p) => ({ ...p, _id: String(p._id) })),
    });
  } catch (err) {
    return NextResponse.json(
      { posts: [], error: err instanceof Error ? err.message : "db error" },
      { status: 200 },
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    caption?: string;
    media?: PostMedia[];
    kind?: PostKind;
  };

  const caption = (body.caption || "").slice(0, 600);
  const media = Array.isArray(body.media) ? body.media.slice(0, 6) : [];
  if (!caption.trim() && media.length === 0) {
    return NextResponse.json({ error: "post vazio" }, { status: 400 });
  }

  let kind: PostKind = body.kind ?? "text";
  if (media.length > 1) kind = "mixed";
  else if (media.length === 1) kind = media[0].kind as PostKind;
  else kind = "text";

  const span =
    kind === "text" ? "md" :
    kind === "youtube" ? "lg" :
    kind === "video" ? "xl" :
    kind === "image" ? SPANS[Math.floor(Math.random() * 3) + 1] :
    "md";

  const accent = ACCENTS[Math.floor(Math.random() * ACCENTS.length)];

  const doc: PostDoc = {
    userId: user.id,
    authorName:
      (user.user_metadata?.name as string) ||
      (user.email?.split("@")[0] ?? "anônimo"),
    authorAvatar: user.user_metadata?.avatar_url as string | undefined,
    caption,
    kind,
    media,
    accent,
    span,
    likes: 0,
    createdAt: new Date(),
  };

  const db = await getDb();
  const { insertedId } = await db.collection<PostDoc>("posts").insertOne(doc);
  return NextResponse.json({ post: { ...doc, _id: String(insertedId) } });
}
