"use client";

import { useState, useTransition } from "react";
import type { MailboxItem, EmailSummary, EmailDetail } from "@/lib/jmap";
import { sendEmailAction } from "@/lib/actions/email";

export default function WebmailClient({
  currentUser,
  mailboxes,
  emails,
  selectedEmail,
  currentMailboxId,
  errorMessage,
}: {
  currentUser: { email: string; name: string | null; owner: boolean };
  mailboxes: MailboxItem[];
  emails: EmailSummary[];
  selectedEmail: EmailDetail | null;
  currentMailboxId: string;
  errorMessage?: string;
}) {
  const [composing, setComposing] = useState(false);
  const [replyTo, setReplyTo] = useState<{ to: string; subject: string } | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeEmail, setActiveEmail] = useState<EmailDetail | EmailSummary | null>(selectedEmail);
  const [isPending, startTransition] = useTransition();
  const [sendResult, setSendResult] = useState<{ error?: string; success?: string } | null>(null);

  const filteredEmails = emails.filter((m) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const fromStr = m.from.map((f) => `${f.name} ${f.email}`).join(" ").toLowerCase();
    return m.subject.toLowerCase().includes(q) || fromStr.includes(q) || m.preview.toLowerCase().includes(q);
  });

  const handleOpenCompose = (to = "", subject = "") => {
    setReplyTo({ to, subject });
    setSendResult(null);
    setComposing(true);
  };

  const handleSendSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await sendEmailAction(null, formData);
      setSendResult(res);
      if (res.success) {
        setTimeout(() => {
          setComposing(false);
          setSendResult(null);
        }, 1500);
      }
    });
  };

  const getFolderIcon = (role: string) => {
    switch (role) {
      case "inbox":
        return "📥";
      case "sent":
        return "📤";
      case "drafts":
        return "📝";
      case "trash":
        return "🗑️";
      case "junk":
        return "⚠️";
      default:
        return "📁";
    }
  };

  const getFolderName = (name: string, role: string) => {
    switch (role) {
      case "inbox":
        return "Caixa de Entrada";
      case "sent":
        return "Enviados";
      case "drafts":
        return "Rascunhos";
      case "trash":
        return "Lixeira";
      case "junk":
        return "Spam";
      default:
        return name;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Barra de título do Webmail */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50/70">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo-palmaris.jpg" alt="Palmaris" className="h-8 w-auto object-contain rounded" />
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Webmail Palmaris</h1>
            <p className="text-xs text-slate-500 font-medium">Conta ativa: <span className="font-semibold text-brand-600">{currentUser.email}</span></p>
          </div>
        </div>

        <button
          onClick={() => handleOpenCompose()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <span>✏️</span>
          <span>Nova Mensagem</span>
        </button>
      </div>

      {/* Cards de resumo por caixa de e-mail */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50/50">
        {mailboxes.map((box) => {
          const active = box.id === currentMailboxId;
          const folderName = getFolderName(box.name, box.role);
          const icon = getFolderIcon(box.role);
          return (
            <a
              key={box.id}
              href={`/admin/email?box=${box.id}`}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition shadow-xs ${
                active
                  ? "border-brand-300 bg-brand-50/80 shadow-sm"
                  : "border-slate-200 bg-white hover:border-brand-200 hover:shadow-sm"
              }`}
            >
              <span className="text-xl shrink-0">{icon}</span>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${active ? "text-brand-700" : "text-slate-700"}`}>
                  {folderName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-slate-500">
                    {box.totalEmails} {box.totalEmails === 1 ? "e-mail" : "e-mails"}
                  </span>
                  {box.unreadEmails > 0 && (
                    <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                      {box.unreadEmails} não lidos
                    </span>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Erro de conexão */}
      {errorMessage && (
        <div className="mx-4 mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
          ⚠️ Erro ao carregar e-mails: {errorMessage}
        </div>
      )}

      {/* Grid de 3 colunas: Pastas | Lista | Leitura */}
      <div className="grid grid-cols-12 flex-1 overflow-hidden">
        {/* Coluna 1: Pastas */}
        <div className="col-span-12 md:col-span-3 border-r border-slate-200 p-3 bg-slate-50/40 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pastas</p>
            {mailboxes.map((box) => {
              const active = box.id === currentMailboxId;
              return (
                <a
                  key={box.id}
                  href={`/admin/email?box=${box.id}`}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-brand-50 text-brand-700 font-bold" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span>{getFolderIcon(box.role)}</span>
                    <span>{getFolderName(box.name, box.role)}</span>
                  </span>
                  {box.unreadEmails > 0 ? (
                    <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">
                      {box.unreadEmails}
                    </span>
                  ) : (
                    box.totalEmails > 0 && <span className="text-xs text-slate-400">{box.totalEmails}</span>
                  )}
                </a>
              );
            })}
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">Segurança & DKIM</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Servidor sincronizado via TLS com proteção antispam e assinatura digital corporativa ativa.
            </p>
          </div>
        </div>

        {/* Coluna 2: Lista de E-mails */}
        <div className="col-span-12 md:col-span-4 border-r border-slate-200 flex flex-col overflow-hidden bg-white">
          <div className="p-3 border-b border-slate-200">
            <input
              type="text"
              placeholder="Buscar e-mails..."
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhuma mensagem nesta pasta.
              </div>
            ) : (
              filteredEmails.map((item) => {
                const isSelected = activeEmail?.id === item.id;
                const sender = item.from[0]?.name || item.from[0]?.email || "Desconhecido";
                const dateStr = item.receivedAt
                  ? new Date(item.receivedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveEmail(item);
                      // Carrega detalhe se necessário
                      fetch(`/admin/email/api?id=${item.id}`)
                        .then((res) => res.json())
                        .then((data) => data && setActiveEmail(data))
                        .catch(() => {});
                    }}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                      isSelected ? "bg-brand-50/70 border-l-4 border-brand-600" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold truncate max-w-[170px] ${item.isUnread ? "text-slate-900 font-extrabold" : "text-slate-700"}`}>
                        {sender}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0">{dateStr}</span>
                    </div>
                    <p className={`text-xs truncate ${item.isUnread ? "font-bold text-slate-900" : "text-slate-800"}`}>
                      {item.subject}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.preview}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 3: Leitura do E-mail */}
        <div className="col-span-12 md:col-span-5 flex flex-col overflow-hidden bg-slate-50/20">
          {activeEmail ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Cabeçalho da mensagem */}
              <div className="p-4 bg-white border-b border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-slate-900 leading-snug">{activeEmail.subject}</h2>
                  <button
                    onClick={() =>
                      handleOpenCompose(
                        activeEmail.from[0]?.email || "",
                        activeEmail.subject.startsWith("Re:") ? activeEmail.subject : `Re: ${activeEmail.subject}`,
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <span>↩️</span>
                    <span>Responder</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-700">De:</span>{" "}
                    {activeEmail.from.map((f) => `${f.name || ""} <${f.email}>`).join(", ")}
                    <br />
                    <span className="font-semibold text-slate-700">Para:</span>{" "}
                    {activeEmail.to.map((t) => `${t.name || ""} <${t.email}>`).join(", ")}
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    {activeEmail.receivedAt ? new Date(activeEmail.receivedAt).toLocaleString("pt-BR") : ""}
                  </div>
                </div>
              </div>

              {/* Corpo da mensagem */}
              <div className="flex-1 overflow-y-auto p-5 bg-white">
                {(activeEmail as EmailDetail).htmlBody ? (
                  <div
                    className="prose prose-sm max-w-none text-slate-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: (activeEmail as EmailDetail).htmlBody }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-sans">
                    {(activeEmail as EmailDetail).textBody || activeEmail.preview}
                  </div>
                )}

                {/* Anexos recebidos */}
                {(activeEmail as EmailDetail).attachments && (activeEmail as EmailDetail).attachments.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                      <span>📎</span> Anexos ({(activeEmail as EmailDetail).attachments.length})
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {(activeEmail as EmailDetail).attachments.map((att, i) => (
                        <a
                          key={i}
                          href={`/admin/email/download?blobId=${att.blobId}&name=${encodeURIComponent(att.name)}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:border-brand-300 transition shadow-xs"
                          download
                        >
                          <span className="text-brand-600">📎</span>
                          <span className="max-w-[180px] truncate font-medium">{att.name}</span>
                          <span className="text-slate-400 text-[11px]">
                            ({(att.size / 1024).toFixed(1)} KB)
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <span className="text-4xl mb-2">✉️</span>
              <p className="text-sm font-medium text-slate-500">Selecione uma mensagem para ler</p>
              <p className="text-xs text-slate-400 mt-1">Ou clique em Nova Mensagem para compor um e-mail com a assinatura Palmaris.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Compositor de E-mails */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-brand-600">✏️</span>
                <h3 className="font-bold text-slate-900 text-sm">Nova Mensagem — Palmaris</h3>
              </div>
              <button
                onClick={() => setComposing(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendSubmit} className="flex flex-col flex-1 overflow-hidden p-5 space-y-3.5">
              <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="font-semibold text-slate-700">Remetente:</span>
                <span>{currentUser.name ? `${currentUser.name} ` : ""}&lt;{currentUser.email}&gt;</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Para *</label>
                <input
                  name="to"
                  type="text"
                  required
                  defaultValue={replyTo?.to || ""}
                  placeholder="destinatario@exemplo.com (separe múltiplos com vírgula)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assunto *</label>
                <input
                  name="subject"
                  type="text"
                  required
                  defaultValue={replyTo?.subject || ""}
                  placeholder="Assunto da mensagem"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mensagem *</label>
                <textarea
                  name="body"
                  required
                  rows={8}
                  placeholder="Escreva sua mensagem aqui..."
                  className="w-full flex-1 rounded-lg border border-slate-200 p-3 text-xs focus:border-brand-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Anexos</label>
                <input
                  name="attachments"
                  type="file"
                  multiple
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Selecione um ou mais arquivos para anexar ao e-mail (máximo 50 MB por arquivo).
                </p>
              </div>

              {/* Prévia da Assinatura Corporativa */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/logo-palmaris.jpg" alt="Logo" className="h-8 w-auto object-contain rounded" />
                  <div className="text-[11px] text-slate-600">
                    <strong>Assinatura oficial Palmaris:</strong> anexada automaticamente no rodapé do e-mail.
                  </div>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 font-medium">
                  <input type="checkbox" name="includeSignature" defaultChecked className="rounded text-brand-600" />
                  <span>Incluir</span>
                </label>
              </div>

              {sendResult?.error && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 font-medium">{sendResult.error}</p>
              )}
              {sendResult?.success && (
                <p className="rounded-lg bg-green-50 p-2.5 text-xs text-green-700 font-medium">{sendResult.success}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setComposing(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {isPending ? "Enviando mensagem..." : "Enviar E-mail"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
