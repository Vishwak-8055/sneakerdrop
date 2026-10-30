import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, PAGE_SIZE, STATUSES, listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata = { title: "Discover", alternates: { canonical: "/discover" } };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const STATUS_LABEL = { available: "Available", upcoming: "Upcoming", unavailable: "Sold out" } as const;

export default async function Discover({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 80);
  const category = one(sp.category);
  const status = one(sp.status);
  const sort = one(sp.sort) || "newest";
  const page = Math.max(1, Number.parseInt(one(sp.page), 10) || 1);

  const { items, total } = await listProducts({ q, category, status, sort, page });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (category) u.set("category", category);
    if (status) u.set("status", status);
    if (sort !== "newest") u.set("sort", sort);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/discover?${s}` : "/discover";
  };

  return (
    <section className="wrap shelf">
      <h1 className="display sm">Discover</h1>
      <form className="filters" method="get" action="/discover" role="search">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Name, brand or colour" />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={category}>
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Availability</label>
          <select id="status" name="status" defaultValue={status}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sort</label>
          <select id="sort" name="sort" defaultValue={sort}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <button className="btn" type="submit">
          Apply
        </button>
      </form>

      <p className="muted" role="status">
        {total} {total === 1 ? "pair" : "pairs"}
      </p>

      {items.length ? (
        <div className="grid">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>No sneakers match those filters.</p>
          <Link className="btn ghost" href="/discover">
            Clear filters
          </Link>
        </div>
      )}

      {pages > 1 && (
        <nav className="pager" aria-label="Pagination">
          {page > 1 ? <Link href={href(page - 1)}>← Previous</Link> : <span />}
          <span className="muted">
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={href(page + 1)}>Next →</Link> : <span />}
        </nav>
      )}
    </section>
  );
}
