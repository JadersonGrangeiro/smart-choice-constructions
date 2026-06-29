import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { threadId } = await params;
    const supabase = createAdminClient();

    // Verify user has access to this thread
    const { data: thread, error: threadErr } = await supabase
      .from("message_threads")
      .select("id, homeowner_id, contractor_id, contractors(company_name), profiles!homeowner_id(full_name, email)")
      .eq("id", threadId)
      .single();

    if (threadErr || !thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const { data: contractor } = await supabase
      .from("contractors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const isHomeowner = thread.homeowner_id === user.id;
    const isContractor = contractor && thread.contractor_id === contractor.id;

    if (!isHomeowner && !isContractor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Mark unread messages as read for this user
    const unreadIds = (messages ?? [])
      .filter((m: { is_read: boolean; sender_id: string; id: string }) => !m.is_read && m.sender_id !== user.id)
      .map((m: { id: string }) => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadIds);
    }

    return NextResponse.json({ thread, messages: messages ?? [] });
  } catch (err) {
    console.error("[messages/threadId GET]", err);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { threadId } = await params;
    const body = await request.json();
    const { body: messageBody } = body;

    if (!messageBody?.trim()) return NextResponse.json({ error: "Message body required" }, { status: 400 });

    const supabase = createAdminClient();

    // Verify access
    const { data: thread } = await supabase
      .from("message_threads")
      .select("id, homeowner_id, contractor_id")
      .eq("id", threadId)
      .single();

    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const { data: contractor } = await supabase
      .from("contractors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const isHomeowner = thread.homeowner_id === user.id;
    const isContractor = contractor && thread.contractor_id === contractor.id;

    if (!isHomeowner && !isContractor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: message, error } = await supabase
      .from("messages")
      .insert({ thread_id: threadId, sender_id: user.id, body: messageBody.trim() })
      .select()
      .single();

    if (error) throw error;

    // Update thread last_message_at
    await supabase
      .from("message_threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", threadId);

    return NextResponse.json({ message });
  } catch (err) {
    console.error("[messages/threadId POST]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
