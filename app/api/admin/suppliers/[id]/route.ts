import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("suppliers")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/suppliers PATCH]", err);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "supplier_delete",
      entity_type: "supplier",
      entity_id: id,
      details: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/suppliers DELETE]", err);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}
