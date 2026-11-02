import { getSiteSettings } from "@/lib/site-settings";

import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

/** Configurações gerais do site. */
export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="mt-1 text-sm text-gray-600">
          Dados exibidos no cabeçalho e no rodapé do site.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
