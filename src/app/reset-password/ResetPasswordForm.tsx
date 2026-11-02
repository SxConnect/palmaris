"use client";

import { useActionState } from "react";
import Link from "next/link";

import { resetPassword } from "@/lib/auth/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="mb-1 block text-sm font-medium">Nova senha</label>
        <input name="password" type="password" className="input" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Confirmar senha</label>
        <input name="confirm" type="password" className="input" required />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Salvando..." : "Redefinir senha"}
      </button>
      <div className="text-sm">
        <Link href="/admin/login" className="text-blue-600 hover:underline">
          Voltar ao login
        </Link>
      </div>
    </form>
  );
}
