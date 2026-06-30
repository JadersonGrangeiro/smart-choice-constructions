import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_BUCKETS = ["contractor-photos", "supplier-logos", "banner-images", "general"] as const;
type Bucket = typeof ALLOWED_BUCKETS[number];

async function ensureBucket(supabase: ReturnType<typeof createAdminClient>, bucket: Bucket) {
  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  });
  // Ignore "already exists" error
  if (error && !error.message.includes("already exists") && !error.message.includes("duplicate")) {
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    // Auth check
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as Bucket | null) ?? "general";
    const folder = (formData.get("folder") as string | null) ?? "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_BUCKETS.includes(bucket)) return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Create bucket if it doesn't exist
    await ensureBucket(supabase, bucket);

    // Build a unique file path
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const path = folder
      ? `${folder}/${timestamp}-${random}.${ext}`
      : `${timestamp}-${random}.${ext}`;

    // Convert File to ArrayBuffer for upload
    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, uint8, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, path, bucket });
  } catch (err) {
    console.error("[admin/upload POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
