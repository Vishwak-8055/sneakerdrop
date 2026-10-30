import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/supabase";

const schema = z.object({
  productId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email().max(254),
  website: z.string().optional().nullable(), // honeypot: real visitors never fill this in
});

const json = (body: Record<string, string>, status: number) => NextResponse.json(body, { status });

export async function POST(req: Request) {
  // Same-origin only: a cross-site form post carries a foreign Origin header.
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {}
    if (originHost !== host) return json({ error: "Forbidden." }, 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "Enter a valid email address." }, 422);
  const { productId, email, website } = parsed.data;

  if (website) return json({ message: "You’re on the list for this drop." }, 201); // bot: pretend success

  const { error } = await db().from("waitlist_subscriptions").insert({ product_id: productId, email });
  if (!error) return json({ message: "You’re on the list for this drop." }, 201);

  if (error.code === "23505") return json({ error: "You’re already on the list for this pair." }, 409);
  if (error.code === "23503") return json({ error: "That sneaker doesn’t exist." }, 404);
  if (error.code === "23514") return json({ error: "Enter a valid email address." }, 422);
  console.error("waitlist insert failed", error.code, error.message);
  return json({ error: "Something went wrong. Please try again shortly." }, 500);
}
