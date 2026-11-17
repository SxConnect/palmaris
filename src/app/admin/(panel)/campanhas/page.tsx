import { requireAdmin } from "@/lib/auth/guard";
import CampaignForm from "./CampaignForm";
import CampaignList from "./CampaignList";
import ReportList from "./ReportList";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const user = await requireAdmin();

  const availableSenders = [
    "contato@palmaris.com.br",
    "comercial@palmaris.com.br",
    "engenharia@palmaris.com.br",
    "projetos@palmaris.com.br",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campanhas & Disparos em Massa</h1>
          <p className="mt-1 text-sm text-slate-500">
            Envio de comunicados industriais e campanhas comerciais autorizadas com assinatura digital.
          </p>
        </div>
      </div>

      <CampaignForm availableSenders={availableSenders} />

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Campanhas salvas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Histórico de campanhas enviadas e agendadas. Clique para ver a mensagem.
          </p>
        </div>
        <CampaignList />
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">📊 Relatórios pós-campanha</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gerados automaticamente 24h após a conclusão, com resumo enviado por e-mail.
          </p>
        </div>
        <ReportList />
      </section>
    </div>
  );
}
