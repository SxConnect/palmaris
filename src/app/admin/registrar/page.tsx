"use client";

import { useActionState } from "react";
import Link from "next/link";

import { registerAction } from "@/lib/auth/actions";

/**
 * Cadastro de usuário.
 *
 * O e-mail precisa ser liberado pelo dono do site — e e-mails **bloqueados**
 * nunca conseguem se cadastrar, nem tentando de novo.
 */
export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, null);

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card">
        <h1 className="mb-6 text-2xl font-bold">Criar acesso</h1>
        <form action={action} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input name="name" className="input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input name="email" type="email" className="input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Senha</label>
            <input name="password" type="password" className="input" minLength={6} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Confirmar senha</label>
            <input name="confirm" type="password" className="input" minLength={6} required />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-700">{state.success}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? "Enviando..." : "Criar acesso"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/admin/login" className="text-brand-700 hover:underline">
            Já tenho acesso
          </Link>
        </div>
      </div>
    </main>
  );
}
