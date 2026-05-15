import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <AuthShell
      mode="login"
      title="bem-vindo de volta"
      subtitle="cole, colecione, publique. tudo continua aqui."
    />
  );
}

export function AuthShell({
  mode,
  title,
  subtitle,
}: {
  mode: "login" | "signup";
  title: string;
  subtitle: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#b48cff]/25 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[#ff6ec7]/15 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-stretch justify-center px-6 py-12">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-white/70 hover:text-white">
          <div className="relative size-7 rounded-xl shine">
            <div className="absolute inset-0 rounded-xl bg-[conic-gradient(from_120deg,#b48cff,#ff6ec7,#5ef0ff,#b48cff)]" />
            <div className="absolute inset-[3px] rounded-[10px] bg-black/70" />
          </div>
          <span className="text-lg font-semibold tracking-tight">quadrembranco</span>
        </Link>

        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-white/55">{subtitle}</p>

        <div className="mt-8 glass-strong rounded-3xl p-6">
          <AuthForm mode={mode} />
        </div>

        <p className="mt-6 text-sm text-white/50">
          {mode === "login" ? (
            <>
              ainda não tem conta?{" "}
              <Link href="/signup" className="text-white underline-offset-4 hover:underline">criar agora</Link>
            </>
          ) : (
            <>
              já tem conta?{" "}
              <Link href="/login" className="text-white underline-offset-4 hover:underline">entrar</Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
