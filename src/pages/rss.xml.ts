import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("writing");

  return rss({
    title: "Parallel Intent",
    description:
      "Software studio building at the intersection of human intent and machine intelligence.",
    site: context.site!.toString(),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      link: `/writing/${post.id}`,
    })),
  });
}
