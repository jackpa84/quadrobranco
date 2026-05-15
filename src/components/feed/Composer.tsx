"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Film, Image as ImageIcon, Link2, Loader2, PlayCircle, Type, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, detectUrlKind, extractYouTubeId } from "@/lib/utils";
import type { PostDoc, PostMedia } from "@/lib/mongodb";

type StoredPost = PostDoc & { _id: string };
const MAX_VIDEO_SECONDS = 120;

export function Composer({
  author,
  onClose,
  onPublished,
}: {
  author: string;
  onClose: () => void;
  onPublished: (p: StoredPost) => void;
}) {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  // Paste handler — links and images
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const text = e.clipboardData?.getData("text") ?? "";
      const trimmed = text.trim();
      if (/^https?:\/\//i.test(trimmed)) {
        e.preventDefault();
        addUrl(trimmed);
        return;
      }
      const file = Array.from(e.clipboardData?.items ?? [])
        .map((it) => it.getAsFile())
        .find((f) => f && (f.type.startsWith("image/") || f.type.startsWith("video/")));
      if (file) {
        e.preventDefault();
        uploadFile(file);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addUrl(url: string) {
    const kind = detectUrlKind(url);
    const thumbnail =
      kind === "youtube" ? `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg` : undefined;
    setMedia((m) => [...m, { kind, url, thumbnail }]);
  }

  async function uploadFile(file: File) {
    setError(null);

    if (file.type.startsWith("video/")) {
      const ok = await validateVideoDuration(file);
      if (!ok) {
        setError(`Vídeo precisa ter no máximo ${MAX_VIDEO_SECONDS / 60} minutos.`);
        return;
      }
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "falha no upload");
      }
      const data = (await res.json()) as { url: string; kind: "image" | "video" };
      setMedia((m) => [...m, { kind: data.kind, url: data.url }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "falha no upload");
    } finally {
      setUploading(false);
    }
  }

  function validateVideoDuration(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        URL.revokeObjectURL(v.src);
        resolve(v.duration <= MAX_VIDEO_SECONDS + 0.5);
      };
      v.onerror = () => resolve(true);
      v.src = URL.createObjectURL(file);
    });
  }

  async function publish() {
    setError(null);
    setPublishing(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ caption, media }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "falha ao publicar");
      onPublished(data.post as StoredPost);
    } catch (e) {
      setError(e instanceof Error ? e.message : "falha ao publicar");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md md:items-center"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 60, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 60, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="relative w-full max-w-2xl glass-strong rounded-t-3xl md:rounded-3xl"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-[linear-gradient(90deg,transparent,#b48cff,#ff6ec7,#5ef0ff,transparent)]" />

          <div className="flex items-center justify-between p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-2xl bg-[linear-gradient(135deg,#b48cff,white)] text-sm font-semibold text-black">
                {author.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium">{author}</div>
                <div className="text-xs text-white/45">cole tudo. literalmente.</div>
              </div>
            </div>
            <button onClick={onClose} className="grid size-9 place-items-center rounded-2xl bg-white/5 hover:bg-white/10">
              <X className="size-4" />
            </button>
          </div>

          <div className="px-4 md:px-5">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="o que quer dizer? cole um link ou arraste algo aqui…"
              rows={3}
              className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-white/30"
              autoFocus
            />
          </div>

          {media.length > 0 && (
            <div className="px-4 pb-3 md:px-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {media.map((m, i) => (
                  <MediaPreview key={i} media={m} onRemove={() => setMedia((all) => all.filter((_, idx) => idx !== i))} />
                ))}
              </div>
            </div>
          )}

          <UrlBar onAdd={addUrl} />

          {error && (
            <div className="mx-4 mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 md:mx-5">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 p-4 md:p-5">
            <div className="flex items-center gap-2">
              <ToolButton
                onClick={() => fileRef.current?.click()}
                title="enviar imagem ou vídeo"
              >
                <Upload className="size-4" />
                <span className="hidden sm:inline">arquivo</span>
              </ToolButton>
              <ToolButton
                onClick={() => {
                  const url = prompt("URL do YouTube");
                  if (url) addUrl(url);
                }}
                title="embed do YouTube"
              >
                <PlayCircle className="size-4" />
                <span className="hidden sm:inline">youtube</span>
              </ToolButton>
              <ToolButton
                onClick={() => {
                  const url = prompt("Link");
                  if (url) addUrl(url);
                }}
                title="link"
              >
                <Link2 className="size-4" />
                <span className="hidden sm:inline">link</span>
              </ToolButton>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f);
                  e.target.value = "";
                }}
              />
              {uploading && (
                <span className="flex items-center gap-2 text-xs text-white/55">
                  <Loader2 className="size-3 animate-spin" /> enviando…
                </span>
              )}
            </div>

            <Button onClick={publish} disabled={publishing || uploading || (!caption.trim() && media.length === 0)} size="md">
              {publishing ? "publicando…" : "publicar"}
            </Button>
          </div>

          <div className="px-4 pb-4 text-[11px] text-white/35 md:px-5">
            dica: ctrl/cmd + v cola link ou imagem direto. vídeos até 2min.
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ToolButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/75 hover:bg-white/[0.08] hover:text-white"
    >
      {children}
    </button>
  );
}

function UrlBar({ onAdd }: { onAdd: (url: string) => void }) {
  const [value, setValue] = useState("");
  const Icon = !value ? Type : detectUrlKind(value) === "youtube" ? PlayCircle : detectUrlKind(value) === "video" ? Film : detectUrlKind(value) === "image" ? ImageIcon : Link2;
  return (
    <div className="px-4 pb-2 md:px-5">
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <Icon className="size-4 text-white/55" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) {
              onAdd(value.trim());
              setValue("");
            }
          }}
          placeholder="cole um link (YouTube, mp4, imagem, site…) e Enter"
          className={cn("flex-1 bg-transparent text-sm outline-none placeholder:text-white/30")}
        />
        {value && (
          <button
            onClick={() => {
              onAdd(value.trim());
              setValue("");
            }}
            className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
          >
            adicionar
          </button>
        )}
      </div>
    </div>
  );
}

function MediaPreview({ media, onRemove }: { media: PostMedia; onRemove: () => void }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      {media.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {media.kind === "video" && (
        <video src={media.url} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
      )}
      {media.kind === "youtube" && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 grid place-items-center bg-black/40">
            <PlayCircle className="size-7" />
          </div>
        </div>
      )}
      {media.kind === "link" && (
        <div className="absolute inset-0 grid place-items-center p-3 text-center text-xs text-white/75">
          <div>
            <Link2 className="mx-auto size-5" />
            <div className="mt-2 break-all">{media.url}</div>
          </div>
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-xl bg-black/60 text-white hover:bg-black/80"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
