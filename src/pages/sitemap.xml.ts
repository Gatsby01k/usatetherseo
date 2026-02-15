import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

function xmlEscape(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || "https://usatether.io").replace(/\/$/, "");

  // 1) Статические страницы (добавляй/убирай по необходимости)
  const staticPaths = [
    "/",
    "/about/",
    "/contact/",
    "/disclaimer/",
    "/privacy-policy/",
    "/blog/",
  ];

  const staticUrls = staticPaths.map((path) => ({
    loc: `${base}${path}`,
    // lastmod можно не ставить для статических, но оставим единообразно
    lastmod: new Date().toISOString(),
    changefreq: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1.0 : 0.7,
  }));

  // 2) Посты из коллекции blog
  const posts = await getCollection("blog");

  const postUrls = posts
    // по желанию: исключать будущие публикации
    // .filter((p) => p.data.pubDate <= new Date())
    .map((post) => {
      const slug = post.slug.endsWith("/") ? post.slug : `${post.slug}/`;
      return {
        loc: `${base}/blog/${slug}`,
        lastmod: (post.data.pubDate instanceof Date
          ? post.data.pubDate
          : new Date(post.data.pubDate)
        ).toISOString(),
        changefreq: "monthly",
        priority: 0.6,
      };
    });

  const urls = [...staticUrls, ...postUrls];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map(
        (u) =>
          `<url>` +
          `<loc>${xmlEscape(u.loc)}</loc>` +
          `<lastmod>${u.lastmod}</lastmod>` +
          `<changefreq>${u.changefreq}</changefreq>` +
          `<priority>${u.priority.toFixed(1)}</priority>` +
          `</url>`
      )
      .join("") +
    `</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
