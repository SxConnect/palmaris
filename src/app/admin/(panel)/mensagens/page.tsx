import { prisma } from "@/lib/prisma";
import { deleteMessage, toggleMessageHandled } from "@/lib/actions/messages";

export const dynamic = "force-dynamic";

/**
 * Caixa de entrada do formulário de contato.
 * Toda mensagem enviada pelo site fica registrada aqui — mesmo sem SMTP.
 */
export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = messages.filter((message) => !message.handled).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mensagens</h1>
          <p className="mt-1 text-sm text-gray-600">
            Mensagens recebidas pelo formulário de contato do site
            {pending > 0 ? ` — ${pending} sem resposta` : ""}.
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <p className="text-gray-500">Nenhuma mensagem recebida ainda.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`card space-y-2 ${message.handled ? "opacity-70" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {message.name}
                    {message.handled ? (
                      <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                        respondida
                      </span>
                    ) : (
                      <span className="ml-2 rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                        nova
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    <a href={`mailto:${message.email}`} className="underline">
                      {message.email}
                    </a>
                    {message.subject ? ` · ${message.subject}` : ""} ·{" "}
                    {message.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleMessageHandled.bind(null, message.id)}>
                    <button type="submit" className="btn text-xs">
                      {message.handled ? "Reabrir" : "Marcar como respondida"}
                    </button>
                  </form>
                  <form action={deleteMessage.bind(null, message.id)}>
                    <button type="submit" className="btn btn-danger text-xs">
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-800">{message.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
