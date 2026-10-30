import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap state">
      <h1 className="display sm">No pair here.</h1>
      <p>The page you’re after doesn’t exist or has moved.</p>
      <Link className="btn" href="/discover">
        Back to Discover
      </Link>
    </section>
  );
}
