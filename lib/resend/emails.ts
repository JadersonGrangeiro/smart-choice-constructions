import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@smartchoiceconstructions.com";
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://smartchoiceconstructions.com";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_placeholder")) return null;
  return new Resend(key);
}

async function sendEmail(payload: Parameters<Resend["emails"]["send"]>[0]): Promise<void> {
  const resend = getResend();
  if (!resend) return; // email not configured yet — skip silently
  await resend.emails.send(payload);
}

function html(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    *{box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f4f8;margin:0;padding:24px 16px;color:#1e293b}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
    .head{background:linear-gradient(135deg,#162e5e 0%,#1e3a6e 100%);padding:28px 36px;display:flex;align-items:center;gap:12px}
    .head-logo{display:flex;align-items:center;gap:8px}
    .head-logo-mark{width:36px;height:30px}
    .head-brand{color:white}
    .head-brand-main{font-weight:900;font-size:14px;letter-spacing:.04em;text-transform:uppercase;line-height:1.1}
    .head-brand-sub{font-weight:700;font-size:9px;letter-spacing:.18em;text-transform:uppercase;opacity:.55}
    .head-title{color:#fff;margin:0 0 0 auto;font-size:18px;font-weight:800;text-align:right}
    .body{padding:32px 36px}
    .body p{margin:0 0 16px;line-height:1.7;color:#374151;font-size:15px}
    .body h2{font-size:20px;font-weight:800;color:#162e5e;margin:0 0 12px}
    .highlight{background:#f0f6ff;border-left:4px solid #162e5e;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0}
    .highlight p{margin:4px 0;color:#1e3a6e;font-weight:600;font-size:14px}
    .stats{display:flex;gap:12px;margin:20px 0;flex-wrap:wrap}
    .stat{flex:1;min-width:120px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center}
    .stat-val{font-size:24px;font-weight:900;color:#162e5e}
    .stat-lbl{font-size:12px;color:#64748b;font-weight:600;margin-top:2px}
    .btn{display:inline-block;background:#c7191a;color:#fff!important;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;margin-top:16px;letter-spacing:.01em}
    .btn-outline{display:inline-block;background:transparent;color:#162e5e!important;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-top:12px;margin-left:12px;border:2px solid #162e5e}
    .foot{padding:20px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6}
    .foot a{color:#94a3b8}
    .divider{border:none;border-top:1px solid #e2e8f0;margin:24px 0}
    .stars{color:#f59e0b;font-size:18px;letter-spacing:2px}
  </style></head><body><div class="wrap">
    <div class="head">
      <div class="head-logo">
        <svg class="head-logo-mark" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="10,72 60,18 88,51" stroke="white" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
          <rect x="74" y="28" width="11" height="22" rx="1.5" fill="white"/>
          <line x1="88" y1="51" x2="116" y2="51" stroke="white" stroke-width="8" stroke-linecap="round"/>
          <rect x="43" y="42" width="8" height="8" rx="1" fill="#C7191A"/>
          <rect x="53" y="42" width="8" height="8" rx="1" fill="#C7191A"/>
          <rect x="43" y="52" width="8" height="8" rx="1" fill="#C7191A"/>
          <rect x="53" y="52" width="8" height="8" rx="1" fill="#C7191A"/>
        </svg>
        <div class="head-brand">
          <div class="head-brand-main">Smart Choice</div>
          <div class="head-brand-sub">Constructions</div>
        </div>
      </div>
    </div>
    ${body}
    <div class="foot">
      Smart Choice Constructions LLC · 2222 W Grand River Ave, Okemos, MI 48864<br/>
      <a href="${BASE}">smartchoiceconstructions.com</a> · <a href="${BASE}/unsubscribe">Unsubscribe</a>
    </div>
  </div></body></html>`;
}

export async function sendWelcomeEmail({
  to, firstName, companyName,
}: { to: string; firstName: string; companyName: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: `Welcome, ${firstName}! Your profile is under review`,
    html: html(`
      <div class="body">
        <h2>Welcome to Smart Choice, ${firstName}!</h2>
        <p>Your payment was successful. <strong>${companyName}</strong> is now under review by our team.</p>
        <div class="highlight">
          <p>⏱ Review typically takes less than 24 hours</p>
          <p>📧 We'll email you the moment your profile goes live</p>
          <p>📈 You'll immediately start appearing in local searches</p>
        </div>
        <p>While you wait, log in to complete your profile — contractors with full profiles receive <strong>3× more leads</strong>.</p>
        <a href="${BASE}/dashboard/contractor" class="btn">Complete My Profile →</a>
      </div>
    `),
  });
}

export async function sendApprovalEmail({
  to, firstName, companyName,
}: { to: string; firstName: string; companyName: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: `🎉 ${companyName} is LIVE on Smart Choice!`,
    html: html(`
      <div class="body">
        <h2>You're live, ${firstName}! 🎉</h2>
        <p><strong>${companyName}</strong> has been approved. Your profile is now visible to homeowners searching in your area.</p>
        <div class="highlight">
          <p>✅ Profile visible in local search results</p>
          <p>📨 You'll receive email alerts for new leads</p>
          <p>⭐ Start collecting 5-star reviews to rank higher</p>
        </div>
        <p>Maximize your visibility by adding project photos, setting your availability, and uploading your license and insurance documents.</p>
        <a href="${BASE}/dashboard/contractor" class="btn">Go to Dashboard →</a>
      </div>
    `),
  });
}

export async function sendRejectionEmail({
  to, firstName, reason,
}: { to: string; firstName: string; reason?: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: "Update on your Smart Choice application",
    html: html(`
      <div class="head"><h1>Application Update</h1></div>
      <div class="body">
        <p>Hi ${firstName}, we've reviewed your application and unfortunately we're unable to approve it at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>You're welcome to update your information and reapply. If you have questions, please contact our support team.</p>
        <a href="mailto:hello@smartchoiceconstructions.com" class="btn">Contact Support</a>
      </div>
      <div class="foot">Smart Choice Constructions LLC</div>
    `),
  });
}

export async function sendPaymentFailedEmail({
  to, firstName, failCount,
}: { to: string; firstName: string; failCount: number }) {
  const isSuspension = failCount >= 3;
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: isSuspension
      ? "Your profile has been suspended — Action required"
      : "Payment failed — Please update your payment method",
    html: html(`
      <div class="head"><h1>${isSuspension ? "Profile Suspended" : "Payment Failed"}</h1></div>
      <div class="body">
        <p>Hi ${firstName},</p>
        ${isSuspension
          ? `<p>Your subscription payment has failed <strong>3 times</strong>. Your profile has been temporarily hidden from search results.</p>
             <p>Please update your payment method to restore your listing.</p>`
          : `<p>We were unable to process your monthly subscription payment. Please update your payment method to keep your profile active.</p>`
        }
        <a href="${BASE}/dashboard/contractor" class="btn">Update Payment Method →</a>
      </div>
      <div class="foot">Smart Choice Constructions LLC</div>
    `),
  });
}

export async function sendSubscriptionCanceledEmail({
  to, firstName,
}: { to: string; firstName: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: "Your Smart Choice subscription has been canceled",
    html: html(`
      <div class="head"><h1>Subscription Canceled</h1></div>
      <div class="body">
        <p>Hi ${firstName}, your subscription has been canceled and your profile has been removed from search results.</p>
        <p>You can rejoin at any time — your profile data is saved for 90 days.</p>
        <a href="${BASE}/join" class="btn">Rejoin Smart Choice →</a>
      </div>
      <div class="foot">Smart Choice Constructions LLC</div>
    `),
  });
}

export async function sendContactEmail({
  firstName, lastName, email, phone, userType, subject, message,
}: { firstName: string; lastName: string; email: string; phone?: string; userType?: string; subject?: string; message: string }) {
  const ADMIN_EMAIL = process.env.RESEND_FROM_EMAIL ?? "hello@smartchoiceconstructions.com";
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `Contact Form: ${subject || "General Inquiry"} — ${firstName} ${lastName}`,
    html: html(`
      <div class="head"><h1>New Contact Form Submission</h1></div>
      <div class="body">
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        ${userType ? `<p><strong>I am a:</strong> ${userType}</p>` : ""}
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <p style="white-space:pre-line">${message}</p>
      </div>
      <div class="foot">Smart Choice Constructions LLC</div>
    `),
  });
  // Auto-reply to user
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to: email,
    subject: "We received your message — Smart Choice Constructions",
    html: html(`
      <div class="head"><h1>Thanks for reaching out, ${firstName}!</h1></div>
      <div class="body">
        <p>We've received your message and will get back to you within 1 business day.</p>
        <p>In the meantime, feel free to <a href="${BASE}/find-contractors">browse our contractor directory</a> or check out our <a href="${BASE}/faq">FAQ</a>.</p>
      </div>
      <div class="foot">Smart Choice Constructions LLC · hello@smartchoiceconstructions.com</div>
    `),
  });
}

export async function sendCrmEmail({
  to, toName, subject, body: emailBody, fromAdmin = "Smart Choice Team",
}: { to: string; toName: string; subject: string; body: string; fromAdmin?: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    replyTo: process.env.RESEND_FROM_EMAIL ?? "hello@smartchoiceconstructions.com",
    subject,
    html: html(`
      <div class="head"><h1>Smart Choice Constructions</h1></div>
      <div class="body">
        <p>Hi ${toName.split(" ")[0]},</p>
        <div style="white-space:pre-line;line-height:1.75;color:#374151">${emailBody.replace(/\n/g, "<br/>")}</div>
        <p style="margin-top:24px;color:#999;font-size:13px">— ${fromAdmin}</p>
      </div>
      <div class="foot">Smart Choice Constructions LLC · 2222 W Grand River Ave, Okemos, MI 48864<br/>
        <a href="${BASE}/unsubscribe" style="color:#999">Unsubscribe</a>
      </div>
    `),
  });
}

export async function sendQuoteNotificationEmail({
  to, contractorName, serviceName, clientName, city, budgetRange,
}: { to: string; contractorName: string; serviceName: string; clientName: string; city?: string; budgetRange?: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: `New lead: ${serviceName} — ${clientName}`,
    html: html(`
      <div class="body">
        <h2>📨 New Quote Request</h2>
        <p>Hi ${contractorName}, you have a new lead on Smart Choice!</p>
        <div class="highlight">
          <p>👤 <strong>Client:</strong> ${clientName}</p>
          <p>🔧 <strong>Service:</strong> ${serviceName}</p>
          ${city ? `<p>📍 <strong>Location:</strong> ${city}</p>` : ""}
          ${budgetRange ? `<p>💰 <strong>Budget:</strong> ${budgetRange}</p>` : ""}
        </div>
        <p>⚡ <strong>Respond fast</strong> — contractors who reply within 1 hour win 4× more jobs.</p>
        <a href="${BASE}/dashboard/contractor" class="btn">View Full Lead Details →</a>
      </div>
    `),
  });
}

export async function sendNewReviewEmail({
  to, contractorName, reviewerName, rating, reviewBody,
}: { to: string; contractorName: string; reviewerName: string; rating: number; reviewBody: string }) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: `New ${rating}-star review from ${reviewerName}`,
    html: html(`
      <div class="body">
        <h2>You have a new review!</h2>
        <p>Hi ${contractorName}, <strong>${reviewerName}</strong> just left you a review on Smart Choice.</p>
        <div class="highlight">
          <p class="stars">${stars}</p>
          <p style="margin-top:8px;font-style:italic;color:#374151">"${reviewBody.length > 200 ? reviewBody.slice(0, 197) + "…" : reviewBody}"</p>
          <p style="margin-top:8px;color:#64748b;font-size:13px">— ${reviewerName}</p>
        </div>
        <p>Respond to this review to show future clients how you engage with your customers.</p>
        <a href="${BASE}/dashboard/contractor" class="btn">Respond to Review →</a>
      </div>
    `),
  });
}

export async function sendSupplierApplicationEmail({
  to, companyName, contactName, category,
}: { to: string; companyName: string; contactName: string; category: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: `Application received — ${companyName}`,
    html: html(`
      <div class="body">
        <h2>Application Received!</h2>
        <p>Hi ${contactName.split(" ")[0]}, we've received your supplier application for <strong>${companyName}</strong>.</p>
        <div class="highlight">
          <p>📦 <strong>Category:</strong> ${category}</p>
          <p>⏱ <strong>Review time:</strong> 1–2 business days</p>
          <p>📧 <strong>Next step:</strong> We'll email you once your listing is live</p>
        </div>
        <p>Your listing will be visible to contractors searching for ${category} in your area. The listing is completely free — no credit card required.</p>
        <p>Questions? Reply to this email or contact us at <a href="mailto:hello@smartchoiceconstructions.com">hello@smartchoiceconstructions.com</a></p>
      </div>
    `),
  });
}
