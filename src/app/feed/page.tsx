import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDb, type PostDoc } from "@/lib/mongodb";
import { FeedShell } from "@/components/feed/FeedShell";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let initialPosts: (PostDoc & { _id: string })[] = [];
  try {
    const db = await getDb();
    const raw = await db
      .collection<PostDoc>("posts")
      .find({})
      .sort({ createdAt: -1 })
      .limit(60)
      .toArray();
    initialPosts = raw.map((p) => ({
      ...p,
      _id: String(p._id),
      createdAt: p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt),
    }));
  } catch {
    // empty mongo or not configured
  }

  return (
    <FeedShell
      currentUser={{
        id: user.id,
        name: (user.user_metadata?.name as string) || user.email?.split("@")[0] || "você",
        email: user.email ?? "",
      }}
      initialPosts={initialPosts}
    />
  );
}
