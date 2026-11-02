import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/users";

import BlockUserButton from "./BlockUserButton";
import DeleteUserButton from "./DeleteUserButton";
import UserCreateForm from "./UserCreateForm";

export const dynamic = "force-dynamic";

/**
 * Gestão de usuários do painel.
 *
 * O dono do site (conta principal) pode criar usuários, excluir acessos e
 * bloquear/reabilitar contas. Ninguém consegue apagar a conta principal.
 */
export default async function UsersPage() {
  const [users, actor] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getCurrentAdmin(),
  ]);

  const isOwner = Boolean(actor?.owner);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="mt-1 text-sm text-gray-600">
          Usuários com acesso ao painel do site. Você está conectado como{" "}
          <strong>{actor?.email}</strong>
          {isOwner ? " (dono do site)" : ""}.
        </p>
      </div>

      <div className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
        <p>
          <strong>Dono do site:</strong> pode excluir usuários, mudar o nível de acesso e
          bloquear contas. A conta principal nunca pode ser excluída nem bloqueada — inclusive
          por outros administradores.
        </p>
        <p className="mt-1">
          <strong>Contas bloqueadas:</strong> não entram no painel, não recuperam senha e não
          conseguem se cadastrar novamente com o mesmo e-mail.
        </p>
      </div>

      <div className="card space-y-2">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum usuário cadastrado.</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
            >
              <div>
                <p className="font-semibold">
                  {user.name ?? user.email}
                  {user.owner ? (
                    <span className="ml-2 rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                      dono do site
                    </span>
                  ) : null}
                  {user.blocked ? (
                    <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      bloqueado
                    </span>
                  ) : null}
                  {user.role === "ADMIN" ? (
                    <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      administrador
                    </span>
                  ) : (
                    <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                      usuário
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email} · criado em{" "}
                  {user.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/usuarios/${user.id}/editar`} className="btn text-xs">
                  Editar
                </Link>
                <BlockUserButton
                  id={user.id}
                  blocked={user.blocked}
                  disabled={!isOwner || user.owner}
                />
                <DeleteUserButton
                  id={user.id}
                  email={user.email}
                  disabled={!isOwner || user.owner}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <UserCreateForm />
    </div>
  );
}
