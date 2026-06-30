import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  try {
    const { photoId } = await params;
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();
    const { error } = await supabase.from("contractor_photos").delete().eq("id", photoId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/contractors/:id/photos/:photoId DELETE]", err);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
