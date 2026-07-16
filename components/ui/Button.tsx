import Link from "next/link";

type Variante = "ouro" | "whatsapp" | "ghost";

interface Props {
  variante?: Variante;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

/** Botão do design system. Com `href` vira link; sem, vira <button>. */
export default function Button({
  variante = "ouro",
  href,
  onClick,
  type = "button",
  children,
  className = "",
  disabled,
  ariaLabel,
}: Props) {
  const classes = `btn btn-${variante} ${className}`;
  if (href) {
    const externo = href.startsWith("http");
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        target={externo ? "_blank" : undefined}
        rel={externo ? "noopener noreferrer" : undefined}
      >
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
