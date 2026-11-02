import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser, destroyCurrentSession } from "@/lib/auth/session";

/**
 * Exige um administrador autenticado e ativo.
 *
 * Contas **bloqueadas** são desconectadas na hora: mesmo com uma sessão
 * válida em andamento, elas não conseguem mais usar o painel.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN" || user.blocked) {
    if (user?.blocked) {
      await destroyCurrentSession();
    }
    redirect("/admin/login");
  }

  return user;
}

/** Retorna o administrador autenticado (ou null), sem redirecionar. */
export async function getAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || user.blocked) return null;
  return user;
}
