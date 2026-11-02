"use client";

import { useActionState } from "react";
import Link from "next/link";

import { requestPasswordReset } from "@/lib/auth/actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card">
        <h1 className="mb-6 text-2xl font-bold">Esqueceu a senha</h1>
        <form action={action} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input name="email" type="email" className="input" required />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? "Enviando..." : "Enviar link"}
          </button>
        </form>
        <div className="mt-4 text-sm">
          <Link href="/admin/login" className="text-blue-600 hover:underline">
            Voltar ao login
          </Link>
        </div>
      </div>
    </main>
  );
}
