"use client";

import { useActionState } from "react";

import { updateUser } from "@/lib/actions/users";

export type UserItem = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  blocked: boolean;
  owner: boolean;
  createdAt: string;
};

/** Formulário de edição de um usuário. */
export default function EditUserForm({
  user,
  canManageAccess,
}: {
  user: UserItem;
  /** Só o dono do site altera nível de acesso e bloqueios. */
  canManageAccess: boolean;
}) {
  const [state, action, pending] = useActionState(updateUser, null);

  return (
    <form action={action} className="card space-y-3">
      <input type="hidden" name="id" value={user.id} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Nome</label>
          <input name="name" className="input" defaultValue={user.name ?? ""} required />
        </div>
        <div>
          <label className="label">E-mail (login)</label>
          <input name="email" type="email" className="input" defaultValue={user.email} required />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Nova senha (deixe em branco para manter)</label>
          <input name="password" type="text" className="input" minLength={6} />
        </div>
        <div>
          <label className="label">Nível de acesso</label>
          <select
            name="role"
            className="input"
            defaultValue={user.role}
            disabled={!canManageAccess || user.owner}
          >
            <option value="ADMIN">Administrador — Acesso total ao site, CMS e Webmail</option>
            <option value="USER">Usuário comum — Acesso restrito apenas ao Webmail</option>
          </select>
          {!canManageAccess && !user.owner ? (
            <p className="mt-1 text-xs text-gray-500">
              Somente o dono do site altera o nível de acesso.
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          name="blocked"
          type="checkbox"
          id={`blocked-${user.id}`}
          defaultChecked={user.blocked}
          disabled={!canManageAccess || user.owner}
        />
        <label htmlFor={`blocked-${user.id}`} className="text-sm">
          Acesso bloqueado (não entra, não recupera senha, não se cadastra de novo)
        </label>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-700">{state.success}</p> : null}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Salvando…" : "Salvar usuário"}
      </button>
    </form>
  );
}
