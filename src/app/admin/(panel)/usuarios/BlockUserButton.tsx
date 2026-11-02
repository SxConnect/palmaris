"use client";

import { useTransition } from "react";

import { toggleUserBlock } from "@/lib/actions/users";

/** Bloqueia ou desbloqueia o acesso de um usuário (somente o dono do site). */
export default function BlockUserButton({
  id,
  blocked,
  disabled,
}: {
  id: string;
  blocked: boolean;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={`btn text-xs ${blocked ? "" : "btn-danger"}`}
      disabled={disabled || pending}
      title={
        disabled
          ? "Somente o dono do site pode bloquear acessos."
          : blocked
            ? "Reabilitar o acesso"
            : "Bloquear o acesso"
      }
      onClick={() => {
        if (!blocked && !window.confirm("Bloquear o acesso deste usuário?")) return;
        startTransition(() => {
          void toggleUserBlock(id);
        });
      }}
    >
      {pending ? "…" : blocked ? "Reabilitar" : "Bloquear"}
    </button>
  );
}
