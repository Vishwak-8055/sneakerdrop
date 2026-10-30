import { cache } from "react";
import { db } from "./supabase";

export const CATEGORIES = ["lifestyle", "running", "basketball", "skate", "trail"] as const;
export const STATUSES = ["available", "upcoming", "unavailable"] as const;
export type Category = (typeof CATEGORIES)[number];
export type Status = (typeof STATUSES)[number];

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  original_price: number | null;
  category: Category;
  color: string;
  availability_status: Status;
  featured: boolean;
  release_date: string | null;
  created_at: string;
  product_images: { image_url: string; alt_text: string; display_order: number }[];
};

const COLUMNS: string =
  "id,slug,name,brand,description,price,original_price,category,color,availability_status,featured,release_date,created_at,product_images(image_url,alt_text,display_order)";

export const PAGE_SIZE = 9;

export type Query = { q?: string; category?: string; status?: string; sort?: string; page?: number };

export async function listProducts(o: Query): Promise<{ items: Product[]; total: number }> {
  const page = Math.max(1, o.page ?? 1);
  let req = db().from("products").select(COLUMNS, { count: "exact" });

  // Prefix search over name/brand/color/category. Only letters and digits reach the tsquery.
  const terms = (o.q ?? "").toLowerCase().match(/[\p{L}\p{N}]+/gu)?.slice(0, 6) ?? [];
  if (terms.length) {
    req = req.textSearch("search_vector", terms.map((t) => `${t}:*`).join(" & "), { config: "simple" });
  }
  if ((CATEGORIES as readonly string[]).includes(o.category ?? "")) req = req.eq("category", o.category as string);
  if ((STATUSES as readonly string[]).includes(o.status ?? "")) req = req.eq("availability_status", o.status as string);

  const ordered =
    o.sort === "price-asc"
      ? req.order("price", { ascending: true })
      : o.sort === "price-desc"
        ? req.order("price", { ascending: false })
        : req.order("created_at", { ascending: false });

  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await ordered
    .order("id")
    .order("display_order", { referencedTable: "product_images" })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as unknown as Product[], total: count ?? 0 };
}

async function run(q: PromiseLike<{ data: unknown; error: { message: string } | null }>) {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Product[];
}

const base = () => db().from("products").select(COLUMNS);
const imgOrder = { referencedTable: "product_images" } as const;

export const featured = (limit = 3) =>
  run(base().eq("featured", true).order("created_at", { ascending: false }).order("display_order", imgOrder).limit(limit));

export const newest = (limit = 4) =>
  run(base().eq("availability_status", "available").order("created_at", { ascending: false }).order("display_order", imgOrder).limit(limit));

export const upcoming = (limit = 3) =>
  run(base().eq("availability_status", "upcoming").order("release_date", { ascending: true }).order("display_order", imgOrder).limit(limit));

export const related = (p: Product, limit = 3) =>
  run(base().eq("category", p.category).neq("id", p.id).order("created_at", { ascending: false }).order("display_order", imgOrder).limit(limit));

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const { data, error } = await base().eq("slug", slug).order("display_order", imgOrder).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as Product | null) ?? null;
});

export async function allSlugs() {
  const { data, error } = await db().from("products").select("slug,updated_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as { slug: string; updated_at: string }[];
}
