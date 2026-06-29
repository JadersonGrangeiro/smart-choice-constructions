-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: Demo Seed Data
-- Users created via Supabase Admin API (auth.users populated externally)
-- Run in Supabase SQL Editor after creating the 3 demo auth users
--
-- Demo credentials (for testing only):
--   Customer:    sarah.mitchell@demosc.com  / Demo@SC2025!
--   Contractor:  marcus.rivera@demosc.com   / Demo@SC2025!
--   Supplier:    buildright.supply@demosc.com / Demo@SC2025!
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Fix profiles created by trigger ───────────────────────────────────────

UPDATE public.profiles
SET full_name = 'Sarah Mitchell',
    phone     = '+1 (512) 555-0247',
    role      = 'customer',
    updated_at = now()
WHERE email = 'sarah.mitchell@demosc.com';

UPDATE public.profiles
SET full_name = 'Marcus Rivera',
    phone     = '+1 (214) 555-0183',
    role      = 'contractor',
    updated_at = now()
WHERE email = 'marcus.rivera@demosc.com';

UPDATE public.profiles
SET full_name = 'BuildRight Supply Co.',
    phone     = '+1 (469) 555-0312',
    role      = 'supplier',
    updated_at = now()
WHERE email = 'buildright.supply@demosc.com';

-- ── 2. Homeowner record for Sarah ────────────────────────────────────────────

INSERT INTO public.homeowners (id, zip_code, city, state_code)
SELECT id, '78701', 'Austin', 'TX'
FROM public.profiles
WHERE email = 'sarah.mitchell@demosc.com'
ON CONFLICT (id) DO UPDATE SET
  zip_code = '78701', city = 'Austin', state_code = 'TX', updated_at = now();

-- ── 3. Contractor record for Marcus Rivera / ProBuild Solutions ───────────────

INSERT INTO public.contractors (
  user_id, company_name, owner_first_name, owner_last_name,
  email, phone, category,
  state_code, city, zip_code, service_radius, additional_states,
  description, website,
  working_days, open_time, close_time, has_emergency,
  license_number, insurance_number, years_experience,
  is_licensed, is_insured, is_background_checked,
  status, profile_visible,
  ranking_score, response_time_hours,
  approved_at, created_at, updated_at
)
SELECT
  p.id,
  'ProBuild Solutions',
  'Marcus',
  'Rivera',
  'marcus.rivera@demosc.com',
  '+1 (214) 555-0183',
  'general-contractor',
  'TX', 'Austin', '78758', '50',
  ARRAY['TX'],
  $$ProBuild Solutions is Austin's most trusted general contracting firm, with over 14 years of experience delivering exceptional results for homeowners and commercial clients alike. We specialize in kitchen and bathroom remodels, full home renovations, additions, and new construction. Every project is handled with transparency, quality craftsmanship, and on-time delivery. We are fully licensed, insured, and background-checked. Our team takes pride in building lasting relationships with our clients — most of our business comes from referrals, which speaks volumes about the trust we've earned.$$,
  'https://probuildsolucoes.example.com',
  ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  '07:00', '18:00', true,
  'GC-TX-2024-018843',
  'INS-TX-4927-2024',
  14,
  true, true, true,
  'active', true,
  87.5, 2.5,
  now() - interval '60 days',
  now() - interval '90 days',
  now()
FROM public.profiles p
WHERE p.email = 'marcus.rivera@demosc.com'
ON CONFLICT DO NOTHING;

-- ── 4. Contractor Photos ──────────────────────────────────────────────────────

INSERT INTO public.contractor_photos (contractor_id, storage_path, public_url, caption, sort_order)
SELECT
  c.id,
  v.storage_path,
  v.public_url,
  v.caption,
  v.sort_order
FROM public.contractors c
CROSS JOIN (VALUES
  ('demo/probuild/kitchen-1.jpg', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 'Complete kitchen remodel – South Austin', 1),
  ('demo/probuild/bathroom-1.jpg', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80', 'Master bathroom renovation – Cedar Park', 2),
  ('demo/probuild/living-1.jpg', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'Open-plan living room addition', 3),
  ('demo/probuild/exterior-1.jpg', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80', 'Full exterior renovation – Lakeway', 4),
  ('demo/probuild/deck-1.jpg', 'https://images.unsplash.com/photo-1591357848757-10b9f4aee5c7?w=800&q=80', 'Custom deck and pergola build', 5)
) AS v(storage_path, public_url, caption, sort_order)
WHERE c.email = 'marcus.rivera@demosc.com'
ON CONFLICT DO NOTHING;

-- ── 5. Contractor Subscription ────────────────────────────────────────────────

INSERT INTO public.contractor_subscriptions (
  contractor_id, stripe_subscription_id, stripe_customer_id, stripe_price_id,
  status, current_period_start, current_period_end,
  cancel_at_period_end, failed_payment_count,
  created_at, updated_at
)
SELECT
  c.id,
  'sub_demo_probuild_001',
  'cus_demo_probuild_001',
  'price_1TnhOEAZn9oVB8aaajDow5Gt',
  'active',
  now() - interval '15 days',
  now() + interval '15 days',
  false, 0,
  now() - interval '60 days',
  now()
FROM public.contractors c
WHERE c.email = 'marcus.rivera@demosc.com'
ON CONFLICT (stripe_subscription_id) DO NOTHING;

-- ── 6. Reviews for ProBuild Solutions ────────────────────────────────────────

INSERT INTO public.reviews (
  contractor_id, homeowner_id, reviewer_name,
  rating, title, body, project_type,
  is_verified, is_published, created_at
)
SELECT
  c.id,
  NULL,
  v.reviewer_name,
  v.rating, v.title, v.body, v.project_type,
  true, true,
  now() - (v.days_ago || ' days')::interval
FROM public.contractors c
CROSS JOIN (VALUES
  ('Jennifer M.', 5, 'Transformed our kitchen beyond expectations',
   'Marcus and his team did an incredible job on our kitchen remodel. From demo to final touches, every step was communicated clearly. The craftsmanship is outstanding and they finished two days ahead of schedule. Highly recommend!',
   'Kitchen Remodel', 45),
  ('Carlos R.', 5, 'Best contractor in Austin, hands down',
   'We hired ProBuild for a master bathroom renovation and a laundry room addition. Marcus was professional from the first meeting, the quote was detailed and accurate, and the crew was respectful of our home. Zero surprises. Will hire again.',
   'Bathroom Renovation', 60),
  ('Amanda T.', 5, 'Exceptional quality and communication',
   'Our home addition project was complex but Marcus handled everything — permits, subcontractors, inspections. We always knew what was happening. The addition blends perfectly with our existing home. 5 stars without hesitation.',
   'Home Addition', 75),
  ('Robert K.', 4, 'Great work, minor delay on materials',
   'Very happy with the deck and pergola build. The design suggestions Marcus offered were better than what we originally planned. Only minor issue was a 3-day delay waiting for custom lumber, but they kept us informed throughout.',
   'Deck & Pergola', 30),
  ('Lisa F.', 5, 'Honest pricing, beautiful results',
   'Got three quotes for our full bathroom remodel. Marcus was not the cheapest, but his quote was the most detailed and he clearly understood what we wanted. Zero upsells, zero surprises. The bathroom looks like something out of a magazine.',
   'Bathroom Remodel', 20),
  ('David W.', 5, 'Complete home renovation — absolutely stunning',
   'We hired ProBuild for a full interior renovation of our 1980s home. New kitchen, two bathrooms, flooring throughout, and updated electrical. The transformation is unbelievable. Every trade they brought in was as professional as Marcus himself.',
   'Full Home Renovation', 90)
) AS v(reviewer_name, rating, title, body, project_type, days_ago)
WHERE c.email = 'marcus.rivera@demosc.com'
ON CONFLICT DO NOTHING;

-- Also add Sarah's review
INSERT INTO public.reviews (
  contractor_id, homeowner_id, reviewer_name,
  rating, title, body, project_type,
  is_verified, is_published, created_at
)
SELECT
  c.id,
  h.id,
  'Sarah M.',
  5,
  'Outstanding kitchen remodel',
  'Marcus and his team transformed our dated kitchen into a modern showpiece. They were on time, respectful, and the quality of work exceeded our expectations. I have already recommended ProBuild to four of my neighbors.',
  'Kitchen Remodel',
  true, true,
  now() - interval '10 days'
FROM public.contractors c, public.profiles h
WHERE c.email = 'marcus.rivera@demosc.com'
AND h.email = 'sarah.mitchell@demosc.com'
ON CONFLICT DO NOTHING;

-- ── 7. Quote Requests ─────────────────────────────────────────────────────────

INSERT INTO public.quote_requests (
  homeowner_id, contractor_id,
  service_type, description, budget_range,
  city, state_code, zip_code,
  contact_name, contact_email, contact_phone,
  status, created_at
)
SELECT
  h.id,
  c.id,
  v.service_type, v.description, v.budget_range,
  v.city, 'TX', v.zip,
  'Sarah Mitchell', 'sarah.mitchell@demosc.com', '+1 (512) 555-0247',
  v.status,
  now() - (v.days_ago || ' days')::interval
FROM public.profiles h, public.contractors c
CROSS JOIN (VALUES
  ('Kitchen Remodel', 'Full kitchen renovation: new cabinets, countertops (quartz), backsplash, sink, and fixtures. Approximately 220 sq ft.', '$15,000 – $25,000', 'Austin', '78701', 'completed', 15),
  ('Bathroom Renovation', 'Master bathroom: tile shower, double vanity, soaking tub. Need full demo and rebuild.', '$10,000 – $18,000', 'Austin', '78703', 'responded', 5),
  ('Deck & Patio', 'Build a 400 sq ft composite deck with pergola and built-in seating. Backyard project.', '$8,000 – $14,000', 'Austin', '78704', 'pending', 2)
) AS v(service_type, description, budget_range, city, zip, status, days_ago)
WHERE h.email = 'sarah.mitchell@demosc.com'
AND c.email = 'marcus.rivera@demosc.com'
ON CONFLICT DO NOTHING;

-- ── 8. Favorites ──────────────────────────────────────────────────────────────

INSERT INTO public.favorites (homeowner_id, contractor_id)
SELECT h.id, c.id
FROM public.profiles h, public.contractors c
WHERE h.email = 'sarah.mitchell@demosc.com'
AND c.email = 'marcus.rivera@demosc.com'
ON CONFLICT DO NOTHING;

-- ── 9. Message Thread & Messages ─────────────────────────────────────────────

INSERT INTO public.message_threads (homeowner_id, contractor_id, last_message_at)
SELECT h.id, c.id, now() - interval '1 day'
FROM public.profiles h, public.contractors c
WHERE h.email = 'sarah.mitchell@demosc.com'
AND c.email = 'marcus.rivera@demosc.com'
ON CONFLICT (homeowner_id, contractor_id) DO UPDATE SET last_message_at = now() - interval '1 day';

INSERT INTO public.messages (thread_id, sender_id, body, is_read, created_at)
SELECT
  mt.id,
  CASE WHEN v.sender = 'homeowner' THEN h.id ELSE c_profile.id END,
  v.body,
  true,
  now() - (v.mins_ago || ' minutes')::interval
FROM public.message_threads mt
JOIN public.profiles h ON mt.homeowner_id = h.id
JOIN public.contractors ctr ON mt.contractor_id = ctr.id
JOIN public.profiles c_profile ON ctr.user_id = c_profile.id
CROSS JOIN (VALUES
  ('homeowner', 'Hi Marcus! I came across your profile and I love the kitchen work in your portfolio. I just submitted a quote request for a full kitchen remodel. Wanted to introduce myself — Sarah.', 1440),
  ('contractor', 'Hi Sarah! Thanks so much for reaching out. I saw your request — a 220 sq ft kitchen remodel sounds like a great project. I have some availability starting next month. Would you be open to a free site visit this week so I can give you a proper estimate?', 1380),
  ('homeowner', 'That would be wonderful! We are available Thursday after 3pm or anytime Saturday morning.', 1320),
  ('contractor', 'Saturday morning works great. How does 9am sound? I will bring some cabinet and countertop samples too so we can start narrowing down your style preferences.', 1260),
  ('homeowner', 'Perfect! See you Saturday at 9am. Our address is 142 Riverside Dr, Austin TX 78701.', 1200),
  ('contractor', 'Noted! Looking forward to it. I will text you when I am on my way. Have a great rest of your week, Sarah.', 1140)
) AS v(sender, body, mins_ago)
WHERE h.email = 'sarah.mitchell@demosc.com'
ON CONFLICT DO NOTHING;

-- ── 10. Supplier record for BuildRight Supply Co. ─────────────────────────────

INSERT INTO public.suppliers (
  user_id, company_name, email, phone,
  category, state_code, city, zip_code,
  description, website,
  is_active, verified,
  rating, review_count, years_in_business,
  hours,
  instagram_url, facebook_url, linkedin_url,
  products, brands,
  created_at, updated_at
)
SELECT
  p.id,
  'BuildRight Supply Co.',
  'buildright.supply@demosc.com',
  '+1 (469) 555-0312',
  'building-materials',
  'TX', 'Dallas', '75201',
  $$BuildRight Supply Co. is North Texas' premier wholesale and retail supplier for construction professionals and serious DIYers. With over 18 years serving the Dallas–Fort Worth metro area, we carry a comprehensive inventory of lumber, roofing materials, insulation, drywall, fasteners, concrete, masonry, and specialty products. Licensed contractors receive dedicated account managers, priority fulfillment, and net-30 terms. Same-day delivery available throughout the DFW metroplex. Our team includes licensed estimators who can help you spec out your projects accurately. Visit our 40,000 sq ft showroom or order online for pickup or delivery.$$,
  'https://buildrightsupply.example.com',
  true, true,
  4.7, 148, 18,
  'Mon–Fri 6:00 AM – 6:00 PM · Sat 7:00 AM – 4:00 PM · Sun Closed',
  'https://instagram.com/buildrightsupply',
  'https://facebook.com/buildrightsupply',
  'https://linkedin.com/company/buildright-supply',
  ARRAY[
    'Dimensional Lumber','OSB Sheathing','Plywood','LVL Beams','Engineered Wood',
    'Asphalt Shingles','Metal Roofing','Roofing Underlayment','Ice & Water Shield',
    'Fiberglass Batt Insulation','Spray Foam Insulation','Rigid Board Insulation',
    'Drywall Sheets','Joint Compound','Drywall Screws','Corner Bead',
    'Ready-Mix Concrete','Concrete Blocks','Mortar Mix','Rebar',
    'Vinyl Siding','Fiber Cement Siding','House Wrap',
    'PVC Pipe','Copper Pipe','CPVC Fittings',
    'Electrical Conduit','Wire & Cable','Junction Boxes',
    'Framing Nails','Construction Screws','Structural Anchors',
    'Waterproofing Membrane','Caulk & Sealants','Expansion Joints',
    'Window & Door Flashing','Metal Flashing','Step Flashing',
    'Subfloor Panels','Underlayment','Floor Adhesive',
    'Interior Paint','Exterior Paint','Primers & Sealers',
    'Safety Equipment','Dust Masks','Work Gloves','Safety Glasses'
  ],
  ARRAY['Georgia-Pacific','James Hardie','Owens Corning','LP Building Products','CertainTeed','USG','QUIKRETE','Simpson Strong-Tie','Hilti','3M','Huber Engineered Woods','Boise Cascade'],
  now() - interval '180 days',
  now()
FROM public.profiles p
WHERE p.email = 'buildright.supply@demosc.com'
ON CONFLICT DO NOTHING;

-- ── 11. Payment Event for ProBuild subscription ───────────────────────────────

INSERT INTO public.payment_events (
  contractor_id, stripe_event_id, event_type,
  amount_cents, currency, status, created_at
)
SELECT
  c.id,
  'evt_demo_checkout_001',
  'checkout.session.completed',
  2990, 'usd', 'succeeded',
  now() - interval '60 days'
FROM public.contractors c
WHERE c.email = 'marcus.rivera@demosc.com'
ON CONFLICT (stripe_event_id) DO NOTHING;

-- ── 12. Update ranking score ──────────────────────────────────────────────────

UPDATE public.contractors SET
  ranking_score = (
    SELECT COALESCE(AVG(rating), 0) * 20 + 5
    FROM public.reviews
    WHERE contractor_id = contractors.id
  )
WHERE email = 'marcus.rivera@demosc.com';

-- ── Verification: show counts ─────────────────────────────────────────────────

SELECT 'profiles'         AS tbl, COUNT(*) FROM public.profiles WHERE email LIKE '%@demosc.com'
UNION ALL
SELECT 'homeowners',               COUNT(*) FROM public.homeowners JOIN public.profiles p ON homeowners.id = p.id WHERE p.email LIKE '%@demosc.com'
UNION ALL
SELECT 'contractors',              COUNT(*) FROM public.contractors WHERE email LIKE '%@demosc.com'
UNION ALL
SELECT 'contractor_photos',        COUNT(*) FROM public.contractor_photos cp JOIN public.contractors c ON cp.contractor_id = c.id WHERE c.email LIKE '%@demosc.com'
UNION ALL
SELECT 'contractor_subscriptions', COUNT(*) FROM public.contractor_subscriptions cs JOIN public.contractors c ON cs.contractor_id = c.id WHERE c.email LIKE '%@demosc.com'
UNION ALL
SELECT 'reviews',                  COUNT(*) FROM public.reviews r JOIN public.contractors c ON r.contractor_id = c.id WHERE c.email LIKE '%@demosc.com'
UNION ALL
SELECT 'quote_requests',           COUNT(*) FROM public.quote_requests qr JOIN public.contractors c ON qr.contractor_id = c.id WHERE c.email LIKE '%@demosc.com'
UNION ALL
SELECT 'message_threads',          COUNT(*) FROM public.message_threads mt JOIN public.contractors c ON mt.contractor_id = c.id WHERE c.email LIKE '%@demosc.com'
UNION ALL
SELECT 'messages',                 COUNT(*) FROM public.messages m JOIN public.message_threads mt ON m.thread_id = mt.id JOIN public.contractors c ON mt.contractor_id = c.id WHERE c.email LIKE '%@demosc.com'
UNION ALL
SELECT 'suppliers',                COUNT(*) FROM public.suppliers WHERE email LIKE '%@demosc.com'
UNION ALL
SELECT 'favorites',                COUNT(*) FROM public.favorites fav JOIN public.profiles p ON fav.homeowner_id = p.id WHERE p.email LIKE '%@demosc.com';
