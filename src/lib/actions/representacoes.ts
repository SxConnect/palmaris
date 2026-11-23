"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guard";

export type RepresentacaoItem = {
  id: string; nome: string; slug: string; razaoSocial: string | null; endereco: string | null; logoUrl: string | null;
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
  await requireAuth();
  const reps = await prisma.representacao.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { produtos: true, clientes: true } } },
  });
  return reps.map((r) => ({
    id: r.id, nome: r.nome, slug: r.slug, razaoSocial: r.razaoSocial, endereco: r.endereco, logoUrl: r.logoUrl,
    descricao: r.descricao, segmento: r.segmento, site: r.site,
    emailContato: r.emailContato, telefone: r.telefone, responsavel: r.responsavel,
    status: r.status, observacoes: r.observacoes,
    produtosCount: r._count.produtos, clientesCount: r._count.clientes,
  }));
}

export async function getRepresentacaoAction(id: string) {
  await requireAuth();
  return prisma.representacao.findUnique({
    where: { id },
    include: {
      produtos: { orderBy: [{ destaque: "desc" }, { ordem: "asc" }] },
      contatos: { orderBy: { ordem: "asc" } },
      clientes: {
        include: { cliente: { select: { id: true, nome: true, empresa: true, email: true, telefone: true } } },
        orderBy: { criadoEm: "desc" },
      },
    },
  });
}

export async function saveRepresentacaoAction(id: string | null, dados: Record<string, string>) {
  await requireAuth();
  const nome = (dados.nome || "").trim();
  if (!nome) return { error: "Informe o nome." };
  const payload = {
    nome,
    slug: dados.slug?.trim() || slugify(nome),
    razaoSocial: dados.razaoSocial?.trim() || null,
    endereco: dados.endereco?.trim() || null,
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
  await requireAuth();
  await prisma.representacao.delete({ where: { id } });
  revalidatePath("/admin/representacoes");
  return { success: "Representação removida." };
}

/* ---------- PRODUTOS ---------- */

export async function saveProdutoAction(id: string | null, representacaoId: string, dados: {
  nome: string; descricao?: string; categoria?: string; imagens?: string[]; destaque?: boolean; ordem?: number;
}) {
  await requireAuth();
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
  await requireAuth();
  await prisma.produto.delete({ where: { id } });
  revalidatePath("/admin/representacoes");
  return { success: "Produto removido." };
}

/* ---------- VINCULO CLIENTE <-> REPRESENTACAO ---------- */

export async function listVinculosAction(clienteId: string) {
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
  await prisma.clienteRepresentacao.update({ where: { id }, data: dados });
  revalidatePath("/admin/clientes");
  return { success: "Vínculo atualizado." };
}

/** Importa representações em lote via CSV (evita duplicatas por nome) */
export async function importRepresentacoesAction(
  linhas: Array<Record<string, string>>,
): Promise<{ success?: string; error?: string }> {
  await requireAuth();
  if (!Array.isArray(linhas) || linhas.length === 0) return { error: "Nenhuma linha para importar." };
  let criadas = 0, atualizadas = 0;
  try {
    for (const l of linhas) {
      const nome = (l.nome || "").trim();
      if (!nome) continue;
      const dados = {
        nome,
        slug: (l.slug || "").trim() || slugify(nome),
        logoUrl: l.logoUrl?.trim() || null,
        descricao: l.descricao?.trim() || null,
        segmento: l.segmento?.trim() || null,
        site: l.site?.trim() || null,
        emailContato: l.emailcontato?.trim() || null,
        telefone: l.telefone?.trim() || null,
        responsavel: l.responsavel?.trim() || null,
        status: l.status?.trim() || "ativa",
        observacoes: l.observacoes?.trim() || null,
      };
      const existente = await prisma.representacao.findFirst({
        where: { OR: [{ nome: { equals: nome, mode: "insensitive" } }, { slug: dados.slug }] },
      });
      if (existente) {
        await prisma.representacao.update({ where: { id: existente.id }, data: dados });
        atualizadas++;
      } else {
        await prisma.representacao.create({ data: dados });
        criadas++;
      }
    }
    revalidatePath("/admin/representacoes");
    return { success: `${criadas} representação(ões) criada(s), ${atualizadas} atualizada(s).` };
  } catch (e: any) {
    return { error: e.message || "Erro ao importar." };
  }
}

/** Importa produtos/serviços em lote via CSV, vinculando pela representação (nome ou slug) */
export async function importProdutosAction(
  linhas: Array<Record<string, string>>,
): Promise<{ success?: string; error?: string }> {
  await requireAuth();
  if (!Array.isArray(linhas) || linhas.length === 0) return { error: "Nenhuma linha para importar." };
  let criados = 0, atualizados = 0, ignorados = 0;
  try {
    const reps = await prisma.representacao.findMany({ select: { id: true, nome: true, slug: true } });
    for (const l of linhas) {
      const nomeRep = (l.representacao || "").trim().toUpperCase();
      const rep = reps.find((r) => r.nome.toUpperCase() === nomeRep || r.slug.toUpperCase() === nomeRep);
      if (!rep) { ignorados++; continue; }
      const nome = (l.nome || "").trim();
      if (!nome) { ignorados++; continue; }
      let imagens: string[] = [];
      try { imagens = JSON.parse(l.imagens || "[]"); } catch {
        imagens = (l.imagens || "").split(/[;|]/).map((u) => u.trim()).filter((u) => /^https?:\/\//.test(u)).slice(0, 6);
      }
      const dados = {
        nome,
        descricao: l.descricao?.trim() || null,
        categoria: l.categoria?.trim() || null,
        imagens: JSON.stringify(imagens.slice(0, 6)),
        destaque: /^(1|true|sim|s)$/i.test((l.destaque || "").trim()),
        ordem: parseInt(l.ordem || "0") || 0,
      };
      const existente = await prisma.produto.findFirst({
        where: { representacaoId: rep.id, nome: { equals: nome, mode: "insensitive" } },
      });
      if (existente) {
        await prisma.produto.update({ where: { id: existente.id }, data: dados });
        atualizados++;
      } else {
        await prisma.produto.create({ data: { ...dados, representacaoId: rep.id } });
        criados++;
      }
    }
    revalidatePath("/admin/representacoes");
    return { success: `${criados} produto(s) criado(s), ${atualizados} atualizado(s)${ignorados ? `, ${ignorados} ignorado(s)` : ""}.` };
  } catch (e: any) {
    return { error: e.message || "Erro ao importar." };
  }
}

/** Salva um contato de representacao */
export async function saveContatoRepAction(
  representacaoId: string,
  id: string | null,
  dados: { nome: string; cargo?: string; email?: string; telefone?: string; observacoes?: string },
): Promise<{ success?: string; error?: string }> {
  await requireAuth();
  if (!dados.nome?.trim()) return { error: "Informe o nome do contato." };
  const payload = {
    nome: dados.nome.trim(),
    cargo: dados.cargo?.trim() || null,
    email: dados.email?.trim() || null,
    telefone: dados.telefone?.trim() || null,
    observacoes: dados.observacoes?.trim() || null,
  };
  if (id) {
    await prisma.contatoRepresentacao.update({ where: { id }, data: payload });
  } else {
    const count = await prisma.contatoRepresentacao.count({ where: { representacaoId } });
    await prisma.contatoRepresentacao.create({ data: { ...payload, representacaoId, ordem: count } });
  }
  revalidatePath("/admin/representacoes");
  return { success: "Contato salvo." };
}

/** Remove contato de representacao */
export async function deleteContatoRepAction(id: string): Promise<{ success?: string; error?: string }> {
  await requireAuth();
  await prisma.contatoRepresentacao.delete({ where: { id } });
  revalidatePath("/admin/representacoes");
  return { success: "Contato removido." };
}
