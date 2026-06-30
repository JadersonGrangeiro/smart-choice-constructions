import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCrmEmail } from "@/lib/resend/emails";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { to, toName, subject, body: emailBody } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await sendCrmEmail({ to, toName: toName || to, subject, body: emailBody });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[crm/email]", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
