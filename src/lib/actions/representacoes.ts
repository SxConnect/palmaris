"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";

export type RepresentacaoItem = {
  id: string; nome: string; slug: string; logoUrl: string | null;
  descricao: string | null; segmento: string | null; site: string | null;
  emailContato: string | null; telefone: string | null; responsavel: string | null;
  status: string; observacoes: string | null;
  produtosCount: number; clientesCount: number;
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function listRepresentacoesAction(): Promise<RepresentacaoItem[]> {
  await requireAdmin();
  const reps = await prisma.representacao.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { produtos: true, clientes: true } } },
  });
  return reps.map((r) => ({
    id: r.id, nome: r.nome, slug: r.slug, logoUrl: r.logoUrl,
    descricao: r.descricao, segmento: r.segmento, site: r.site,
    emailContato: r.emailContato, telefone: r.telefone, responsavel: r.responsavel,
    status: r.status, observacoes: r.observacoes,
    produtosCount: r._count.produtos, clientesCount: r._count.clientes,
  }));
}

export async function getRepresentacaoAction(id: string) {
  await requireAdmin();
  return prisma.representacao.findUnique({
    where: { id },
    include: {
      produtos: { orderBy: [{ destaque: "desc" }, { ordem: "asc" }] },
      clientes: {
        include: { cliente: { select: { id: true, nome: true, empresa: true, email: true, telefone: true } } },
        orderBy: { criadoEm: "desc" },
      },
    },
  });
}

export async function saveRepresentacaoAction(id: string | null, dados: Record<string, string>) {
  await requireAdmin();
  const nome = (dados.nome || "").trim();
  if (!nome) return { error: "Informe o nome." };
  const payload = {
    nome,
    slug: dados.slug?.trim() || slugify(nome),
    logoUrl: dados.logoUrl?.trim() || null,
    descricao: dados.descricao?.trim() || null,
    segmento: dados.segmento?.trim() || null,
    site: dados.site?.trim() || null,
    emailContato: dados.emailContato?.trim() || null,
    telefone: dados.telefone?.trim() || null,
    responsavel: dados.responsavel?.trim() || null,
    status: dados.status?.trim() || "ativa",
    observacoes: dados.observacoes?.trim() || null,
  };
  if (id) {
    await prisma.representacao.update({ where: { id }, data: payload });
    revalidatePath("/admin/representacoes");
    return { success: "Representação atualizada." };
  }
  await prisma.representacao.create({ data: payload });
  revalidatePath("/admin/representacoes");
  return { success: "Representação criada." };
}

export async function deleteRepresentacaoAction(id: string): Promise<{ success?: string; error?: string }> {
  await requireAdmin();
  await prisma.representacao.delete({ where: { id } });
  revalidatePath("/admin/representacoes");
  return { success: "Representação removida." };
}

/* ---------- PRODUTOS ---------- */

export async function saveProdutoAction(id: string | null, representacaoId: string, dados: {
  nome: string; descricao?: string; categoria?: string; imagens?: string[]; destaque?: boolean; ordem?: number;
}) {
  await requireAdmin();
  if (!dados.nome?.trim()) return { error: "Informe o nome do produto." };
  const payload = {
    nome: dados.nome.trim(),
    descricao: dados.descricao?.trim() || null,
    categoria: dados.categoria?.trim() || null,
    imagens: JSON.stringify((dados.imagens || []).slice(0, 6)),
    destaque: !!dados.destaque,
    ordem: dados.ordem || 0,
  };
  if (id) {
    await prisma.produto.update({ where: { id }, data: payload });
  } else {
    await prisma.produto.create({ data: { ...payload, representacaoId } });
  }
  revalidatePath("/admin/representacoes");
  return { success: "Produto salvo." };
}

export async function deleteProdutoAction(id: string) {
  await requireAdmin();
  await prisma.produto.delete({ where: { id } });
  revalidatePath("/admin/representacoes");
  return { success: "Produto removido." };
}

/* ---------- VINCULO CLIENTE <-> REPRESENTACAO ---------- */

export async function listVinculosAction(clienteId: string) {
  await requireAdmin();
  const vinculos = await prisma.clienteRepresentacao.findMany({
    where: { clienteId },
    include: { representacao: { select: { id: true, nome: true, slug: true } } },
    orderBy: { criadoEm: "desc" },
  });
  return vinculos.map((v) => ({
    id: v.id, representacaoId: v.representacaoId,
    nome: v.representacao.nome, status: v.status,
    responsavel: v.responsavel, observacoes: v.observacoes,
  }));
}

export async function toggleVinculoAction(clienteId: string, representacaoId: string) {
  await requireAdmin();
  const existente = await prisma.clienteRepresentacao.findUnique({
    where: { clienteId_representacaoId: { clienteId, representacaoId } },
  });
  if (existente) {
    await prisma.clienteRepresentacao.delete({ where: { id: existente.id } });
    revalidatePath("/admin/clientes");
    return { success: "Vínculo removido." };
  }
  await prisma.clienteRepresentacao.create({ data: { clienteId, representacaoId } });
  revalidatePath("/admin/clientes");
  return { success: "Vínculo adicionado." };
}

export async function updateVinculoAction(id: string, dados: { status?: string; responsavel?: string; observacoes?: string }) {
  await requireAdmin();
  await prisma.clienteRepresentacao.update({ where: { id }, data: dados });
  revalidatePath("/admin/clientes");
  return { success: "Vínculo atualizado." };
}
