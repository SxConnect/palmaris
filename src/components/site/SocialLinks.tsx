import { getSiteSettings } from "@/lib/site-settings";

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.5 9H16l-.5 3h-2v7h-3v-7H9l.5-3h1.5V6.5A3.5 3.5 0 0 1 14.5 3H16v3h-1.5A1.5 1.5 0 0 0 13.5 7.5V9Z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 4.5c2.4 0 2.7 0 3.65.06.88.04 1.35.19 1.67.31.42.17.72.36 1.03.67.31.31.5.61.67 1.03.12.32.27.79.31 1.67.05.95.06 1.24.06 3.65s0 2.7-.06 3.65c-.04.88-.19 1.35-.31 1.67-.17.42-.36.72-.67 1.03-.31.31-.61.5-1.03.67-.32.12-.79.27-1.67.31-.95.05-1.24.06-3.65.06s-2.7 0-3.65-.06c-.88-.04-1.35-.19-1.67-.31a2.8 2.8 0 0 1-1.03-.67 2.8 2.8 0 0 1-.67-1.03c-.12-.32-.27-.79-.31-1.67C4.5 14.7 4.5 14.4 4.5 12s0-2.7.06-3.65c.04-.88.19-1.35.31-1.67.17-.42.36-.72.67-1.03.31-.31.61-.5 1.03-.67.32-.12.79-.27 1.67-.31C9.3 4.5 9.6 4.5 12 4.5Zm0 1.8c-2.37 0-2.66 0-3.6.06-.87.04-1.34.18-1.66.3-.42.17-.68.35-.98.65-.3.3-.48.56-.65.98-.12.32-.26.79-.3 1.66-.05.94-.06 1.23-.06 3.6s.01 2.66.06 3.6c.04.87.18 1.34.3 1.66.17.42.35.68.65.98.3.3.56.48.98.65.32.12.79.26 1.66.3.94.05 1.23.06 3.6.06s2.66-.01 3.6-.06c.87-.04 1.34-.18 1.66-.3.42-.17.68-.35.98-.65.3-.3.48-.56.65-.98.12-.32.26-.79.3-1.66.05-.94.06-1.23.06-3.6s-.01-2.66-.06-3.6c-.04-.87-.18-1.34-.3-1.66-.17-.42-.35-.68-.65-.98-.3-.3-.56-.48-.98-.65-.32-.12-.79-.26-1.66-.3C14.66 6.3 14.37 6.3 12 6.3Zm0 3.1a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 1.8a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Zm5.6-2.1a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0Z" />
    </svg>
  );
}

type Social = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

/**
 * Ícones das redes sociais (LinkedIn, Instagram e Facebook).
 */
export default async function SocialLinks({
  variant = "header",
}: {
  /** "header" = ao lado do logo; "footer" = círculo no rodapé. */
  variant?: "header" | "footer";
}) {
  const settings = await getSiteSettings();

  const socials: Social[] = [
    {
      href: settings.linkedinUrl,
      label: "LinkedIn da Palmaris",
      icon: <LinkedInIcon className={variant === "footer" ? "h-5 w-5" : "h-5 w-5"} />,
    },
    {
      href: settings.instagramUrl,
      label: "Instagram da Palmaris",
      icon: <InstagramIcon className={variant === "footer" ? "h-5 w-5" : "h-5 w-5"} />,
    },
  ];

  if (settings.facebookUrl) {
    socials.push({
      href: settings.facebookUrl,
      label: "Facebook da Palmaris",
      icon: <FacebookIcon className={variant === "footer" ? "h-5 w-5" : "h-5 w-5"} />,
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      {socials.map((social) =>
        social.href ? (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            title={social.label}
            className={
              variant === "footer"
                ? "inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 transition hover:bg-brand-600 hover:text-white"
                : "inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-brand-600"
            }
          >
            {social.icon}
          </a>
        ) : (
          <span
            key={social.label}
            aria-label={`${social.label} (link não cadastrado)`}
            title="Cadastre o endereço nas Configurações do painel"
            className={
              variant === "footer"
                ? "inline-flex h-10 w-10 cursor-help items-center justify-center rounded-full bg-neutral-800 text-neutral-500 opacity-60"
                : "inline-flex h-10 w-10 cursor-help items-center justify-center rounded-full text-neutral-300 opacity-70"
            }
          >
            {social.icon}
          </span>
        ),
      )}
    </div>
  );
}
