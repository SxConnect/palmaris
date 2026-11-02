import { requireAdmin } from "@/lib/auth/guard";
import CampaignForm from "./CampaignForm";

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
    </div>
  );
}
