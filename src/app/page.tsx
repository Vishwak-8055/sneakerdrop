import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, featured, newest, upcoming, type Product } from "@/lib/products";
import { shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function Shelf({ title, href, items }: { title: string; href: string; items: Product[] }) {
  if (!items.length) return null;
  const id = `shelf-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section className="wrap shelf" aria-labelledby={id}>
      <div className="shelf-head">
        <h2 id={id}>{title}</h2>
        <Link href={href}>View all →</Link>
      </div>
      <div className="grid">
        {items.map((p, i) => (
          <ProductCard key={p.id} p={p} priority={title === "Featured" && i === 0} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const [hot, fresh, soon] = await Promise.all([featured(3), newest(4), upcoming(3)]);
  const next = soon[0];

  return (
    <>
      <section className="wrap hero">
        <p className="eyebrow">Sneaker discovery, edited</p>
        <h1 className="display">
          Drops worth <em>waiting</em> for.
        </h1>
        <p className="lede">
          What’s out, what’s next and the day it lands, tracked pair by pair. Join a waitlist and be first through the door.
        </p>
        <div className="row">
          <Link className="btn" href="/discover">
            Discover the line-up
          </Link>
          {next && (
            <Link className="btn ghost" href={`/products/${next.slug}`}>
              Next drop: {next.name}
              {next.release_date ? ` · ${shortDate(next.release_date)}` : ""}
            </Link>
          )}
        </div>
      </section>

      <Shelf title="Featured" href="/discover" items={hot} />
      <Shelf title="New arrivals" href="/discover?status=available&sort=newest" items={fresh} />
      <Shelf title="Upcoming drops" href="/discover?status=upcoming" items={soon} />
      {!hot.length && !fresh.length && !soon.length && <p className="wrap empty">Nothing is listed yet. Check back soon.</p>}

      <section id="story" className="wrap story">
        <p className="eyebrow">Why we exist</p>
        <h2 className="display sm">Most release calendars are noise.</h2>
        <div>
          <p>
            SneakerDrop keeps one list: the pairs that earn a place, with the facts that matter. Materials, colourway,
            price and the date it lands.
          </p>
          <p>No countdown theatre and no resale hype. If a pair interests you, join its waitlist and register your interest.</p>
        </div>
      </section>

      <section className="wrap tiles" aria-labelledby="lanes">
        <h2 id="lanes">Find your lane</h2>
        <ul>
          {CATEGORIES.map((c) => (
            <li key={c}>
              <Link href={`/discover?category=${c}`}>{c}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap cta">
        <h2 className="display sm">Don’t miss the next one.</h2>
        <Link className="btn" href="/discover?status=upcoming">
          See upcoming drops
        </Link>
      </section>
    </>
  );
}
