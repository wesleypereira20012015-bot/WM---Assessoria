import { createHash } from "crypto";
import { cookies } from "next/headers";

/** Autenticação simples do /admin: cookie com o hash da senha (ADMIN_PASSWORD). */

const COOKIE = "wm_admin";

function hash(senha: string): string {
  return createHash("sha256").update(`wm-assessoria:${senha}`).digest("hex");
}

export async function estaAutenticado(): Promise<boolean> {
  const senha = process.env.ADMIN_PASSWORD;
  if (!senha) return false;
  const jar = await cookies();
  return jar.get(COOKIE)?.value === hash(senha);
}

export async function autenticar(senha: string): Promise<boolean> {
  const correta = process.env.ADMIN_PASSWORD;
  if (!correta || senha !== correta) return false;
  const jar = await cookies();
  jar.set(COOKIE, hash(correta), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8 horas
    path: "/",
  });
  return true;
}

export async function sair(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
