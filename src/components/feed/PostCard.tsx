"use client";

import { useState } from "react";
import { Heart, Link2, MessageCircle, Share2 } from "lucide-react";
import type { PostDoc } from "@/lib/mongodb";
import { cn, extractYouTubeId, timeAgo } from "@/lib/utils";

type StoredPost = PostDoc & { _id: string };

export function PostCard({ post }: { post: StoredPost }) {
  const media = post.media[0];
  return (
    <article className="group relative h-full overflow-hidden rounded-3xl glass-strong">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 transition-opacity group-hover:opacity-80"
        style={{
          background: `radial-gradient(120% 80% at 0% 0%, ${post.accent}33, transparent 50%)`,
        }}
      />
      <div className="relative flex h-full flex-col">
        <Header post={post} />
        <div className="flex-1 min-h-0">
          <Body post={post} media={media} />
        </div>
        <Footer post={post} />
      </div>
    </article>
  );
}

function Header({ post }: { post: StoredPost }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4">
      <div
        className="grid size-8 place-items-center rounded-xl text-xs font-semibold text-black"
        style={{ background: `linear-gradient(135deg, ${post.accent}, white)` }}
      >
        {post.authorName.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{post.authorName}</div>
        <div className="text-xs text-white/45">{timeAgo(post.createdAt)} atrás</div>
      </div>
      <span
        className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60"
      >
        {post.kind}
      </span>
    </div>
  );
}

function Body({ post, media }: { post: StoredPost; media?: PostDoc["media"][number] }) {
  if (!media) {
    return (
      <div className="px-4 py-5">
        <p className="text-lg leading-snug">{post.caption}</p>
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <div className="relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {post.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-sm leading-snug">{post.caption}</p>
          </div>
        )}
      </div>
    );
  }

  if (media.kind === "video") {
    return (
      <div className="relative h-full w-full bg-black">
        <video
          src={media.url}
          className="absolute inset-0 h-full w-full object-cover"
          controls
          preload="metadata"
          playsInline
        />
      </div>
    );
  }

  if (media.kind === "youtube") {
    const id = extractYouTubeId(media.url);
    return (
      <div className="relative h-full w-full bg-black">
        {id ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${id}?rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="youtube"
          />
        ) : (
          <a className="grid h-full place-items-center text-sm text-white/60" href={media.url} target="_blank" rel="noreferrer">
            abrir no YouTube
          </a>
        )}
      </div>
    );
  }

  // link
  return (
    <a
      href={media.url}
      target="_blank"
      rel="noreferrer"
      className="block h-full px-4 py-5"
    >
      <div className={cn(
        "h-full rounded-2xl border border-white/10 p-4",
        "bg-gradient-to-br from-white/[0.04] to-transparent"
      )}>
        <div className="flex items-center gap-2 text-xs text-white/55">
          <Link2 className="size-3.5" />
          <span className="truncate">{new URL(media.url).hostname}</span>
        </div>
        {post.caption && (
          <p className="mt-3 line-clamp-4 text-base leading-snug">{post.caption}</p>
        )}
        <div className="mt-3 truncate text-sm text-white/55 underline-offset-2">
          {media.url}
        </div>
      </div>
    </a>
  );
}

function Footer({ post }: { post: StoredPost }) {
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [liked, setLiked] = useState(false);

  async function like() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: "POST" });
      const data = await res.json();
      if (typeof data.likes === "number") setLikes(data.likes);
    } catch {
      // ignore
    }
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "lume", text: post.caption, url });
      } else {
        await navigator.clipboard?.writeText(url);
      }
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-white/65">
      <button
        onClick={like}
        className={cn(
          "flex items-center gap-1.5 text-sm transition hover:text-white",
          liked && "text-[#ff6ec7]"
        )}
      >
        <Heart className={cn("size-4", liked && "fill-current")} />
        {likes}
      </button>
      <button className="flex items-center gap-1.5 text-sm transition hover:text-white">
        <MessageCircle className="size-4" />
        0
      </button>
      <button onClick={share} className="flex items-center gap-1.5 text-sm transition hover:text-white">
        <Share2 className="size-4" />
      </button>
    </div>
  );
}
