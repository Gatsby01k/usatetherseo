import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };
export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const slugParam = params.slug;
  const slug = Array.isArray(slugParam) ? slugParam.join("/") : (slugParam ?? "");

  const posts = await getCollection("blog");
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const title = post.data.title;
  const desc = post.data.description ?? "Guides on USDT, USAT, stablecoins, security & risks.";

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#0b1020",
          color: "white",
        },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column", gap: "18px" },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "inline-flex",
                      alignSelf: "flex-start",
                      padding: "10px 14px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.10)",
                      fontSize: "22px",
                    },
                    children: "usatether.io • Blog",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "68px",
                      fontWeight: 800,
                      lineHeight: 1.06,
                      letterSpacing: "-0.02em",
                      maxWidth: "1000px",
                    },
                    children: title,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "30px",
                      opacity: 0.85,
                      lineHeight: 1.35,
                      maxWidth: "980px",
                    },
                    children: desc,
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: 0.85,
                fontSize: "22px",
              },
              children: [
                "USDT • USAT • Stablecoins",
                `/${slug}/`,
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
};
