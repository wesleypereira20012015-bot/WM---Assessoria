import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { listarPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = listarPosts().map((p) => ({
    url: `${site.empresa.url}/blog/${p.slug}`,
    lastModified: new Date(p.data),
    priority: 0.6,
  }));
  return [
    { url: site.empresa.url, lastModified: new Date(), priority: 1 },
    { url: `${site.empresa.url}/blog`, lastModified: new Date(), priority: 0.7 },
    ...posts,
    {
      url: `${site.empresa.url}/politica-de-privacidade`,
      lastModified: new Date(),
      priority: 0.3,
    },
  ];
}
