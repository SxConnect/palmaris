import { getSiteSettings } from "@/lib/site-settings";
import CartaoVisita from "@/app/admin/(panel)/cartao/CartaoVisita";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const dynamic = "force-dynamic";

export default async function CartaoPublicoPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-neutral-50 py-10">
        <div className="mx-auto max-w-5xl px-4">
          <CartaoVisita settingsInicial={settings} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
