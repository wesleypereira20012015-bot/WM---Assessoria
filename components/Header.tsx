import Logo from "./Logo";
import Button from "./ui/Button";

const links = [
  { href: "/#servicos", rotulo: "Serviços" },
  { href: "/#calculadora", rotulo: "Calculadora" },
  { href: "/#resultados", rotulo: "Resultados" },
  { href: "/#quem-somos", rotulo: "Quem somos" },
  { href: "/#faq", rotulo: "Dúvidas" },
  { href: "/blog", rotulo: "Blog" },
];

/** Cabeçalho fixo claro, com navegação por âncoras. */
export default function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(243, 239, 232, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(15, 31, 54, 0.1)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          minHeight: 76,
        }}
      >
        <a href="/#topo" aria-label="WM Assessoria — início" style={{ display: "flex" }}>
          <Logo largura={200} fundo="claro" />
        </a>
        <nav aria-label="Navegação principal" style={{ marginLeft: "auto" }} className="nav-desktop">
          <ul
            style={{
              display: "flex",
              gap: 30,
              listStyle: "none",
            }}
          >
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  style={{
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: "#0F1F36",
                    padding: "10px 0",
                  }}
                >
                  {l.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-cta">
          <Button variante="ghost" href="/#calculadora" className="btn-compacto">
            Análise gratuita
          </Button>
        </div>
      </div>
    </header>
  );
}
