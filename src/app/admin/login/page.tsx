"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction } from "@/lib/auth/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await loginAction(formData)) ?? null;
    },
    null,
  );

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card shadow-lg border-slate-200">
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/logo-palmaris.jpg"
            alt="Palmaris Representações"
            className="h-14 w-auto object-contain mb-2.5"
          />
          <h1 className="text-xl font-bold text-slate-900">Portal Palmaris</h1>
          <p className="text-xs text-slate-500">Painel administrativo e Webmail corporativo</p>
        </div>
        <form action={action} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input name="email" type="email" className="input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Senha</label>
            <input name="password" type="password" className="input" required />
          </div>
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-4 space-y-2 text-center text-sm">
          <Link href="/admin/forgot-password" className="text-blue-600 hover:underline">
            Esqueceu a senha?
          </Link>
          <p>
            <Link href="/admin/registrar" className="text-blue-600 hover:underline">
              Criar um novo acesso
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
