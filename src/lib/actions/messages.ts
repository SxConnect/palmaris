"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";

/** Marca a mensagem como já respondida (ou desfaz). */
export async function toggleMessageHandled(id: string) {
  await requireAdmin();
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) return;

  await prisma.contactMessage.update({
    where: { id },
    data: { handled: !message.handled },
  });

  revalidatePath("/admin/mensagens");
}

/** Exclui a mensagem. */
export async function deleteMessage(id: string) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/mensagens");
}
