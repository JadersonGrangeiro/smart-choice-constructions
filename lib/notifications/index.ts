// Push notification service — abstraction layer for FCM (Android) and APNs (iOS).
// Currently a functional stub backed by the device_tokens + notification_logs tables.
// Wire up Firebase Admin SDK or Expo Push API when mobile apps launch.

export type NotificationType =
  | 'new_lead'
  | 'new_quote'
  | 'new_message'
  | 'registration_approved'
  | 'registration_rejected'
  | 'document_approved'
  | 'document_rejected'
  | 'payment_received'
  | 'payment_failed'
  | 'subscription_canceled'
  | 'campaign'
  | 'coupon'
  | 'admin_alert';

export interface PushPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Arbitrary key-value pairs passed to the mobile app for deep linking */
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface NotificationResult {
  sent: number;
  failed: number;
}

// ── Send a push notification to all active devices of a user ─────────────────
export async function sendPushNotification(
  payload: PushPayload,
): Promise<NotificationResult> {
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = createAdminClient();

  // Fetch active device tokens
  const { data: tokens } = await supabase
    .from('device_tokens')
    .select('token, platform')
    .eq('user_id', payload.userId)
    .eq('is_active', true);

  // Log the notification regardless of provider availability
  await supabase.from('notification_logs').insert({
    user_id: payload.userId,
    type:    payload.type,
    title:   payload.title,
    body:    payload.body,
    data:    payload.data ?? null,
    channel: 'push',
    status:  tokens && tokens.length > 0 ? 'sent' : 'pending',
  });

  if (!tokens || tokens.length === 0) {
    return { sent: 0, failed: 0 };
  }

  // TODO: replace the block below with your FCM / APNs / Expo implementation
  // ─────────────────────────────────────────────────────────────────────────
  // Example with Firebase Admin:
  //   import * as admin from 'firebase-admin';
  //   const res = await admin.messaging().sendEachForMulticast({
  //     tokens: tokens.map(t => t.token),
  //     notification: { title: payload.title, body: payload.body },
  //     data: payload.data,
  //   });
  //   return { sent: res.successCount, failed: res.failureCount };
  // ─────────────────────────────────────────────────────────────────────────
  console.log(
    `[notifications] Push stub — ${tokens.length} device(s) for user ${payload.userId}, type: ${payload.type}`,
  );
  return { sent: 0, failed: 0 };
}

export interface DeviceTokenResult {
  success: boolean;
  error?: string;
}

// ── Register a device token (called on app launch / login) ───────────────────
export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: 'ios' | 'android' | 'web',
  deviceId?: string,
  appVersion?: string,
): Promise<DeviceTokenResult> {
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = createAdminClient();
  const { error } = await supabase.from('device_tokens').upsert(
    {
      user_id:      userId,
      token,
      platform,
      device_id:    deviceId ?? null,
      app_version:  appVersion ?? null,
      is_active:    true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,token' },
  );
  return error ? { success: false, error: error.message } : { success: true };
}

// ── Unregister a token (called on logout or token rotation) ──────────────────
export async function unregisterDeviceToken(token: string): Promise<DeviceTokenResult> {
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('device_tokens')
    .update({ is_active: false })
    .eq('token', token);
  return error ? { success: false, error: error.message } : { success: true };
}

// ── Mark a notification as read ──────────────────────────────────────────────
export async function markNotificationRead(notificationId: string): Promise<void> {
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = createAdminClient();
  await supabase
    .from('notification_logs')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('id', notificationId);
}
