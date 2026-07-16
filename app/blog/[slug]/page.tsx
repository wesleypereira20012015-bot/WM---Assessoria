import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Button from "@/components/ui/Button";
import { buscarPost, dataPorExtenso, listarPosts } from "@/lib/blog";
import { Markdown } from "@/lib/markdown";
import { linkWhatsApp } from "@/lib/whatsapp";

export function generateStaticParams() {
  return listarPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = buscarPost(slug);
  if (!post) return {};
  return {
    title: `${post.titulo} · WM Assessoria`,
    description: post.descricao,
    openGraph: { title: post.titulo, description: post.descricao, images: post.capa ? [post.capa] : undefined },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = buscarPost(slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="section">
        <article className="container" style={{ maxWidth: 720 }}>
          <p className="mono" style={{ fontSize: 10.5, color: "var(--suave)" }}>
            <Link href="/blog" style={{ color: "var(--acento)" }}>
              ← Blog
            </Link>
            {"   ·   "}
            {dataPorExtenso(post.data)}
          </p>
          <h1
            className="display"
            style={{ fontSize: "clamp(30px,4.4vw,48px)", margin: "16px 0 10px", lineHeight: 1.08 }}
          >
            {post.titulo}
          </h1>
          <p style={{ fontSize: 17.5, color: "var(--texto)", marginBottom: 28 }}>{post.descricao}</p>
          {post.capa && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.capa}
              alt=""
              style={{ borderRadius: 16, marginBottom: 28, width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
            />
          )}
          <div style={{ fontSize: 16.5, lineHeight: 1.75 }}>
            <Markdown texto={post.corpo} />
          </div>

          <div
            className="sec-escuro"
            style={{
              marginTop: 48,
              padding: "30px 34px",
              borderRadius: "var(--r-bloco)",
              background: "var(--marinho-900)",
              border: "1px solid rgba(201,162,74,.3)",
              display: "flex",
              gap: 24,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <p style={{ color: "#F3EFE8", fontSize: 16.5, maxWidth: 440 }}>
              Quer saber quanto isso representa na <em style={{ color: "var(--ouro-400)" }}>sua</em> obra?
              A análise é gratuita.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button variante="ouro" href="/#calculadora">
                Calcular minha economia
              </Button>
              <Button variante="ghost" href={linkWhatsApp()}>
                WhatsApp
              </Button>
            </div>
          </div>
        </article>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
