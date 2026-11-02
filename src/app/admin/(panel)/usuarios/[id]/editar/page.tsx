import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/users";

import EditUserForm, { type UserItem } from "./EditUserForm";

export const dynamic = "force-dynamic";

/** Edição de um usuário do painel. */
export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, actor] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    getCurrentAdmin(),
  ]);
  if (!user) notFound();

  const item: UserItem = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    blocked: user.blocked,
    owner: user.owner,
    createdAt: user.createdAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar usuário</h1>
        <Link href="/admin/usuarios" className="text-brand-700 hover:underline">
          ← Voltar
        </Link>
      </div>

      {user.owner ? (
        <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Esta é a <strong>conta principal do site</strong>. Ela não pode ser excluída nem perder
          o acesso de administrador — nem por outros administradores.
        </div>
      ) : null}

      <EditUserForm user={item} canManageAccess={Boolean(actor?.owner)} />
    </div>
  );
}
