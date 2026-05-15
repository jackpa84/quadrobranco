# Lume

Feed visual em mosaico bento onde você cola **qualquer coisa** — vídeo de até 2 minutos, embed do YouTube, imagem, link, texto. Pensado para ser mais ousado visualmente que o Instagram.

Stack: **Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase Auth + Storage · MongoDB · Framer Motion · Vercel**.

## 1. Pré-requisitos

- Node.js 20+
- Conta [Supabase](https://supabase.com) (auth + storage)
- Cluster MongoDB Atlas (ou Neon Postgres trocando o driver, mas o app já vem com Mongo)
- Conta [Vercel](https://vercel.com) para deploy

## 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=media

MONGODB_URI=
MONGODB_DB=annotations
```

## 3. Supabase — setup rápido

1. Crie um projeto Supabase.
2. Em **Authentication → Providers**, mantenha Email + Password ligado.
3. Em **Storage**, crie um bucket **público** chamado `media`.
4. Cole as keys em `.env.local`.

## 4. MongoDB — setup rápido

1. Crie um cluster gratuito no MongoDB Atlas.
2. Em **Network Access**, libere `0.0.0.0/0` (ou só os IPs da Vercel).
3. Crie um usuário e copie a connection string (`mongodb+srv://…`).
4. Cole em `MONGODB_URI`. O banco padrão é `annotations`.

## 5. Rodar local

```
npm install
npm run dev
```

Abra http://localhost:3000.

## 6. Deploy na Vercel

```
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add MONGODB_URI
npx vercel env add MONGODB_DB
npx vercel --prod
```

Ou conecte o repo no dashboard da Vercel — o framework é detectado automaticamente (Next.js).

## 7. Estrutura

```
src/
  app/
    page.tsx              landing
    login/, signup/       auth
    auth/                 callback + signout
    feed/                 feed protegido
    api/
      posts/              GET/POST + /[id]/like
      upload/             upload p/ Supabase Storage
  components/
    auth/AuthForm.tsx
    feed/FeedShell.tsx
    feed/BentoFeed.tsx
    feed/PostCard.tsx
    feed/Composer.tsx     o coração: cola tudo aqui
    ui/Button.tsx
  lib/
    supabase/             client / server / middleware
    mongodb.ts            driver + tipos
    utils.ts
  middleware.ts           protege rotas
```

## 8. Como funciona o "cole qualquer coisa"

O `Composer` (`src/components/feed/Composer.tsx`):

- **Cmd/Ctrl + V** detecta link ou imagem do clipboard.
- Botões para upload de **imagem ou vídeo** (≤ 80 MB, vídeo ≤ 120s validado no client).
- Barra de URL detecta automaticamente o tipo: YouTube → embed iframe, `.mp4`/`.webm` → player nativo, imagem → `<img>`, qualquer outra coisa → card de link.
- Você pode anexar até 6 mídias por post.

Posts são gravados no MongoDB com um `span` (sm/md/lg/xl) e um `accent` (cor) — o `BentoFeed` usa isso para montar o mosaico irregular.
