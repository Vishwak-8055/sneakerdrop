import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import Link from "next/link";
import { SITE_URL } from "@/lib/format";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SneakerDrop · Drops worth waiting for", template: "%s · SneakerDrop" },
  description: "What’s out, what’s next and the day it lands. Premium sneaker discovery with a waitlist for every pair.",
  openGraph: { siteName: "SneakerDrop", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <footer className="foot">
          <div className="wrap foot-row">
            <p className="logo">
              SNEAKER<b>DROP</b>
            </p>
            <nav aria-label="Footer">
              <Link href="/discover">Discover</Link>
              <Link href="/discover?status=upcoming">Upcoming drops</Link>
              <Link href="/#story">About</Link>
            </nav>
            <p className="muted">© {new Date().getFullYear()} SneakerDrop</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
