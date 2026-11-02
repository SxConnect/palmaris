"use client";

import { useActionState } from "react";

import { deleteUser } from "@/lib/actions/users";

/** Botão de exclusão de usuário (com confirmação). */
export default function DeleteUserButton({
  id,
  email,
  disabled,
}: {
  id: string;
  email: string;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(deleteUser, null);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="btn btn-danger text-xs"
        disabled={disabled || pending}
        title={
          disabled
            ? "Somente o dono do site pode excluir usuários (e a conta principal nunca é excluída)."
            : `Excluir ${email}`
        }
        onClick={(event) => {
          if (!window.confirm(`Excluir o acesso de ${email}?`)) {
            event.preventDefault();
          }
        }}
      >
        {pending ? "…" : "Excluir"}
      </button>
      {state?.error ? <p className="mt-1 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
