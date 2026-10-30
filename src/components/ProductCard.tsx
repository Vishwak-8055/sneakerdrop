import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { imageSrc, money, shortDate } from "@/lib/format";

const LABEL = { available: "Available", upcoming: "Upcoming", unavailable: "Sold out" } as const;

export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const img = p.product_images[0];
  const tag =
    p.availability_status === "upcoming" && p.release_date
      ? `Drops ${shortDate(p.release_date)}`
      : LABEL[p.availability_status];

  return (
    <article className="card">
      <Link href={`/products/${p.slug}`} className="card-link">
        <div className="media">
          {img ? (
            <Image
              src={imageSrc(img.image_url)}
              alt={img.alt_text}
              fill
              priority={priority}
              sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
            />
          ) : (
            <span className="ph" aria-hidden="true">
              {p.brand.slice(0, 1)}
            </span>
          )}
          <span className={`tag tag-${p.availability_status}`}>{tag}</span>
        </div>
        <div className="meta">
          <p className="brand">{p.brand}</p>
          <h3>{p.name}</h3>
          <p className="price">
            {money(p.price)}
            {p.original_price ? <s>{money(p.original_price)}</s> : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
