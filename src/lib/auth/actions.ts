"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createSession, destroyAllUserSessions } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { slugify } from "@/lib/slugify";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Credenciais inválidas." };
  }

  // Conta bloqueada: nem a senha correta libera o acesso.
  if (user.blocked) {
    return { error: "Este acesso está bloqueado. Fale com o administrador do site." };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: "Credenciais inválidas." };
  }

  await createSession(user.id);

  if (user.role === "ADMIN" || user.owner) {
    redirect("/admin");
  } else {
    redirect("/admin/email");
  }
}

export async function logoutAction() {
  const { destroyCurrentSession } = await import("@/lib/auth/session");
  await destroyCurrentSession();
  redirect("/admin/login");
}

export async function requestPasswordReset(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Informe o e-mail." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Contas bloqueadas não recuperam senha (sem token e sem e-mail).
  if (user && !user.blocked) {
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const link = `${appUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, link);
  }

  // Resposta genérica: não revela se o e-mail existe ou está bloqueado.
  return {
    success:
      "Se o e-mail estiver cadastrado e liberado, você receberá um link para redefinir a senha.",
  };
}

export async function resetPassword(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token || !password) {
    return { error: "Dados inválidos." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter ao menos 6 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As senhas não conferem." };
  }

  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
    return { error: "Link inválido ou expirado." };
  }

  // Conta bloqueada: a redefinição é ignorada.
  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user || user.blocked) {
    return { error: "Este acesso está bloqueado. Fale com o administrador do site." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  await destroyAllUserSessions(record.userId);

  redirect("/admin/login");
}

/**
 * Cadastro de um novo usuário pela página de registro.
 *
 * E-mails **bloqueados** não podem se cadastrar — o bloqueio vale mesmo para
 * quem tenta criar a conta de novo.
 */
export async function registerAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string } | null> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }
  if (!email.includes("@") || !email.includes(".")) {
    return { error: "Informe um e-mail válido." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter ao menos 6 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As senhas não conferem." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.blocked) {
    return { error: "Este e-mail está bloqueado e não pode ser cadastrado." };
  }
  if (existing) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "USER" },
  });

  return {
    success:
      "Cadastro realizado. O acesso ao painel é liberado pelo administrador do site.",
  };
}
