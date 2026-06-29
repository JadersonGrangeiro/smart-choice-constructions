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
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:20px}
    .wrap{max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden}
    .head{background:#162e5e;padding:28px 32px}
    .head h1{color:#fff;margin:0;font-size:22px;font-weight:800}
    .body{padding:32px}
    .btn{display:inline-block;background:#c7191a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px}
    .foot{padding:20px 32px;background:#f9f9f9;font-size:13px;color:#666;text-align:center}
  </style></head><body><div class="wrap">${body}</div></body></html>`;
}

export async function sendWelcomeEmail({
  to, firstName, companyName,
}: { to: string; firstName: string; companyName: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: "Welcome to Smart Choice Constructions!",
    html: html(`
      <div class="head"><h1>Welcome, ${firstName}!</h1></div>
      <div class="body">
        <p>Your payment was successful and <strong>${companyName}</strong> is now under review.</p>
        <p>Our team reviews new profiles within <strong>24 hours</strong>. Once approved, your profile will go live and you'll start receiving leads from homeowners in your area.</p>
        <a href="${BASE}/login" class="btn">Go to Dashboard →</a>
        <p style="margin-top:24px;color:#666;font-size:14px">While you wait, log in to add more photos, update your profile, and check your dashboard.</p>
      </div>
      <div class="foot">Smart Choice Constructions LLC · 2222 W Grand River Ave, Okemos, MI 48864</div>
    `),
  });
}

export async function sendApprovalEmail({
  to, firstName, companyName,
}: { to: string; firstName: string; companyName: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: "Your profile is now LIVE!",
    html: html(`
      <div class="head"><h1>You're live, ${firstName}!</h1></div>
      <div class="body">
        <p><strong>${companyName}</strong> has been approved and your profile is now visible to homeowners searching in your area.</p>
        <p>Start getting leads now by completing your profile and adding project photos.</p>
        <a href="${BASE}/dashboard/contractor" class="btn">View My Dashboard →</a>
      </div>
      <div class="foot">Smart Choice Constructions LLC</div>
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

export async function sendQuoteNotificationEmail({
  to, contractorName, serviceName, clientName,
}: { to: string; contractorName: string; serviceName: string; clientName: string }) {
  await sendEmail({
    from: `Smart Choice <${FROM}>`,
    to,
    subject: `New quote request: ${serviceName}`,
    html: html(`
      <div class="head"><h1>New Lead!</h1></div>
      <div class="body">
        <p>Hi ${contractorName}, you have a new quote request from <strong>${clientName}</strong> for <strong>${serviceName}</strong>.</p>
        <p>Respond quickly — contractors who reply within 1 hour get 4× more jobs.</p>
        <a href="${BASE}/dashboard/contractor" class="btn">View Lead →</a>
      </div>
      <div class="foot">Smart Choice Constructions LLC</div>
    `),
  });
}
