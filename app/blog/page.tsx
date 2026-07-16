import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { listarPosts, dataPorExtenso } from "@/lib/blog";

export const metadata = {
  title: "Blog · WM Assessoria — INSS de Obras sem mistério",
  description:
    "Artigos sobre INSS de obras, CND, CNO, SERO, decadência e regularização — explicados sem juridiquês pelos especialistas da WM Assessoria.",
};

export default function BlogIndex() {
  const posts = listarPosts();
  return (
    <>
      <Header />
      <main className="section" style={{ minHeight: "60vh" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Blog</span>
            <h1 className="display" style={{ fontSize: "clamp(32px,4.6vw,54px)", marginTop: 16 }}>
              INSS de obras <span className="g">sem mistério</span>
            </h1>
            <p style={{ marginTop: 16, fontSize: 17 }}>
              Guias diretos, sem juridiquês, para você entender o que a Receita cobra da sua obra —
              e como pagar apenas o que é devido.
            </p>
          </div>

          {posts.length === 0 ? (
            <p>Os primeiros artigos chegam em breve.</p>
          ) : (
            <div className="grid-3" style={{ alignItems: "stretch" }}>
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="card"
                  style={{ display: "flex", flexDirection: "column", gap: 0, color: "inherit" }}
                >
                  {post.capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.capa}
                      alt=""
                      loading="lazy"
                      style={{
                        width: "calc(100% + 56px)",
                        margin: "-32px -28px 20px",
                        aspectRatio: "16 / 9",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        width: "calc(100% + 56px)",
                        margin: "-32px -28px 20px",
                        aspectRatio: "16 / 9",
                        background:
                          "radial-gradient(400px 200px at 80% -20%, rgba(201,162,74,.25), transparent 60%), var(--marinho-900)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-cormorant), serif",
                          fontStyle: "italic",
                          fontSize: 30,
                          color: "var(--ouro-400)",
                        }}
                      >
                        WM
                      </span>
                    </div>
                  )}
                  <span className="mono" style={{ fontSize: 10, color: "var(--suave)" }}>
                    {dataPorExtenso(post.data)}
                  </span>
                  <h2
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: 25,
                      fontWeight: 600,
                      color: "var(--titulo)",
                      lineHeight: 1.2,
                      margin: "8px 0",
                    }}
                  >
                    {post.titulo}
                  </h2>
                  <p style={{ fontSize: 14.5, flex: 1 }}>{post.descricao}</p>
                  <span style={{ color: "var(--acento)", fontWeight: 600, fontSize: 14, marginTop: 14 }}>
                    Ler artigo →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
