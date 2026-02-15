import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

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
    lastmod: new Date().toISOString(),
    changefreq: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1.0 : 0.7,
  }));

  const posts = await getCollection("blog");

  const postUrls = posts.map((post) => ({
    loc: `${base}/blog/${post.slug}/`,
    lastmod: (post.data.pubDate instanceof Date
      ? post.data.pubDate
      : new Date(post.data.pubDate)
    ).toISOString(),
    changefreq: "monthly",
    priority: 0.6,
  }));

  const urls = [...staticUrls, ...postUrls];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n` +
          `    <loc>${xmlEscape(u.loc)}</loc>\n` +
          `    <lastmod>${u.lastmod}</lastmod>\n` +
          `    <changefreq>${u.changefreq}</changefreq>\n` +
          `    <priority>${u.priority.toFixed(1)}</priority>\n` +
          `  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
