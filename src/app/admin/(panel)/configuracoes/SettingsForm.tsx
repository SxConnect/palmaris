"use client";

import { useActionState } from "react";

import { saveSettings } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/site-settings";

import MediaPicker from "@/components/admin/MediaPicker";

/** Formulário dos dados gerais do site (rodapé, logotipo, redes sociais). */
export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveSettings, null);

  return (
    <form action={action} className="card space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nome do site</label>
          <input name="siteName" className="input" defaultValue={settings.siteName} required />
        </div>
        <div>
          <label className="label">Frase de apoio</label>
          <input name="tagline" className="input" defaultValue={settings.tagline} />
        </div>
      </div>

      <MediaPicker name="logoUrl" label="Logotipo do cabeçalho" defaultValue={settings.logoUrl} />

      <div>
        <label className="label">Endereço</label>
        <input name="address" className="input" defaultValue={settings.address} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">CNPJ</label>
          <input name="cnpj" className="input" defaultValue={settings.cnpj} />
        </div>
        <div>
          <label className="label">E-mail</label>
          <input name="email" type="email" className="input" defaultValue={settings.email} />
        </div>
        <div>
          <label className="label">Telefone (opcional)</label>
          <input name="phone" className="input" defaultValue={settings.phone} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Facebook (opcional)</label>
          <input
            name="facebookUrl"
            className="input"
            defaultValue={settings.facebookUrl}
            placeholder="facebook.com/palmaris"
          />
        </div>
        <div>
          <label className="label">Instagram</label>
          <input
            name="instagramUrl"
            className="input"
            defaultValue={settings.instagramUrl}
            placeholder="instagram.com/palmarisrepresentacoes"
          />
        </div>
        <div>
          <label className="label">LinkedIn</label>
          <input
            name="linkedinUrl"
            className="input"
            defaultValue={settings.linkedinUrl}
            placeholder="linkedin.com/company/palmarisrepresentacoes"
          />
        </div>
      </div>

      <div>
        <label className="label">Texto adicional do rodapé</label>
        <input name="footerNote" className="input" defaultValue={settings.footerNote} />
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-3">
        <p className="text-sm font-bold text-brand-800">💳 Cartão de Visita Digital</p>
        <div>
          <label className="label">Nome do responsável</label>
          <input name="cardOwner" className="input" defaultValue={settings.cardOwner} placeholder="Ex.: Silvano Xavier" />
        </div>
        <div>
          <label className="label">Segmentos (separados por |)</label>
          <input name="cardSegmentos" className="input" defaultValue={settings.cardSegmentos} placeholder="⚙️|Automação Industrial|🔧|Projetos e Instrumentação" />
          <p className="mt-1 text-[11px] text-slate-500">Formato: ícone|título|ícone|título|ícone|título</p>
        </div>
        <div>
          <label className="label">Chamada do WhatsApp</label>
          <input name="cardChamada" className="input" defaultValue={settings.cardChamada} placeholder="Fale conosco pelo WhatsApp" />
        </div>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-700">{state.success}</p> : null}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Salvando…" : "Salvar configurações"}
      </button>
    </form>
  );
}
