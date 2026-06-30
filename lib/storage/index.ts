// Centralized file-upload service.
// Shared by web admin uploads and future mobile API uploads.
// All upload logic lives here — API routes delegate to these functions.

export type UploadBucket =
  | 'contractor-photos'
  | 'supplier-logos'
  | 'banner-images'
  | 'documents'
  | 'avatars'
  | 'general';

export type FileCategory =
  | 'photo'
  | 'document'
  | 'logo'
  | 'avatar'
  | 'banner'
  | 'certificate';

export interface UploadResult {
  path: string;
  publicUrl: string;
  bucket: UploadBucket;
  sizeBytes: number;
  mimeType: string;
}

export interface UploadError {
  code: 'TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'BUCKET_NOT_FOUND';
  message: string;
}

// ── Allowed MIME types per use-case ──────────────────────────────────────────
export const ALLOWED_MIMES = {
  image:    ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  document: ['application/pdf', 'image/jpeg', 'image/png'],
  video:    ['video/mp4', 'video/webm', 'video/quicktime'],
} as const;

// ── Max file sizes (MB) per category ─────────────────────────────────────────
export const MAX_SIZE_MB: Record<FileCategory, number> = {
  photo:       10,
  document:    15,
  logo:         5,
  avatar:       5,
  banner:      10,
  certificate: 15,
};

// ── Validate before uploading ─────────────────────────────────────────────────
export function validateFile(
  file: { size: number; type: string },
  options: { maxSizeMB: number; allowedMimes: readonly string[] },
): { valid: true } | { valid: false; error: UploadError } {
  if (file.size > options.maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: { code: 'TOO_LARGE', message: `File exceeds ${options.maxSizeMB} MB limit` },
    };
  }
  if (!options.allowedMimes.includes(file.type)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_TYPE',
        message: `${file.type} is not allowed. Allowed: ${options.allowedMimes.join(', ')}`,
      },
    };
  }
  return { valid: true };
}

// ── Build a deterministic, collision-free storage path ───────────────────────
// Pattern: {entityId}/{category}/{uuid}.{ext}
export function buildStoragePath(
  entityId: string,
  category: FileCategory,
  originalFilename: string,
): string {
  const ext = originalFilename.split('.').pop()?.toLowerCase() ?? 'bin';
  const uuid = crypto.randomUUID();
  return `${entityId}/${category}/${uuid}.${ext}`;
}

// ── Upload a File/Blob to Supabase Storage (server-side) ─────────────────────
export async function uploadToStorage(
  bucket: UploadBucket,
  path: string,
  file: Blob,
  contentType: string,
): Promise<{ publicUrl: string } | { error: UploadError }> {
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: false });

  if (error) {
    return { error: { code: 'UPLOAD_FAILED', message: error.message } };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}

// ── Delete a file from Supabase Storage ──────────────────────────────────────
export async function deleteFromStorage(bucket: UploadBucket, path: string): Promise<void> {
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = createAdminClient();
  await supabase.storage.from(bucket).remove([path]);
}
