import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/format";
import { allSlugs } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = ["", "/discover"].map((p) => ({ url: `${SITE_URL}${p}` }));
  try {
    const rows = await allSlugs();
    return [...pages, ...rows.map((r) => ({ url: `${SITE_URL}/products/${r.slug}`, lastModified: r.updated_at }))];
  } catch {
    return pages;
  }
}
