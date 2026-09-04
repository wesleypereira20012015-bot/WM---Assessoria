"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Navegação da Área do Criador. Marca a aba da rota atual. */

const ABAS = [
  { href: "/criador", rotulo: "Ideias" },
  { href: "/criador/aprovacao", rotulo: "Aprovação" },
  { href: "/criador/calendario", rotulo: "Calendário" },
  { href: "/criador/referencias", rotulo: "Referências" },
  { href: "/criador/crm", rotulo: "CRM" },
  { href: "/criador/financeiro", rotulo: "Financeiro" },
];

export default function Abas() {
  const caminho = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        borderBottom: "1px solid var(--linha)",
        marginBottom: 32,
      }}
    >
      {ABAS.map(({ href, rotulo }) => {
        const ativa = href === "/criador" ? caminho === href : caminho.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: ativa ? 600 : 400,
              color: ativa ? "var(--titulo)" : "var(--texto)",
              borderBottom: `2px solid ${ativa ? "var(--ouro-500)" : "transparent"}`,
              marginBottom: -1,
            }}
          >
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
