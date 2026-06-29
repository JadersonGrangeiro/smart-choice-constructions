# Media & File Storage Architecture
## Smart Choice Constructions LLC

---

## Overview

Smart Choice Constructions requires storage for:
- Contractor profile photos and portfolio images
- Contractor cover images and logos
- Before/after project photos
- Video thumbnails and embed metadata
- Verification documents (licenses, COIs, background reports, IDs)
- Partner/supplier logos and product images
- Platform assets (OG images, blog images)

---

## Current State (Static Build)

The current build is a static Next.js export deployed to Netlify. File uploads in the UI exist as interface elements, but without a backend server, files cannot be persisted. This is intentional for the initial launch phase — the UI is ready; the storage backend connects when needed.

---

## Recommended Architecture: Cloudflare R2 + Signed URLs

### Why Cloudflare R2

| Feature | R2 | AWS S3 |
|---------|----|----|
| Egress fees | **$0** | $0.09/GB |
| Storage cost | $0.015/GB/mo | $0.023/GB/mo |
| S3-compatible API | ✓ | ✓ |
| Global CDN | ✓ (via Cloudflare) | Requires CloudFront |
| HIPAA / SOC 2 | ✓ | ✓ |

For a marketplace with potentially millions of contractor images, zero egress fees save thousands of dollars per month at scale.

### Architecture Diagram

```
Contractor/Partner Browser
        │
        │  1. Request upload URL
        ▼
Next.js API Route (/api/storage/presign)
        │
        │  2. Generate signed upload URL (expires in 5 min)
        ▼
Cloudflare R2 (via S3-compatible API)
        │
        │  3. Browser uploads directly to R2 (no server proxy)
        ▼
Cloudflare CDN
        │
        │  4. Serve optimized images globally
        ▼
End User Browser
```

### Key Properties

- **Contractors upload directly to R2** — the API server generates a signed URL; the browser POSTs directly. The file never passes through your server, reducing bandwidth costs and latency.
- **All public media** (photos, logos, cover images) served via Cloudflare CDN — sub-100ms globally.
- **Verification documents** stored in a **private bucket** — only accessible via time-limited signed URLs generated server-side. Never publicly exposed.

---

## Bucket Structure

```
r2://smartchoice-public/
├── contractors/
│   ├── {contractorId}/
│   │   ├── logo.{ext}             # Company logo
│   │   ├── cover.{ext}            # Cover image
│   │   ├── portfolio/
│   │   │   ├── {uuid}.{ext}       # Portfolio photos
│   │   │   └── ...
│   │   └── before-after/
│   │       ├── {uuid}-before.{ext}
│   │       └── {uuid}-after.{ext}
├── partners/
│   ├── {partnerId}/
│   │   ├── logo.{ext}
│   │   ├── cover.{ext}
│   │   └── gallery/
│   │       └── {uuid}.{ext}
└── platform/
    ├── og-image.jpg
    ├── blog/
    │   └── {slug}/cover.{ext}
    └── banners/
        └── {uuid}.{ext}

r2://smartchoice-private/          ← PRIVATE BUCKET (no public access)
└── documents/
    └── {contractorId}/
        ├── {docId}-license.pdf
        ├── {docId}-coi.pdf
        ├── {docId}-background.pdf
        └── {docId}-id.{ext}
```

---

## Image Optimization

### Cloudflare Images (recommended)

Cloudflare Images transforms images on the fly via URL parameters:

```
# Original upload
https://pub-xxx.r2.dev/contractors/1/portfolio/abc123.jpg

# Transformed (resized, WebP, optimized)
https://imagedelivery.net/xxx/contractors/1/portfolio/abc123/public
https://imagedelivery.net/xxx/contractors/1/portfolio/abc123/thumbnail   # 300x200
https://imagedelivery.net/xxx/contractors/1/portfolio/abc123/cover       # 1200x400
https://imagedelivery.net/xxx/contractors/1/portfolio/abc123/card        # 600x400
```

Define variants in Cloudflare Dashboard → Images → Variants:

| Variant | Width | Height | Fit | Use |
|---------|-------|--------|-----|-----|
| `public` | 2000 | - | Scale down | Full size |
| `thumbnail` | 300 | 200 | Crop | Gallery grid |
| `cover` | 1200 | 400 | Crop | Cover image |
| `card` | 600 | 400 | Crop | Search results |
| `avatar` | 200 | 200 | Crop | Profile avatar |
| `og` | 1200 | 630 | Crop | Open Graph |

### Alternative: Next.js Image + Cloudflare Workers

If staying in the Next.js ecosystem, use `next/image` with a Cloudflare Worker as the loader. Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudflare-image-loader.ts",
  },
};
```

---

## Implementation: Upload Flow

### 1. API Route — Generate Signed URL

```typescript
// app/api/storage/presign/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const r2 = new S3Client({
  region:   "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const { contractorId, fileType, bucket } = await req.json();

  // Validate session — only the contractor can upload to their own folder
  // const session = await getServerSession(); // NextAuth / Clerk
  // if (session.user.id !== contractorId) return new Response("Forbidden", { status: 403 });

  // Validate file type
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!ALLOWED_TYPES.includes(fileType)) {
    return new Response("Invalid file type", { status: 400 });
  }

  const key = `contractors/${contractorId}/portfolio/${randomUUID()}`;
  const bucketName = bucket === "private" ? "smartchoice-private" : "smartchoice-public";

  const command = new PutObjectCommand({
    Bucket:      bucketName,
    Key:         key,
    ContentType: fileType,
    // Max 10 MB
    ContentLength: 10 * 1024 * 1024,
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 300 }); // 5 min

  return Response.json({ url, key });
}
```

### 2. Frontend — Upload Component

```typescript
// In ContractorProfileClient or dashboard upload form
async function uploadPhoto(file: File) {
  // Step 1: Get signed URL
  const { url, key } = await fetch("/api/storage/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contractorId: "1", fileType: file.type, bucket: "public" }),
  }).then(r => r.json());

  // Step 2: Upload directly to R2
  await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  // Step 3: Save the key to the database
  await fetch("/api/contractor/photos", {
    method: "POST",
    body: JSON.stringify({ key }),
  });

  return `https://pub-xxx.r2.dev/${key}`;
}
```

---

## Document Storage (Private)

Verification documents must never be publicly accessible.

```typescript
// Generate a time-limited download URL for admin review
// app/api/admin/documents/[id]/download/route.ts
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Verify admin session
  // const session = await getAdminSession(req);
  // if (!session) return new Response("Forbidden", { status: 403 });

  const command = new GetObjectCommand({
    Bucket: "smartchoice-private",
    Key:    `documents/${params.id}`,
  });

  // URL expires in 15 minutes — admin can view but URL can't be shared long-term
  const url = await getSignedUrl(r2, command, { expiresIn: 900 });

  return Response.json({ url });
}
```

---

## Video Support

Videos are stored externally (YouTube or Vimeo) and embedded via iframe. This is the correct approach for video — self-hosting video is expensive and complex.

**Contractor video flow:**
1. Contractor uploads video to their YouTube/Vimeo channel
2. In dashboard, contractor pastes the video URL or ID
3. Platform extracts the video ID and stores it in the database
4. Public profile renders an embed iframe

**Why not self-host:**
- 1 hour of HD video ≈ 1–4 GB of storage
- Video transcoding (multiple resolutions) requires significant CPU
- CDN delivery of video costs $0.02–0.05/GB
- YouTube/Vimeo handle all of this for free and are trusted by viewers

---

## File Size Limits

| File Type | Max Size | Format | Enforced By |
|-----------|----------|--------|-------------|
| Profile photo | 5 MB | JPG, PNG, WebP | API validation + S3 ContentLength |
| Portfolio photo | 10 MB | JPG, PNG, WebP | API validation |
| Cover image | 10 MB | JPG, PNG | API validation |
| Contractor license | 10 MB | PDF, JPG, PNG | API validation |
| Certificate of Insurance | 15 MB | PDF | API validation |
| Background check | 10 MB | PDF | API validation |
| Government ID | 5 MB | JPG, PNG, PDF | API validation |

---

## Environment Variables Required

```bash
# Cloudflare R2
CF_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_PUBLIC_BUCKET=smartchoice-public
R2_PRIVATE_BUCKET=smartchoice-private
R2_PUBLIC_URL=https://pub-xxx.r2.dev  # Custom domain recommended

# Cloudflare Images (optional — for transformation)
CF_IMAGES_TOKEN=your_images_token
CF_IMAGES_ACCOUNT_HASH=your_account_hash
```

---

## Cost Estimate at Scale

| Metric | Value | Monthly Cost |
|--------|-------|-------------|
| 100,000 contractor photos @ 1 MB avg | 100 GB storage | $1.50 |
| 500,000 page loads serving images | Egress: $0 (R2) | $0.00 |
| 50,000 document uploads @ 2 MB avg | 100 GB storage | $1.50 |
| Cloudflare Images transformations | 10M operations | $5.00 |
| **Total** | | **~$8/month** |

Comparison: AWS S3 + CloudFront for the same workload ≈ $180/month (egress costs).

---

## Migration Path

When ready to connect storage:

1. Create Cloudflare account and enable R2
2. Create two buckets: `smartchoice-public` and `smartchoice-private`
3. Add environment variables to Netlify (Site Settings → Environment Variables)
4. Install AWS SDK: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
5. Deploy the API route at `/api/storage/presign`
6. Update upload buttons in dashboard to call the presign API
7. Store returned keys in your database
8. Update profile pages to construct CDN URLs from stored keys
