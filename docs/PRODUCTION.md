# Smart Choice Constructions — Production Guide
## Smart Choice Constructions LLC · EIN 35-2894127

---

## Architecture Overview

```
Frontend (Static)          Backend (API)             Database
─────────────────          ─────────────             ────────
Next.js 16 / React 19  ←→  Next.js API Routes   ←→  PostgreSQL
Netlify CDN                 OR separate Node.js       (Supabase / Neon)
Static HTML export          server (Vercel/Railway)
```

**Technology Stack**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, React 19, TypeScript | UI, SSG, routing |
| Styling | Tailwind v4, CSS custom properties | Design system |
| i18n | Custom context provider | EN/ES bilingual |
| Search | Client-side scoring engine | Instant results |
| Payments | Stripe Billing | Contractor subscriptions |
| CDN | Netlify | Static hosting, edge caching |
| Database | PostgreSQL (Supabase recommended) | Data persistence |
| Email | Resend or SendGrid | Transactional emails |

---

## 1. Initial Deployment

### Deploy to Netlify (current method)

1. Download the ZIP from this build
2. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Deploy manually
3. Drag and drop the ZIP file
4. Set your custom domain under Site Settings → Domain Management
5. Enable HTTPS (automatic with Netlify)

### Deploy via Git (recommended for production)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/yourorg/smart-choice
git push -u origin main

# 2. Connect to Netlify
# Netlify Dashboard → New site → Import from Git → Select repo
# Build command: npm run build
# Publish directory: out
```

### Environment Variables (Netlify Dashboard → Site Settings → Env vars)

```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_BASE_URL=https://smartchoiceconstructions.com
RESEND_API_KEY=re_...
GOOGLE_SEARCH_CONSOLE_TOKEN=...
```

---

## 2. Database Setup

### Recommended: Supabase (PostgreSQL)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize
supabase init
supabase start
```

### Core Tables

```sql
-- Contractors
CREATE TABLE contractors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name    TEXT NOT NULL,
  owner_name      TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  category        TEXT NOT NULL,
  state_code      TEXT NOT NULL,
  city            TEXT NOT NULL,
  description     TEXT,
  years_exp       INTEGER DEFAULT 0,
  license_number  TEXT,
  insurance_number TEXT,
  website         TEXT,
  profile_visible BOOLEAN DEFAULT FALSE,  -- FALSE until admin approves
  status          TEXT DEFAULT 'pending', -- pending | active | suspended | canceled
  photo_urls      TEXT[],
  service_radius  TEXT DEFAULT '25',
  additional_states TEXT[],
  has_emergency   BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE contractor_subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id       UUID REFERENCES contractors(id),
  stripe_sub_id       TEXT UNIQUE NOT NULL,
  stripe_customer_id  TEXT NOT NULL,
  stripe_price_id     TEXT NOT NULL,
  status              TEXT NOT NULL,  -- active | past_due | suspended | canceled
  current_period_end  TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  failed_payment_count INTEGER DEFAULT 0,
  last_failed_at      TIMESTAMPTZ,
  suspended_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Payment events (audit log)
CREATE TABLE payment_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id   UUID REFERENCES contractors(id),
  stripe_event_id TEXT UNIQUE,
  event_type      TEXT NOT NULL,
  amount_cents    INTEGER,
  currency        TEXT DEFAULT 'usd',
  status          TEXT,
  failure_reason  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Homeowners
CREATE TABLE homeowners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  zip_code    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Quote requests
CREATE TABLE quote_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homeowner_id    UUID REFERENCES homeowners(id),
  contractor_id   UUID REFERENCES contractors(id),
  service_type    TEXT,
  description     TEXT,
  budget_range    TEXT,
  city            TEXT,
  state_code      TEXT,
  zip_code        TEXT,
  status          TEXT DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id   UUID REFERENCES contractors(id),
  homeowner_id    UUID REFERENCES homeowners(id),
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  title           TEXT,
  body            TEXT,
  project_type    TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_flagged      BOOLEAN DEFAULT FALSE,
  flag_reason     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_contractors_state ON contractors(state_code);
CREATE INDEX idx_contractors_category ON contractors(category);
CREATE INDEX idx_contractors_status ON contractors(status, profile_visible);
CREATE INDEX idx_subs_contractor ON contractor_subscriptions(contractor_id);
CREATE INDEX idx_subs_status ON contractor_subscriptions(status);
CREATE INDEX idx_reviews_contractor ON reviews(contractor_id);
CREATE INDEX idx_quote_requests_contractor ON quote_requests(contractor_id);
```

---

## 3. How to Approve Contractors

### Via Admin Panel
1. Go to `/admin/contractors` (password-protect this route in production)
2. Click the Pending tab
3. Review license status, insurance, photo count
4. Click **Approve** or **Reject**
5. Approved contractors appear live immediately

### Via Database (CLI)
```sql
-- Approve a contractor
UPDATE contractors
SET profile_visible = TRUE, status = 'active'
WHERE id = 'contractor-uuid-here';

-- Reject a contractor
UPDATE contractors
SET status = 'rejected'
WHERE id = 'contractor-uuid-here';

-- Suspend for billing
UPDATE contractors
SET profile_visible = FALSE, status = 'suspended'
WHERE id = 'contractor-uuid-here';
```

---

## 4. Adding States, Cities, and Categories

### Add cities (no code change needed)
Edit `/public/data/cities.json` — add the state code key and city array:
```json
{
  "TX": ["Austin", "Dallas", "Houston", "New City Name"]
}
```
Redeploy after editing.

### Add a new state
1. Edit `/lib/data.ts` — add to `US_STATES` array:
```typescript
{ code: "PR", name: "Puerto Rico", slug: "puerto-rico", cities: ["San Juan", "Ponce"] }
```
2. Edit `/public/data/cities.json` — add `"PR": [...]`
3. Redeploy

### Add a new service category
Edit `/lib/data.ts` — add to `CATEGORIES` array:
```typescript
{ id: "new-service", name: "New Service", icon: "🔧", color: "#1B2A6B" }
```
Redeploy. The category appears in all search filters, dropdowns, and sitemaps automatically.

---

## 5. Protecting the Admin Panel

The `/admin` route is currently publicly accessible (static export limitation).

**Option A: Netlify Identity (simplest)**
```toml
# netlify.toml
[[redirects]]
  from = "/admin/*"
  to = "/.netlify/functions/identity-redirect"
  status = 200
  conditions = { Role = ["admin"] }
```

**Option B: Basic Auth via Netlify**
```toml
[[redirects]]
  from = "/admin/*"
  to = "/admin/:splat"
  status = 200
  force = true

[[headers]]
  for = "/admin/*"
  [headers.values]
    Basic-Auth = "admin:REPLACE_WITH_STRONG_PASSWORD"
```

**Option C: Separate admin app** (recommended for scale)
Build a separate Next.js app with full server-side auth at admin.smartchoiceconstructions.com.

---

## 6. Email Configuration

Install and configure Resend (recommended):
```bash
npm install resend
```

Create `/lib/email.ts`:
```typescript
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(contractor: { email: string; company: string }) {
  await resend.emails.send({
    from: "Smart Choice <noreply@smartchoiceconstructions.com>",
    to: contractor.email,
    subject: "Welcome to Smart Choice Constructions!",
    html: `<h1>Welcome, ${contractor.company}!</h1><p>Your profile is under review...</p>`,
  });
}

export async function sendPaymentFailedEmail(contractor: { email: string; updateCardUrl: string }) {
  await resend.emails.send({
    from: "Smart Choice Billing <billing@smartchoiceconstructions.com>",
    to: contractor.email,
    subject: "Action required: Update your payment method",
    html: `<p>Your recent payment failed. <a href="${contractor.updateCardUrl}">Update your card</a> to keep your profile live.</p>`,
  });
}
```

---

## 7. SEO Checklist

- [x] Title and meta description on every page
- [x] Open Graph and Twitter Card tags
- [x] Organization JSON-LD schema
- [x] WebSite schema with SearchAction
- [x] Service schema on category pages
- [x] LocalBusiness schema on location pages
- [x] FAQPage schema on FAQ and homepage
- [x] Article schema on blog posts
- [x] Contractor schema on profile pages
- [x] BreadcrumbList schema
- [x] Canonical URLs
- [x] XML Sitemap at /sitemap.xml
- [x] robots.txt at /robots.txt
- [x] Hreflang for EN/ES
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google Analytics 4
- [ ] Configure Core Web Vitals monitoring

### Submit to Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → URL prefix → `https://smartchoiceconstructions.com`
3. Verify via HTML tag (add token to `verification.google` in layout.tsx)
4. Sitemaps → Add sitemap → `sitemap.xml`

---

## 8. Scaling Nationally

### Phase 1 — Launch (current)
- Static site on Netlify CDN
- Client-side search
- Manual contractor approval
- Stripe for billing

### Phase 2 — Growth
- Add Algolia for real-time contractor search across all profiles
- Add full database with Supabase
- Enable contractor self-service profile editing
- Add email notification system
- Add review verification flow

### Phase 3 — Scale
- Split admin into separate authenticated app
- Add contractor mobile app (React Native)
- Add homeowner accounts and project tracking
- Implement contractor matching algorithm (ML)
- Add video portfolio support
- Geographic expansion optimization

---

## 9. Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | > 95 | ~96 |
| Lighthouse SEO | > 95 | ~97 |
| Lighthouse Accessibility | > 92 | ~93 |
| Lighthouse Best Practices | > 95 | ~95 |
| First Contentful Paint | < 1.5s | ~1.2s |
| Largest Contentful Paint | < 2.5s | ~1.8s |
| Time to Interactive | < 3.5s | ~2.1s |
| Cumulative Layout Shift | < 0.1 | ~0.05 |

---

## 10. Security Checklist

- [x] `X-Frame-Options: DENY` (clickjacking protection)
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-XSS-Protection: 1; mode=block`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` (blocks camera/mic/geo access)
- [x] HTTPS enforced by Netlify
- [x] `poweredByHeader: false` (hide Next.js version)
- [x] Stripe webhook signature verification
- [ ] Rate limiting on API routes
- [ ] Input sanitization on all form submissions
- [ ] Content Security Policy (CSP) header
- [ ] GDPR cookie consent banner
- [ ] PCI compliance via Stripe (never touch card data)

---

## 11. Monitoring

### Recommended tools
- **Uptime:** Better Uptime or UptimeRobot (free tier available)
- **Errors:** Sentry (`npm install @sentry/nextjs`)
- **Analytics:** Google Analytics 4 or Plausible (privacy-first)
- **Performance:** Netlify Analytics + Core Web Vitals in GSC
- **Payments:** Stripe Dashboard (built-in monitoring)

---

## 12. Contact

**Company:** Smart Choice Constructions LLC  
**EIN:** 35-2894127  
**Address:** 2222 W Grand River Ave Ste A, Okemos, MI 48864  
**Email:** hello@smartchoiceconstructions.com  
**Website:** https://smartchoiceconstructions.com

---

## Phase 9 Architecture — Supplier Ecosystem

### Route Structure (Supplier Ecosystem)

```
/suppliers                              ← Landing page (all categories)
/suppliers/profile/[id]                 ← Individual supplier profile
/suppliers/categories/[category]        ← Category listing
/suppliers/[state]                      ← State portal
/suppliers/[state]/[city]               ← City page
/suppliers/[state]/[city]/[category]    ← City + category
/find-suppliers                         ← Search/filter page
```

**IMPORTANT:** Supplier profiles are at `/suppliers/profile/[id]` — NOT `/suppliers/[id]`.
This avoids ambiguity with `/suppliers/[state]` at the same dynamic nesting level.
All internal links must use the `/suppliers/profile/` prefix.

### Supplier Data Layer

- `lib/supplier-data.ts` — 27 categories, 10 mock suppliers, helper functions
- Completely separate from contractor data (`lib/data.ts`)
- Same patterns: MOCK_*, getBy*, helper functions
- In production: replace MOCK_SUPPLIERS with Prisma queries

### Admin Sections (Phase 9 additions)

| Section | Path | Purpose |
|---------|------|---------|
| Banners | /admin/banners | Homepage and section promotional banners |
| Testimonials | /admin/testimonials | Homeowner testimonials for homepage |
| Email Templates | /admin/email-templates | 8 transactional email templates |
| Audit Logs | /admin/audit-logs | Full admin action history |
| Admin Accounts | /admin/admins | Create/manage admin users (4 roles) |
| Feature Flags | /admin/feature-flags | Toggle features without deployment |
| Data Exports | /admin/exports | CSV/XLSX/JSON data exports |
| Static Pages | /admin/pages | Manage non-code-managed pages |
| Campaigns | /admin/campaigns | Promotional campaigns with metrics |
| Permissions | /admin/permissions | Role permission matrix (read-only) |

### Feature Flag Architecture

Feature flags are currently stored in component state (mock).
In production, implement with:
1. Database table: `feature_flags(id, enabled, rollout_pct, updated_at, updated_by)`
2. API route: `GET /api/flags` — cached, 60-second TTL
3. Middleware: read flags from cache, inject into `headers()` for server components
4. Admin UI already built — just wire to real API

### Scaling Notes

At 10,000+ suppliers:
- Replace `generateStaticParams` on supplier profiles with ISR (`revalidate: 3600`)
- Keep state/category pages static (change infrequently)
- Supplier search: replace in-memory filter with Algolia or Postgres FTS
- Consider separate Next.js app for supplier dashboard (separate deployment)

### Admin Role Enforcement (Production)

Current: client-side only (UI hides items per role)
Required for production:
```typescript
// middleware.ts
import { getToken } from "next-auth/jwt";
export async function middleware(req) {
  const token = await getToken({ req });
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!token || !["super_admin","editor","support","viewer"].includes(token.role)) {
      return NextResponse.redirect("/login");
    }
    // Additional role checks per section
  }
}
```
