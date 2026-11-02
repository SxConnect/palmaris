import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, destroyCurrentSession } from "@/lib/auth/session";

/**
 * Exige um usuário autenticado e ativo (ADMIN ou USER comum).
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user || user.blocked) {
    if (user?.blocked) {
      await destroyCurrentSession();
    }
    redirect("/admin/login");
  }

  return user;
}

/**
 * Exige um administrador (ou Super Admin / Dono).
 * Usuários comuns são redirecionados para a tela de Webmail (/admin/email).
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "ADMIN" && !user.owner) {
    redirect("/admin/email");
  }

  return user;
}

/** Retorna o administrador autenticado (ou null), sem redirecionar. */
export async function getAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && !user.owner) || user.blocked) return null;
  return user;
}
