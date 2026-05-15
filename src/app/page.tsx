import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

export default async function Landing() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/feed");
  } catch {
    // Supabase env not configured yet — continue to show landing
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quadrobranco.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "quadrobranco",
    url: siteUrl,
    description:
      "Feed visual em mosaico onde você cola qualquer coisa: vídeo, link, YouTube, imagem, texto.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-[#b48cff]/20 blur-3xl" />
      <div className="absolute -top-20 right-0 h-[420px] w-[420px] rounded-full bg-[#ff6ec7]/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-[#5ef0ff]/15 blur-3xl" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-semibold tracking-tight">quadrobranco</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Criar conta</Button>
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pt-12 pb-24 md:grid-cols-2 md:items-center md:pt-24">
        <div>
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-white/70">
            <span className="size-2 rounded-full bg-[#c8ff5e] pulse-ring" />
            beta aberto · feed visual sem fronteiras
          </div>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            o seu{" "}
            <span className="bg-[linear-gradient(120deg,#b48cff,#ff6ec7,#5ef0ff)] bg-clip-text text-transparent">
              quadro em branco
            </span>
            .
            <br />
            cole o que quiser.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/60">
            Vídeo de até 2 minutos, link, embed do YouTube, imagem, texto ou uma
            colagem inteira. Um feed em mosaico vivo que vai além do que o
            Instagram te deixa fazer.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button size="lg">Começar agora</Button>
            </Link>
            <Link href="/feed">
              <Button variant="glass" size="lg">Ver o feed</Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40">
            <span>↳ vídeo até 120s</span>
            <span>↳ YouTube · TikTok · Vimeo</span>
            <span>↳ imagem · texto · link</span>
          </div>
        </div>

        <div className="relative">
          <PreviewMosaic />
        </div>
      </section>
    </main>
  );
}

function Logo() {
  return (
    <div className="relative size-8 rounded-2xl shine">
      <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_120deg,#b48cff,#ff6ec7,#5ef0ff,#b48cff)]" />
      <div className="absolute inset-[3px] rounded-[12px] bg-black/70 backdrop-blur" />
    </div>
  );
}

function PreviewMosaic() {
  return (
    <div className="grid grid-cols-6 gap-3 [perspective:1200px]">
      <div className="col-span-3 row-span-2 aspect-[4/5] glass-strong rounded-3xl p-3 noise relative overflow-hidden float">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#b48cff_0%,#ff6ec7_60%,#1b1230_100%)] opacity-90" />
        <div className="relative h-full w-full rounded-2xl border border-white/15 flex items-end p-4">
          <div className="text-sm font-medium">Sunset run · 1:42</div>
        </div>
      </div>
      <div className="col-span-3 aspect-[4/3] glass-strong rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#5ef0ff,transparent_60%),linear-gradient(160deg,#0a0617,#221346)]" />
        <div className="relative h-full w-full p-4 flex flex-col justify-between">
          <div className="text-xs text-white/70">▶ youtube</div>
          <div className="text-base font-medium leading-tight">
            “A internet quer voltar a ser estranha.”
          </div>
        </div>
      </div>
      <div className="col-span-3 aspect-square glass-strong rounded-3xl overflow-hidden relative float" style={{ animationDelay: "1s" }}>
        <div className="absolute inset-0 bg-[conic-gradient(from_220deg,#c8ff5e,#5ef0ff,#b48cff,#c8ff5e)] opacity-60" />
        <div className="relative h-full w-full p-4 flex items-end">
          <div className="text-sm">link · figma.com/lume-system</div>
        </div>
      </div>
      <div className="col-span-6 glass-strong rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(180,140,255,.15),transparent)]" />
        <div className="relative">
          <div className="text-xs text-white/50">nota colada · agora</div>
          <p className="mt-2 text-lg leading-snug">
            “Vivo colando coisas em chats. Queria um lugar onde isso virasse um
            feed visual de verdade.”
          </p>
        </div>
      </div>
    </div>
  );
}
