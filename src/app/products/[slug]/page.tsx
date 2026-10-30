import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getProduct, related } from "@/lib/products";
import { imageSrc, money, shortDate } from "@/lib/format";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Not found" };
  const title = `${p.name} · ${p.brand}`;
  const description = p.description.slice(0, 155);
  const img = p.product_images[0];
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title, description, images: img ? [imageSrc(img.image_url)] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const more = await related(p);

  const status =
    p.availability_status === "upcoming"
      ? p.release_date
        ? `Drops ${shortDate(p.release_date)}`
        : "Upcoming"
      : p.availability_status === "available"
        ? "Available now"
        : "Sold out";

  return (
    <>
      <div className="wrap detail">
        <p>
          <Link href="/discover">← All sneakers</Link>
        </p>
        <div className="detail-grid">
          <div className="gallery">
            {p.product_images.length ? (
              p.product_images.map((img, i) => (
                <div className="media" key={img.image_url}>
                  <Image
                    src={imageSrc(img.image_url)}
                    alt={img.alt_text}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 900px) 100vw, 55vw"
                  />
                </div>
              ))
            ) : (
              <div className="media">
                <span className="ph" aria-hidden="true">
                  {p.brand.slice(0, 1)}
                </span>
              </div>
            )}
          </div>

          <div className="info">
            <p className="brand">{p.brand}</p>
            <h1 className="display sm">{p.name}</h1>
            <p className="price big">
              {money(p.price)}
              {p.original_price ? <s>{money(p.original_price)}</s> : null}
            </p>
            <p>
              <span className={`tag tag-${p.availability_status} inline`}>{status}</span>
            </p>
            <dl className="facts">
              <dt>Colour</dt>
              <dd>{p.color}</dd>
              <dt>Category</dt>
              <dd>{p.category}</dd>
              {p.release_date && (
                <>
                  <dt>Release</dt>
                  <dd>{shortDate(p.release_date)}</dd>
                </>
              )}
            </dl>
            <p>{p.description}</p>
            <WaitlistForm productId={p.id} productName={p.name} />
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section className="wrap shelf" aria-labelledby="more">
          <div className="shelf-head">
            <h2 id="more">More {p.category}</h2>
          </div>
          <div className="grid">
            {more.map((m) => (
              <ProductCard key={m.id} p={m} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
