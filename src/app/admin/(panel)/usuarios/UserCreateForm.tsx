"use client";

import { useActionState } from "react";

import { createUser } from "@/lib/actions/users";

/** Formulário de cadastro de um novo usuário do painel. */
export default function UserCreateForm() {
  const [state, action, pending] = useActionState(createUser, null);

  return (
    <form action={action} className="card space-y-3">
      <h2 className="text-lg font-semibold">Cadastrar novo usuário</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Nome</label>
          <input name="name" className="input" placeholder="Nome do responsável" required />
        </div>
        <div>
          <label className="label">E-mail (login)</label>
          <input name="email" type="email" className="input" placeholder="email@exemplo.com" required />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Senha provisória</label>
          <input name="password" type="text" className="input" minLength={6} required />
          <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres.</p>
        </div>
        <div>
          <label className="label">Nível de acesso</label>
          <select name="role" className="input" defaultValue="ADMIN">
            <option value="ADMIN">Administrador — gerencia o site</option>
            <option value="USER">Usuário — somente leitura</option>
          </select>
        </div>
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-700">{state.success}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Criando…" : "Criar usuário"}
      </button>
    </form>
  );
}
