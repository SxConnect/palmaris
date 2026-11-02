import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

/**
 * Verifica se um e-mail está bloqueado.
 *
 * Serve para impedir que uma conta bloqueada:
 *  - entre no painel;
 *  - solicite a recuperação de senha;
 *  - se cadastre novamente com o mesmo e-mail.
 */
export const isEmailBlocked = cache(async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { blocked: true },
  });
  return user?.blocked ?? false;
});

/** Dados do usuário logado (inclui as permissões). */
export type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  blocked: boolean;
  owner: boolean;
};

/** Usuário administrador autenticado (sem redirecionar). */
export async function getCurrentAdmin(): Promise<CurrentUser | null> {
  const { getCurrentUser } = await import("@/lib/auth/session");
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || user.blocked) return null;

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, blocked: true, owner: true },
  });

  return full as CurrentUser | null;
}
