"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { hashPassword } from "@/lib/auth/password";
import { destroyAllUserSessions } from "@/lib/auth/session";

/**
 * Gestão de usuários do painel.
 *
 * Regras de permissão:
 *  - qualquer administrador pode **criar** usuários e redefinir a senha de
 *    um usuário comum;
 *  - somente o **dono** do site (conta principal) pode excluir usuários,
 *    alterar o nível de acesso (administrador/usuário) e bloquear ou
 *    desbloquear contas;
 *  - a conta do dono **nunca** pode ser excluída, rebaixada ou bloqueada —
 *    nem por outros administradores.
 */

type Actor = { id: string; owner: boolean };

async function getActor(): Promise<Actor> {
  const user = await requireAdmin();
  return { id: user.id, owner: user.owner };
}

export async function createUser(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  const actor = await getActor();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "ADMIN") === "ADMIN" ? "ADMIN" : "USER";

  if (!name || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }
  if (!email.includes("@") || !email.includes(".")) {
    return { error: "Informe um e-mail válido." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter ao menos 6 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.blocked) {
      return {
        error: "Este e-mail está bloqueado. Desbloqueie a conta antes de recadastrá-la.",
      };
    }
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  revalidatePath("/admin/usuarios");
  return { success: `Usuário ${name} criado com acesso de ${role === "ADMIN" ? "administrador" : "usuário"}.` };
}

export async function updateUser(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  const actor = await getActor();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "USER") === "ADMIN" ? "ADMIN" : "USER";
  const blocked = formData.get("blocked") === "on";

  if (!id || !name || !email) {
    return { error: "Preencha nome e e-mail." };
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { error: "Usuário não encontrado." };

  // A conta do dono só pode ser alterada por ele mesmo.
  if (target.owner && actor.id !== target.id) {
    return { error: "A conta principal do site só pode ser alterada pelo próprio dono." };
  }

  const changingRole = target.role !== role;
  const changingBlock = target.blocked !== blocked;

  if ((changingRole || changingBlock) && !actor.owner) {
    return {
      error: "Somente o dono do site pode alterar o nível de acesso ou bloquear contas.",
    };
  }

  // O dono não pode rebaixar nem bloquear a própria conta (evita ficar sem acesso).
  if (target.owner && (changingRole || changingBlock)) {
    return { error: "A conta principal não pode perder o acesso de administrador." };
  }

  if (email !== target.email) {
    const conflict = await prisma.user.findUnique({ where: { email } });
    if (conflict) {
      return { error: "Já existe outra conta com este e-mail." };
    }
  }

  const data: {
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    blocked: boolean;
    passwordHash?: string;
  } = { name, email, role, blocked };

  if (password) {
    if (password.length < 6) {
      return { error: "A senha deve ter ao menos 6 caracteres." };
    }
    // A senha do dono só é trocada pelo próprio dono.
    if (target.owner && actor.id !== target.id) {
      return { error: "A senha da conta principal só pode ser trocada pelo próprio dono." };
    }
    data.passwordHash = await hashPassword(password);
  }

  await prisma.user.update({ where: { id }, data });

  // Conta bloqueada ou rebaixada perde as sessões abertas.
  if (blocked || changingRole) {
    await destroyAllUserSessions(id);
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  return { success: "Usuário atualizado." };
}

/** Exclui um usuário (somente o dono do site). */
export async function deleteUser(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  const actor = await getActor();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Usuário não informado." };

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { error: "Usuário não encontrado." };

  if (target.owner) {
    return { error: "A conta principal do site não pode ser excluída." };
  }

  if (!actor.owner) {
    return { error: "Somente o dono do site pode excluir usuários." };
  }

  await destroyAllUserSessions(id);
  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  return { success: `Usuário ${target.email} excluído.` };
}

/** Bloqueia ou desbloqueia um acesso (somente o dono do site). */
export async function toggleUserBlock(id: string) {
  const actor = await getActor();

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;

  if (target.owner) {
    return;
  }
  if (!actor.owner) {
    return;
  }

  const blocked = !target.blocked;
  await prisma.user.update({ where: { id }, data: { blocked } });
  if (blocked) await destroyAllUserSessions(id);

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}
