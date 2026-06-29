import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { status, admin_notes } = body;

    if (!status || !["approved", "rejected", "expired"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: doc, error: fetchErr } = await supabase
      .from("contractor_documents")
      .select("*, contractors(id, company_name, is_licensed, is_insured)")
      .eq("id", id)
      .single();

    if (fetchErr || !doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const updates: Record<string, unknown> = {
      status,
      admin_notes: admin_notes ?? null,
      verified_at: status === "approved" ? new Date().toISOString() : null,
      verified_by: status === "approved" ? user.id : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("contractor_documents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update contractor license/insurance flags based on doc type
    if (status === "approved" && doc.doc_type === "license") {
      await supabase
        .from("contractors")
        .update({ is_licensed: true })
        .eq("id", doc.contractor_id);
    }
    if (status === "approved" && doc.doc_type === "insurance") {
      await supabase
        .from("contractors")
        .update({ is_insured: true })
        .eq("id", doc.contractor_id);
    }
    if (status === "rejected" && doc.doc_type === "license") {
      await supabase
        .from("contractors")
        .update({ is_licensed: false })
        .eq("id", doc.contractor_id);
    }

    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: `document_${status}`,
      entity_type: "contractor_document",
      entity_id: id,
      details: { doc_type: doc.doc_type, contractor_id: doc.contractor_id, admin_notes },
    });

    return NextResponse.json({ document: data });
  } catch (err) {
    console.error("[admin/documents PATCH]", err);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}
