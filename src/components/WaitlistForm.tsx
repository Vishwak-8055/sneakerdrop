"use client";

import { useState, type FormEvent } from "react";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "ok" | "error"; message: string };

export function WaitlistForm({ productId, productName }: { productId: string; productName: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email: data.get("email"), website: data.get("website") }),
      });
      const body = (await res.json()) as { message?: string; error?: string };
      if (res.ok) {
        form.reset();
        setState({ kind: "ok", message: body.message ?? "You’re on the list." });
      } else {
        setState({ kind: "error", message: body.error ?? "Something went wrong. Try again." });
      }
    } catch {
      setState({ kind: "error", message: "Network error. Check your connection and try again." });
    }
  }

  const failed = state.kind === "error";
  return (
    <form className="waitlist" onSubmit={onSubmit} noValidate={false}>
      <h2>Join the waitlist</h2>
      <label htmlFor="wl-email">Email for the {productName} waitlist</label>
      <div className="row">
        <input
          id="wl-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={failed}
          aria-describedby="wl-status"
        />
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button className="btn" type="submit" disabled={state.kind === "loading"}>
          {state.kind === "loading" ? "Joining…" : "Join"}
        </button>
      </div>
      <p id="wl-status" role="status" aria-live="polite" className={state.kind === "ok" ? "ok" : failed ? "bad" : ""}>
        {state.kind === "ok" || state.kind === "error" ? state.message : ""}
      </p>
    </form>
  );
}
