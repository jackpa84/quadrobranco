"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { LogOut, Plus, Search, Sparkles } from "lucide-react";
import type { PostDoc } from "@/lib/mongodb";
import { Button } from "@/components/ui/Button";
import { Composer } from "@/components/feed/Composer";
import { BentoFeed } from "@/components/feed/BentoFeed";

type StoredPost = PostDoc & { _id: string };

export function FeedShell({
  currentUser,
  initialPosts,
}: {
  currentUser: { id: string; name: string; email: string };
  initialPosts: StoredPost[];
}) {
  const [posts, setPosts] = useState<StoredPost[]>(initialPosts);
  const [composerOpen, setComposerOpen] = useState(false);
  const [filter, setFilter] = useState<"todos" | "video" | "youtube" | "image" | "text" | "link">("todos");

  const onPublished = useCallback((p: StoredPost) => {
    setPosts((prev) => [p, ...prev]);
    setComposerOpen(false);
  }, []);

  const filtered = filter === "todos"
    ? posts
    : posts.filter((p) => p.kind === filter || p.media.some((m) => m.kind === filter));

  return (
    <main className="relative min-h-screen pb-32">
      <div className="absolute -top-20 -left-20 h-[360px] w-[360px] rounded-full bg-[#b48cff]/15 blur-3xl" />
      <div className="absolute top-40 right-0 h-[360px] w-[360px] rounded-full bg-[#ff6ec7]/10 blur-3xl" />

      <header className="sticky top-0 z-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#07060d] via-[#07060d]/80 to-transparent" />
          <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 md:px-6">
            <Link href="/feed" className="flex items-center gap-2">
              <div className="relative size-8 rounded-2xl shine">
                <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_120deg,#b48cff,#ff6ec7,#5ef0ff,#b48cff)]" />
                <div className="absolute inset-[3px] rounded-[12px] bg-black/70" />
              </div>
              <span className="hidden text-lg font-semibold tracking-tight sm:inline">quadrembranco</span>
            </Link>

            <div className="ml-2 flex-1 max-w-md">
              <div className="glass flex h-10 items-center gap-2 rounded-full px-4 text-sm text-white/55">
                <Search className="size-4" />
                <span className="hidden sm:inline">buscar pessoas, tags, links…</span>
                <span className="sm:hidden">buscar</span>
              </div>
            </div>

            <Button size="sm" onClick={() => setComposerOpen(true)} className="gap-2">
              <Plus className="size-4" />
              <span className="hidden sm:inline">colar</span>
            </Button>

            <Profile name={currentUser.name} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-4 md:px-6">
          <FilterPills value={filter} onChange={setFilter} />
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 md:px-6">
        {filtered.length === 0 ? (
          <Empty onPublish={() => setComposerOpen(true)} />
        ) : (
          <BentoFeed posts={filtered} />
        )}
      </section>

      <button
        onClick={() => setComposerOpen(true)}
        className="fixed bottom-6 right-6 z-30 grid size-14 place-items-center rounded-2xl bg-[linear-gradient(120deg,#b48cff,#ff6ec7,#5ef0ff)] text-black shadow-[0_18px_50px_-12px_rgba(180,140,255,0.7)] transition active:scale-95 md:size-16"
        aria-label="colar"
      >
        <Plus className="size-7" />
      </button>

      {composerOpen && (
        <Composer
          author={currentUser.name}
          onClose={() => setComposerOpen(false)}
          onPublished={onPublished}
        />
      )}
    </main>
  );
}

function Profile({ name }: { name: string }) {
  return (
    <form action="/auth/signout" method="post" className="flex items-center gap-2">
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-xs text-white/40">olá</span>
        <span className="text-sm">{name}</span>
      </div>
      <div className="glass size-10 rounded-2xl grid place-items-center text-sm font-medium">
        {name.slice(0, 1).toUpperCase()}
      </div>
      <button
        type="submit"
        className="glass grid size-10 place-items-center rounded-2xl text-white/60 hover:text-white"
        aria-label="sair"
      >
        <LogOut className="size-4" />
      </button>
    </form>
  );
}

function FilterPills({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "todos" | "video" | "youtube" | "image" | "text" | "link") => void;
}) {
  const items: { key: typeof value; label: string }[] = [
    { key: "todos", label: "tudo" },
    { key: "video", label: "vídeos" },
    { key: "youtube", label: "youtube" },
    { key: "image", label: "imagens" },
    { key: "text", label: "textos" },
    { key: "link", label: "links" },
  ];
  return (
    <div className="scroll-hide -mx-2 flex gap-2 overflow-x-auto px-2">
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key as "todos" | "video" | "youtube" | "image" | "text" | "link")}
            className={[
              "shrink-0 rounded-full border px-4 py-1.5 text-sm transition",
              active
                ? "border-white/20 bg-white text-black"
                : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07]",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function Empty({ onPublish }: { onPublish: () => void }) {
  return (
    <div className="glass-strong relative mt-8 overflow-hidden rounded-3xl p-10 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,140,255,0.18),transparent_60%)]" />
      <div className="relative">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/5">
          <Sparkles className="size-6" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold">o feed começa com você</h2>
        <p className="mx-auto mt-2 max-w-md text-white/55">
          cole um link do YouTube, arraste um vídeo de até 2 minutos, jogue uma
          imagem ou só um pensamento. tudo vira mosaico.
        </p>
        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={onPublish}>colar a primeira coisa</Button>
        </div>
      </div>
    </div>
  );
}
