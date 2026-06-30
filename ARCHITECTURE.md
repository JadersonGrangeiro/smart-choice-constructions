# Smart Choice Constructions — Architecture Reference

> Last updated: 2026-06-30  
> Platform: Next.js 16 App Router · Supabase · Stripe · Vercel

---

## 1. Overview

Smart Choice Constructions is a B2B/B2C marketplace connecting homeowners with pre-screened contractors and suppliers across the United States. The platform is a **server-side-rendered web application** with a REST API layer that is designed to also serve native Android/iOS mobile clients.

```
┌─────────────────────────────────────────────────────────┐
│  Clients                                                 │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │  Web App │  │ iOS App  │  │    Android App         │ │
│  │ (Next.js)│  │ (Swift)  │  │    (Kotlin/React Native│ │
│  └────┬─────┘  └────┬─────┘  └──────────┬─────────────┘ │
└───────┼─────────────┼────────────────────┼───────────────┘
        │             │                    │
        ▼             ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│  Vercel Edge Network                                     │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Next.js 16 App Router (Node.js runtime)            ││
│  │  proxy.ts middleware (auth guard, role check)       ││
│  │  ┌──────────────┐  ┌──────────────────────────────┐ ││
│  │  │  /app        │  │  /app/api                    │ ││
│  │  │  (SSR pages) │  │  (REST endpoints)            │ ││
│  │  └──────────────┘  └──────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────┘│
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│  Supabase    │ │   Stripe    │ │   Resend     │
│  - PostgreSQL│ │ Subscriptions│ │ Transactional│
│  - Auth/JWT  │ │ Webhooks    │ │ Email        │
│  - Storage   │ │             │ │              │
│  - RLS       │ └─────────────┘ └──────────────┘
└──────────────┘
```

---

## 2. Repository Structure

```
smart-choice-constructions/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Marketing / public pages
│   ├── admin/                    # Admin panel (requires admin role)
│   ├── dashboard/                # Contractor dashboard
│   ├── account/                  # Homeowner account
│   └── api/                      # REST API
│       ├── admin/                # Admin-only endpoints (gated by proxy.ts)
│       ├── auth/                  # Auth helpers
│       ├── contractor/            # Contractor CRUD
│       ├── homeowner/             # Homeowner CRUD
│       ├── public/               # Unauthenticated endpoints
│       ├── stripe/               # Stripe webhooks + checkout
│       └── v1/                   # Mobile-friendly versioned API
│           ├── health/           # GET /api/v1/health
│           ├── me/               # GET|PUT /api/v1/me
│           └── device-tokens/   # POST|DELETE /api/v1/device-tokens
├── lib/
│   ├── supabase/                 # Supabase client factories
│   │   ├── server.ts             # createClient() and createAdminClient()
│   │   └── client.ts             # Browser-side client
│   ├── resend/                   # Transactional email templates + sender
│   ├── notifications/            # Push notification service (FCM/APNs stubs)
│   ├── ai/                       # AI feature abstraction (Claude API stubs)
│   ├── geo/                      # Haversine, bounding-box, sortByDistance
│   └── storage/                  # Supabase Storage upload/delete helpers
├── supabase/
│   ├── schema.sql                # Full DB schema (source of truth)
│   └── migration_006_mobile_ready.sql  # Adds lat/lon, roles, push tables
├── proxy.ts                      # Next.js middleware (auth guard)
└── ARCHITECTURE.md               # This file
```

---

## 3. Database Schema

### Tables (14 total)

| Table | Purpose |
|---|---|
| `profiles` | One row per Supabase auth user. Holds role, name, phone, avatar. |
| `contractors` | Contractor business profile. FK → profiles.id. |
| `contractor_photos` | Portfolio photos for contractors. |
| `contractor_documents` | Insurance / license PDFs for contractors. |
| `contractor_subscriptions` | Active Stripe subscription per contractor. |
| `payment_events` | Stripe event log (idempotent). |
| `homeowners` | Homeowner profile (ZIP, city, state). |
| `quote_requests` | Quote submitted by homeowner → contractor. |
| `reviews` | Homeowner review of contractor. |
| `favorites` | Homeowner → contractor bookmarks. |
| `message_threads` | Conversation between homeowner + contractor. |
| `messages` | Individual messages within a thread. |
| `audit_logs` | Admin action log. |
| `suppliers` | Building supplier business listings. |
| `platform_settings` | Key-value config (maintenance mode, feature flags). |

### Tables added by migration_006

| Table | Purpose |
|---|---|
| `device_tokens` | FCM/APNs tokens per user device. Used by push notifications. |
| `notification_logs` | Record of every push notification sent. |
| `ai_requests` | Log of every AI feature call (for cost tracking). |

### Roles

```sql
-- profiles.role constraint after migration_006:
CHECK (role IN ('customer', 'contractor', 'admin', 'supplier', 'editor', 'support'))
```

| Role | Access |
|---|---|
| `customer` | Homeowner. Can submit quotes, send messages, write reviews. |
| `contractor` | Contractor. Can receive quotes, upload photos/docs. |
| `admin` | Full admin panel + all API admin routes. |
| `editor` | Admin panel (content editing). NOT YET provisioned in UI. |
| `support` | Admin panel (read-only + messaging). NOT YET provisioned in UI. |
| `supplier` | Supplier business profile. |

### Geolocation columns (migration_006)

```sql
-- contractors and suppliers both gain:
latitude  NUMERIC(10,6)
longitude NUMERIC(10,6)
```

These are `NULL` until populated. The `lib/geo` module handles distance math once values are stored.

---

## 4. Authentication

### Web

- Supabase Auth with email/password and magic link.
- `proxy.ts` middleware runs on every request (except static assets and Stripe webhook).
- Session stored in HTTP-only cookies managed by `@supabase/ssr`.
- Protected route groups: `/admin/*`, `/dashboard/*`, `/account/*`, `/api/admin/*`.

### Mobile

Mobile apps authenticate using **Supabase Auth JWT tokens**. The pattern:

1. App calls `supabase.auth.signInWithPassword()` (or social OAuth).
2. Supabase returns `access_token` (JWT) + `refresh_token`.
3. App stores tokens securely (iOS Keychain / Android Keystore).
4. Every API call includes: `Authorization: Bearer <access_token>`.
5. When the access token expires (1 hour), use the refresh token to obtain a new one.

```
// Mobile API calls include this header on every request:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

The `/api/v1/*` endpoints call `supabase.auth.getUser()` which validates the JWT server-side. No additional session cookie is needed.

> **Note:** `proxy.ts` only runs for web requests (Next.js middleware). Mobile clients bypass it entirely — each `/api/v1/` route performs its own auth check.

---

## 5. API Structure

### Public API (no auth)

```
GET  /api/public/contractors          List contractors (search, filter)
GET  /api/public/contractors/[id]     Contractor profile
GET  /api/public/categories           Service categories
GET  /api/public/locations            Location data
POST /api/auth/...                    Auth actions
```

### Authenticated API

```
POST /api/homeowner/quote-requests    Submit a quote
GET  /api/homeowner/quote-requests    List my quotes
GET  /api/contractor/profile          My contractor profile
PUT  /api/contractor/profile          Update profile
POST /api/contractor/photos           Upload photo
GET  /api/messages/threads            My message threads
POST /api/messages/threads/[id]       Send message
```

### Admin API (requires admin/editor/support role)

```
GET|PUT  /api/admin/platform-data     Platform settings, pages, banners
GET      /api/admin/contractors       All contractors
PUT      /api/admin/contractors/[id]  Approve / suspend contractor
GET      /api/admin/reports           Analytics data
GET      /api/admin/admins            Admin user list
GET      /api/admin/suppliers         All suppliers
PUT      /api/admin/suppliers/[id]    Approve / suspend supplier
```

### Stripe API

```
POST /api/stripe/webhook              Stripe event handler (signature verified)
POST /api/stripe/create-checkout      Create checkout session
```

### Mobile API v1 (versioned, auth via Bearer token)

```
GET      /api/v1/health               Service health check (public)
GET      /api/v1/me                   Current user profile + role data
PUT      /api/v1/me                   Update name, phone, avatar_url
POST     /api/v1/device-tokens        Register FCM/APNs push token
DELETE   /api/v1/device-tokens        Unregister push token
```

---

## 6. Stripe Payments

### Contractor subscriptions

1. Contractor completes registration → redirected to Stripe Checkout.
2. Checkout session metadata: `{ type: "contractor", contractor_id: "..." }`.
3. Stripe fires `checkout.session.completed` → `/api/stripe/webhook`.
4. Webhook activates contractor subscription in `contractor_subscriptions`.

### Supplier listings

1. Supplier submits listing form → Stripe Checkout.
2. Checkout metadata: `{ type: "supplier", company_name: "...", email: "...", ... }`.
3. Webhook creates supplier row in `suppliers` table with `status: "pending_approval"`.
4. Admin reviews and approves in admin panel.

### Pricing (test mode)

| Product | Price ID | Amount |
|---|---|---|
| Supplier first month | `price_1To4PpAZn9oVB8aa8KlbFqgK` | $14.90/mo |
| Supplier recurring | `price_1To4PqAZn9oVB8aaqD7tiMSi` | $29.90/mo |

> **Action required:** Complete Stripe account setup (add bank details), then create live mode products and update `STRIPE_SECRET_KEY`, `STRIPE_SUPPLIER_PRICE_FIRST_MONTH`, `STRIPE_SUPPLIER_PRICE_MONTHLY` in Vercel with live values.

---

## 7. File Storage

Supabase Storage is used for all file uploads. The `lib/storage` module provides a typed wrapper.

| Bucket | Contents | Max size |
|---|---|---|
| `contractor-photos` | Portfolio images | 10 MB |
| `documents` | Insurance / license PDFs | 15 MB |
| `supplier-logos` | Supplier logo images | 5 MB |
| `avatars` | Profile photos | 5 MB |
| `banner-images` | Homepage banners | 10 MB |

All storage paths follow: `{entityId}/{category}/{uuid}.{ext}`

---

## 8. Push Notifications

Infrastructure is ready; sending is not yet implemented.

### Architecture

```
lib/notifications/index.ts
  registerDeviceToken(userId, token, platform, deviceId?, appVersion?)
    → inserts into device_tokens table
  sendPushNotification(payload)
    → looks up device_tokens for userId
    → dispatches to FCM (Android) or APNs (iOS)
    → logs to notification_logs table
```

### Mobile integration

```swift
// iOS — after login:
let token = getAPNsToken()
await apiClient.post("/api/v1/device-tokens", body: {
  token: token, platform: "ios", device_id: UIDevice.current.identifierForVendor
})

// On logout:
await apiClient.delete("/api/v1/device-tokens", body: { token: token })
```

### To activate push notifications

1. Set up Firebase project (for Android FCM).
2. Register APNs certificates in Apple Developer portal.
3. Add `FIREBASE_SERVER_KEY` (or FCM v1 service account) to Vercel env vars.
4. Add `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_PRIVATE_KEY` to Vercel env vars.
5. Implement the `sendPushNotification` function body in `lib/notifications/index.ts`.

---

## 9. AI Features

All AI features are stubbed in `lib/ai/index.ts`. Each call logs to `ai_requests` for cost tracking. To activate any feature:

1. Add `ANTHROPIC_API_KEY` to Vercel env vars.
2. Uncomment and implement the relevant function body.

| Feature | Function | Status |
|---|---|---|
| Category suggestion | `suggestCategory()` | Stub |
| Description generation | `generateDescription()` | Stub |
| Photo analysis | `analyzePhoto()` | Stub |
| Contractor recommendation | `recommendContractors()` | Stub |
| Article generation | `generateArticle()` | Stub |
| Content moderation | `moderateContent()` | Stub |

---

## 10. Geolocation

`lib/geo/index.ts` provides:

- `distanceMiles(a, b)` — Haversine formula, precise great-circle distance.
- `boundingBox(center, radiusMiles)` — Use for SQL `WHERE latitude BETWEEN` pre-filter.
- `sortByDistance(items, from)` — Sort any array with lat/lon fields.

Coordinates are stored in `contractors.latitude/longitude` and `suppliers.latitude/longitude` (added by migration_006). Populate these via geocoding ZIP codes at registration time (no geocoding service is wired yet — this is the next step to enable proximity search).

---

## 11. Mobile App Recommendations

### Tech stack

| Platform | Recommendation | Reason |
|---|---|---|
| iOS | Swift + SwiftUI | Native performance, best APNs integration |
| Android | Kotlin + Jetpack Compose | Native performance, best FCM integration |
| Cross-platform | React Native + Expo | Fastest to market, can share business logic with web |

### Authentication setup (React Native example)

```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabase = createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_ANON_KEY',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

### Calling the API from mobile

```typescript
const session = await supabase.auth.getSession()
const accessToken = session.data.session?.access_token

const response = await fetch('https://smartchoiceconstructions.com/api/v1/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
})
const { profile } = await response.json()
```

---

## 12. Environment Variables

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Never expose to client |
| `STRIPE_SECRET_KEY` | Server only | Rotate after sharing |
| `STRIPE_WEBHOOK_SECRET` | Webhook handler | From Stripe Dashboard |
| `STRIPE_SUPPLIER_PRICE_FIRST_MONTH` | Checkout | `price_1To4Pp...` |
| `STRIPE_SUPPLIER_PRICE_MONTHLY` | Checkout | `price_1To4Pq...` |
| `RESEND_API_KEY` | Email | Resend dashboard |
| `NEXT_PUBLIC_SITE_URL` | Auth redirects | Production URL |

---

## 13. Pending Actions

### Required before launch

- [ ] Run `supabase/migration_006_mobile_ready.sql` in Supabase SQL editor.
- [ ] Complete Stripe account setup (bank details) and switch to live mode.
- [ ] Create live mode Stripe products + update Vercel env vars.
- [ ] Rotate `STRIPE_SECRET_KEY` — test key was shared in development.

### For mobile app development

- [ ] Implement `sendPushNotification()` in `lib/notifications/index.ts`.
- [ ] Wire geocoding at contractor/supplier registration (populate lat/lon).
- [ ] Create `/api/v1/contractors` endpoint (list with geo filter).
- [ ] Create `/api/v1/quotes` endpoint (mobile quote submission).
- [ ] Implement AI features in `lib/ai/index.ts` as needed.

### Future roles

- [ ] Build UI for provisioning `editor` and `support` role users.
- [ ] `editor` role: access to admin content sections (pages, banners, articles).
- [ ] `support` role: access to admin messages, quote requests, read-only dashboards.
