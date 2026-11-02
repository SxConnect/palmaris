"use client";

import { useActionState, useEffect, useState } from "react";

import { deleteSection, moveSection, saveSection } from "@/lib/actions/sections";
import {
  BLOCK_KINDS,
  BLOCK_KIND_LABELS,
  parseBlockData,
  type BlockKind,
  type ProjectItem,
} from "@/lib/blocks";

import MediaPicker from "@/components/admin/MediaPicker";
import RichTextEditor from "@/components/RichTextEditor";

type Section = {
  id: string;
  pageId: string;
  title: string | null;
  kind: string;
  content: string;
  data: unknown;
  visible: boolean;
  sectionOrder: number;
};

const EMPTY_ITEM: ProjectItem = {
  title: "",
  description: "",
  imageUrl: "",
  imageAlt: "",
  fit: "cover",
};

/**
 * Editor de blocos da página.
 *
 * Cada bloco tem um "tipo" (kind) que define o layout no site:
 *  - Texto livre (HTML)
 *  - Capa (hero)
 *  - Quem somos
 *  - Nossos projetos
 *  - Últimas notícias
 *  - Chamada para ação
 */
export function SectionForm({ section }: { section: Section }) {
  const [state, action, pending] = useActionState(saveSection, null);
  const [kind, setKind] = useState<BlockKind>(
    (BLOCK_KINDS as readonly string[]).includes(section.kind)
      ? (section.kind as BlockKind)
      : "html",
  );

  const parsed = parseBlockData(kind, section.data);
  const [values, setValues] = useState({
    title: parsed.hero.title,
    subtitle: parsed.hero.subtitle,
    text: parsed.about.text,
    pillars: parsed.about.pillars.join("\n"),
    items: parsed.projects.items,
    limit: parsed.news.limit,
    ctaLabel: parsed.news.ctaLabel,
    ctaUrl: parsed.news.ctaUrl,
    buttonLabel: parsed.cta.buttonLabel,
    buttonUrl: parsed.cta.buttonUrl,
    imageUrl: parsed.hero.imageUrl,
    imageAlt: parsed.hero.imageAlt,
    gallerySlug: parsed.gallery.slug,
    galleryColumns: parsed.gallery.columns,
    galleryCaption: parsed.gallery.caption,
    contactIntro: parsed.contact.intro,
    contactRecipient: parsed.contact.recipient,
  });

  // Lista de galerias disponíveis (para o bloco de galeria).
  const [galleries, setGalleries] = useState<{ id: string; title: string; slug: string }[]>([]);
  useEffect(() => {
    if (kind !== "gallery" || galleries.length > 0) return;
    fetch("/api/galleries")
      .then((res) => res.json())
      .then((data) => setGalleries(Array.isArray(data) ? data : []))
      .catch(() => setGalleries([]));
  }, [kind, galleries.length]);

  const set = (key: keyof typeof values, value: string | number | ProjectItem[]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const updateItem = (index: number, patch: Partial<ProjectItem>) => {
    const items = [...values.items];
    items[index] = { ...items[index], ...patch };
    set("items", items);
  };

  return (
    <div id={`bloco-${section.id}`} className="card space-y-4">
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={section.id} />
        <input type="hidden" name="pageId" value={section.pageId} />
        <input type="hidden" name="items" value={JSON.stringify(values.items)} />

        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Bloco #{section.sectionOrder + 1}
            </p>
            <p className="text-sm text-gray-600">
              {section.title || "Sem rótulo"} · {BLOCK_KIND_LABELS[kind]}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Tipo do bloco</label>
            <select
              name="kind"
              className="input"
              value={kind}
              onChange={(event) => setKind(event.target.value as BlockKind)}
            >
              {BLOCK_KINDS.map((option) => (
                <option key={option} value={option}>
                  {BLOCK_KIND_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Rótulo interno (só para identificar)</label>
            <input
              name="label"
              className="input"
              defaultValue={section.title ?? ""}
              placeholder="Ex.: Capa, Quem somos, Projetos"
            />
          </div>
        </div>

        {/* -------------------------------------------------- HERO */}
        {kind === "hero" ? (
          <>
            <div>
              <label className="label">Título principal</label>
              <input
                name="title"
                className="input"
                value={values.title}
                onChange={(event) => set("title", event.target.value)}
              />
            </div>
            <div>
              <label className="label">Subtítulo</label>
              <textarea
                name="subtitle"
                rows={2}
                className="input"
                value={values.subtitle}
                onChange={(event) => set("subtitle", event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Texto do botão</label>
                <input
                  name="ctaLabel"
                  className="input"
                  value={values.ctaLabel}
                  onChange={(event) => set("ctaLabel", event.target.value)}
                />
              </div>
              <div>
                <label className="label">Link do botão</label>
                <input
                  name="ctaUrl"
                  className="input"
                  value={values.ctaUrl}
                  onChange={(event) => set("ctaUrl", event.target.value)}
                />
              </div>
            </div>
            <MediaPicker
              name="imageUrl"
              label="Imagem de fundo"
              defaultValue={values.imageUrl}
            />
            <div>
              <label className="label">Descrição da imagem (acessibilidade)</label>
              <input
                name="imageAlt"
                className="input"
                value={values.imageAlt}
                onChange={(event) => set("imageAlt", event.target.value)}
              />
            </div>
          </>
        ) : null}

        {/* -------------------------------------------------- ABOUT */}
        {kind === "about" ? (
          <>
            <div>
              <label className="label">Título da seção</label>
              <input
                name="title"
                className="input"
                value={values.title}
                onChange={(event) => set("title", event.target.value)}
              />
            </div>
            <div>
              <label className="label">Subtítulo</label>
              <input
                name="subtitle"
                className="input"
                value={values.subtitle}
                onChange={(event) => set("subtitle", event.target.value)}
              />
            </div>
            <RichTextEditor
              key={`text-${kind}`}
              name="text"
              label="Texto corrido"
              defaultValue={values.text}
            />
            <div>
              <label className="label">Pilares (um por linha)</label>
              <textarea
                name="pillars"
                rows={5}
                className="input"
                value={values.pillars}
                onChange={(event) => set("pillars", event.target.value)}
                placeholder={"Defender o direito à moradia\nMobilizar famílias"}
              />
            </div>
          </>
        ) : null}

        {/* -------------------------------------------------- PROJETOS */}
        {kind === "projects" ? (
          <>
            <div>
              <label className="label">Título da seção</label>
              <input
                name="title"
                className="input"
                value={values.title}
                onChange={(event) => set("title", event.target.value)}
              />
            </div>
            <div>
              <label className="label">Subtítulo (opcional)</label>
              <input
                name="subtitle"
                className="input"
                value={values.subtitle}
                onChange={(event) => set("subtitle", event.target.value)}
              />
            </div>

            <div className="space-y-4">
              {values.items.map((item, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-gray-500">
                      Projeto {index + 1}
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger text-[11px]"
                      onClick={() =>
                        set(
                          "items",
                          values.items.filter((_, position) => position !== index),
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      className="input"
                      placeholder="Título do projeto"
                      value={item.title}
                      onChange={(event) =>
                        updateItem(index, { title: event.target.value })
                      }
                    />
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Descrição"
                      value={item.description}
                      onChange={(event) =>
                        updateItem(index, { description: event.target.value })
                      }
                    />
                    <MediaPicker
                      name={`item-image-${index}`}
                      label="Imagem do projeto"
                      defaultValue={item.imageUrl}
                      onChange={(value) => updateItem(index, { imageUrl: value })}
                    />
                    <div>
                      <label className="label">Ajuste da imagem</label>
                      <select
                        className="input"
                        value={item.fit ?? "cover"}
                        onChange={(event) =>
                          updateItem(index, {
                            fit: event.target.value as "cover" | "contain",
                          })
                        }
                      >
                        <option value="cover">Preencher o card (fotografias)</option>
                        <option value="contain">Mostrar a imagem inteira (logotipos)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn text-xs"
                onClick={() => set("items", [...values.items, { ...EMPTY_ITEM }])}
              >
                + Adicionar projeto
              </button>
            </div>
          </>
        ) : null}

        {/* -------------------------------------------------- NOTÍCIAS */}
        {kind === "news" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Título da seção</label>
                <input
                  name="title"
                  className="input"
                  value={values.title}
                  onChange={(event) => set("title", event.target.value)}
                />
              </div>
              <div>
                <label className="label">Subtítulo</label>
                <input
                  name="subtitle"
                  className="input"
                  value={values.subtitle}
                  onChange={(event) => set("subtitle", event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Quantidade de notícias</label>
                <input
                  name="limit"
                  type="number"
                  min={1}
                  max={12}
                  className="input"
                  value={values.limit}
                  onChange={(event) => set("limit", Number(event.target.value))}
                />
              </div>
              <div>
                <label className="label">Texto do botão</label>
                <input
                  name="ctaLabel"
                  className="input"
                  value={values.ctaLabel}
                  onChange={(event) => set("ctaLabel", event.target.value)}
                />
              </div>
              <div>
                <label className="label">Link do botão</label>
                <input
                  name="ctaUrl"
                  className="input"
                  value={values.ctaUrl}
                  onChange={(event) => set("ctaUrl", event.target.value)}
                />
              </div>
            </div>
          </>
        ) : null}

        {/* -------------------------------------------------- GALERIA */}
        {kind === "gallery" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Título da seção</label>
                <input
                  name="title"
                  className="input"
                  value={values.title}
                  onChange={(event) => set("title", event.target.value)}
                />
              </div>
              <div>
                <label className="label">Subtítulo</label>
                <input
                  name="subtitle"
                  className="input"
                  value={values.subtitle}
                  onChange={(event) => set("subtitle", event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Galeria (slug)</label>
                <input
                  name="slug"
                  className="input"
                  list="galerias-disponiveis"
                  value={values.gallerySlug}
                  onChange={(event) => set("gallerySlug", event.target.value)}
                  placeholder="assembleia-junho"
                />
                <datalist id="galerias-disponiveis">
                  {galleries.map((gallery) => (
                    <option key={gallery.id} value={gallery.slug}>
                      {gallery.title}
                    </option>
                  ))}
                </datalist>
                <p className="mt-1 text-[11px] text-gray-500">
                  Criadas em <span className="underline">Galerias de fotos</span>.
                </p>
              </div>
              <div>
                <label className="label">Colunas</label>
                <input
                  name="columns"
                  type="number"
                  min={1}
                  max={6}
                  className="input"
                  value={values.galleryColumns}
                  onChange={(event) => set("galleryColumns", Number(event.target.value))}
                />
              </div>
              <div>
                <label className="label">Legenda</label>
                <input
                  name="caption"
                  className="input"
                  value={values.galleryCaption}
                  onChange={(event) => set("galleryCaption", event.target.value)}
                />
              </div>
            </div>
          </>
        ) : null}

        {/* -------------------------------------------------- CONTATO */}
        {kind === "contact" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Título da seção</label>
                <input
                  name="title"
                  className="input"
                  value={values.title}
                  onChange={(event) => set("title", event.target.value)}
                />
              </div>
              <div>
                <label className="label">Subtítulo</label>
                <input
                  name="subtitle"
                  className="input"
                  value={values.subtitle}
                  onChange={(event) => set("subtitle", event.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Texto de apresentação</label>
              <textarea
                name="intro"
                rows={3}
                className="input"
                value={values.contactIntro}
                onChange={(event) => set("contactIntro", event.target.value)}
              />
            </div>
            <div>
              <label className="label">E-mail que recebe as mensagens</label>
              <input
                name="recipient"
                className="input"
                value={values.contactRecipient}
                onChange={(event) => set("contactRecipient", event.target.value)}
                placeholder="Em branco = usa o e-mail das Configurações"
              />
            </div>
          </>
        ) : null}

        {/* -------------------------------------------------- CTA */}
        {kind === "cta" ? (
          <>
            <div>
              <label className="label">Título</label>
              <input
                name="title"
                className="input"
                value={values.title}
                onChange={(event) => set("title", event.target.value)}
              />
            </div>
            <div>
              <label className="label">Texto</label>
              <textarea
                name="text"
                rows={3}
                className="input"
                value={values.text}
                onChange={(event) => set("text", event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Texto do botão</label>
                <input
                  name="buttonLabel"
                  className="input"
                  value={values.buttonLabel}
                  onChange={(event) => set("buttonLabel", event.target.value)}
                />
              </div>
              <div>
                <label className="label">Link do botão</label>
                <input
                  name="buttonUrl"
                  className="input"
                  value={values.buttonUrl}
                  onChange={(event) => set("buttonUrl", event.target.value)}
                />
              </div>
            </div>
          </>
        ) : null}

        {/* -------------------------------------------------- HTML */}
        {kind === "html" ? (
          <RichTextEditor
            key={`content-${kind}`}
            name="content"
            label="Conteúdo do bloco (HTML)"
            defaultValue={section.content}
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 pt-3">
          <div className="flex items-center gap-2">
            <input
              name="visible"
              type="checkbox"
              id={`visible-${section.id}`}
              defaultChecked={section.visible}
            />
            <label htmlFor={`visible-${section.id}`} className="text-sm">
              Visível
            </label>
          </div>
          <div>
            <label className="label">Ordem</label>
            <input
              name="sectionOrder"
              type="number"
              className="input w-24"
              defaultValue={section.sectionOrder}
            />
          </div>
        </div>

        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar bloco"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-3">
        <form action={moveSection.bind(null, section.id, "up")}>
          <button type="submit" className="btn text-xs">
            ↑ Subir
          </button>
        </form>
        <form action={moveSection.bind(null, section.id, "down")}>
          <button type="submit" className="btn text-xs">
            ↓ Descer
          </button>
        </form>
        <form action={deleteSection.bind(null, section.id, section.pageId)}>
          <button type="submit" className="btn btn-danger text-xs">
            Excluir bloco
          </button>
        </form>
      </div>
    </div>
  );
}
