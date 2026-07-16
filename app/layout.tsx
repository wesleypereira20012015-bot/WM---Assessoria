import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Cormorant_Garamond } from "next/font/google";
import { site } from "@/content/site";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.empresa.url),
  title: site.seo.titulo,
  description: site.seo.descricao,
  keywords: site.seo.palavrasChave,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.empresa.nome,
    title: site.seo.titulo,
    description: site.seo.descricao,
    images: ["/images/og.png"],
  },
  robots: { index: true, follow: true },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.empresa.nome,
  description: site.seo.descricao,
  taxID: site.empresa.cnpj,
  url: site.empresa.url,
  areaServed: { "@type": "Country", name: "Brasil" },
  knowsAbout: ["INSS de obras", "CND de obra", "CNO", "SERO", "Regularização de obras"],
  sameAs: [site.empresa.instagram],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${plexMono.variable} ${cormorant.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
