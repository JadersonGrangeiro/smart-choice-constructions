// POST /api/v1/device-tokens  — register a device for push notifications
// DELETE /api/v1/device-tokens — unregister a device token
//
// Mobile apps call POST after login with the FCM/APNs token.
// Call DELETE on logout or when the OS revokes the token.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerDeviceToken, unregisterDeviceToken } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    token?: string;
    platform?: string;
    device_id?: string;
    app_version?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.token || typeof body.token !== "string") {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }
  if (!body.platform || !["ios", "android", "web"].includes(body.platform)) {
    return NextResponse.json(
      { error: "platform must be 'ios', 'android', or 'web'" },
      { status: 400 },
    );
  }

  const result = await registerDeviceToken(
    user.id,
    body.token,
    body.platform as "ios" | "android" | "web",
    body.device_id,
    body.app_version,
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ registered: true });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { token?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.token || typeof body.token !== "string") {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const result = await unregisterDeviceToken(body.token);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ unregistered: true });
}
