import { NextResponse } from "next/server";

interface ContactBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and logs contact form submissions. Replace the console.log with
 * a real email/CRM integration when one is available; for now this keeps the
 * form fully functional end-to-end as requested.
 */
export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json({ error: "Invalid contact form submission" }, { status: 400 });
  }

  console.log("[contact] new message", { name, email, message, receivedAt: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
