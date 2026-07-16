"use client";

interface BaseProps {
  label: string;
  id: string;
  erro?: string;
}

/** Campo de texto do design system, com label e mensagem de erro. */
export function Input({
  label,
  id,
  erro,
  prefixo,
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement> & { prefixo?: string }) {
  const input = (
    <input
      id={id}
      className={`input ${erro ? "erro" : ""}`}
      aria-invalid={!!erro}
      aria-describedby={erro ? `${id}-erro` : undefined}
      {...rest}
    />
  );
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {prefixo ? (
        <div className="input-prefixo">
          <span className="prefixo">{prefixo}</span>
          {input}
        </div>
      ) : (
        input
      )}
      {erro && (
        <span className="msg-erro" id={`${id}-erro`} role="alert">
          {erro}
        </span>
      )}
    </div>
  );
}

/** Campo select do design system. */
export function Select({
  label,
  id,
  erro,
  children,
  ...rest
}: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className={`input ${erro ? "erro" : ""}`} aria-invalid={!!erro} {...rest}>
        {children}
      </select>
      {erro && (
        <span className="msg-erro" role="alert">
          {erro}
        </span>
      )}
    </div>
  );
}
