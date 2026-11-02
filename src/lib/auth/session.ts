import "server-only";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

import { generateToken, hashToken } from "./tokens";

export const SESSION_COOKIE = "almzo_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  /** Conta bloqueada pelo dono do site. */
  blocked: boolean;
  /** Conta principal (não pode ser apagada nem rebaixada). */
  owner: boolean;
};

type SessionMeta = {
  userAgent?: string | null;
  ip?: string | null;
};

export async function createSessionRecord(
  userId: string,
  meta: SessionMeta = {},
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
    },
  });

  return { token, expiresAt };
}

export async function createSession(
  userId: string,
  meta: SessionMeta = {},
): Promise<void> {
  const { token, expiresAt } = await createSessionRecord(userId, meta);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getUserBySessionToken(
  token: string,
): Promise<SessionUser | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          blocked: true,
          owner: true,
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return session.user;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return getUserBySessionToken(token);
}

export async function destroyCurrentSession(): Promise<void> {
  const token = await getSessionToken();

  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => undefined);
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
