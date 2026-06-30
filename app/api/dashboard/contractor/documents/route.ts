import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!contractor) return NextResponse.json({ error: "Contractor not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("contractor_documents")
    .select("id, doc_type, file_name, status, notes, created_at, storage_path")
    .eq("contractor_id", contractor.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  return NextResponse.json({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const rl = rateLimit(getIp(request), 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!contractor) return NextResponse.json({ error: "Contractor not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const docType = formData.get("doc_type") as string | null;

  if (!file || !docType) {
    return NextResponse.json({ error: "File and document type are required" }, { status: 400 });
  }

  const ALLOWED_TYPES = ["license", "insurance", "background_check", "certification", "other"];
  if (!ALLOWED_TYPES.includes(docType)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  // 10 MB limit
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${contractor.id}/${docType}_${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadErr } = await supabase.storage
    .from("contractor-documents")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadErr) {
    // Try to create bucket if it doesn't exist
    await supabase.storage.createBucket("contractor-documents", { public: false }).catch(() => {});
    const { error: retryErr } = await supabase.storage
      .from("contractor-documents")
      .upload(path, bytes, { contentType: file.type });
    if (retryErr) return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data, error: dbErr } = await supabase
    .from("contractor_documents")
    .insert({
      contractor_id: contractor.id,
      doc_type: docType,
      file_name: file.name,
      storage_path: path,
      status: "pending",
    })
    .select("id, doc_type, file_name, status, created_at")
    .single();

  if (dbErr) return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
  return NextResponse.json({ document: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("id");
  if (!docId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: contractor } = await supabase
    .from("contractors").select("id").eq("user_id", user.id).single();
  if (!contractor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: doc } = await supabase
    .from("contractor_documents")
    .select("id, storage_path, contractor_id")
    .eq("id", docId)
    .single();

  if (!doc || doc.contractor_id !== contractor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.storage.from("contractor-documents").remove([doc.storage_path]);
  await supabase.from("contractor_documents").delete().eq("id", docId);
  return NextResponse.json({ ok: true });
}
