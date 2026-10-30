"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/discover?status=available&sort=newest", label: "New arrivals" },
  { href: "/discover?status=upcoming", label: "Upcoming drops" },
  { href: "/#story", label: "About" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);

  return (
    <header className="nav">
      <div className="wrap nav-row">
        <Link href="/" className="logo">
          SNEAKER<b>DROP</b>
        </Link>
        <button className="burger" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
        <nav id="menu" aria-label="Primary" data-open={open}>
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
