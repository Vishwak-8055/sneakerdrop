"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="wrap state">
      <h1 className="display sm">That didn’t load.</h1>
      <p>Something went wrong on our side. Try again in a moment.</p>
      <button className="btn" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
