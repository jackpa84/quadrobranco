import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { createClient } from "@/lib/supabase/server";
import { getDb, type PostDoc } from "@/lib/mongodb";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "id" }, { status: 400 });

  const db = await getDb();
  const result = await db
    .collection<PostDoc>("posts")
    .findOneAndUpdate(
      { _id: new ObjectId(id) as unknown as string },
      { $inc: { likes: 1 } },
      { returnDocument: "after" },
    );
  return NextResponse.json({ likes: result?.likes ?? 0 });
}
