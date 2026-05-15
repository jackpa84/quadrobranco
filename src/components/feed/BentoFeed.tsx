"use client";

import { motion } from "framer-motion";
import type { PostDoc } from "@/lib/mongodb";
import { PostCard } from "@/components/feed/PostCard";

type StoredPost = PostDoc & { _id: string };

const SPAN_CLASS: Record<PostDoc["span"], string> = {
  sm: "md:col-span-3 md:row-span-2",
  md: "md:col-span-4 md:row-span-2",
  lg: "md:col-span-5 md:row-span-3",
  xl: "md:col-span-6 md:row-span-4",
};

export function BentoFeed({ posts }: { posts: StoredPost[] }) {
  return (
    <div
      className="grid auto-rows-[110px] grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-12 md:gap-4"
    >
      {posts.map((p, i) => (
        <motion.div
          key={p._id}
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4), ease: "easeOut" }}
          className={["sm:col-span-1 row-span-3", SPAN_CLASS[p.span]].join(" ")}
        >
          <PostCard post={p} />
        </motion.div>
      ))}
    </div>
  );
}
