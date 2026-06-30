// AI service abstraction layer.
// All AI features route through here so the provider (Anthropic, OpenAI, etc.)
// can be swapped without touching the call-sites. Currently stubs — implement
// each function when the feature is approved for production.

export type AIFeature =
  | 'category_suggestion'
  | 'description_generation'
  | 'photo_analysis'
  | 'contractor_recommendation'
  | 'article_generation'
  | 'support_chat'
  | 'admin_assistant'
  | 'content_moderation';

export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  /** Tokens consumed — for cost tracking in ai_requests table */
  tokensUsed?: number;
  latencyMs?: number;
}

// ── Internal: log request to ai_requests table ────────────────────────────────
async function logRequest(params: {
  feature: AIFeature;
  userId?: string;
  success: boolean;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  error?: string;
  model?: string;
}): Promise<void> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const supabase = createAdminClient();
    await supabase.from('ai_requests').insert({
      user_id:       params.userId ?? null,
      feature:       params.feature,
      provider:      'anthropic',
      model:         params.model ?? null,
      input_tokens:  params.inputTokens ?? null,
      output_tokens: params.outputTokens ?? null,
      latency_ms:    params.latencyMs ?? null,
      success:       params.success,
      error:         params.error ?? null,
    });
  } catch {
    // Never let logging crash the caller
  }
}

// ── Suggest the best category from a project description ─────────────────────
export async function suggestCategory(
  description: string,
  userId?: string,
): Promise<AIResponse<string>> {
  // TODO: Implement with Claude API
  // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  // const msg = await anthropic.messages.create({
  //   model: 'claude-sonnet-4-6',
  //   max_tokens: 100,
  //   messages: [{ role: 'user', content: `Suggest the best contractor category for: "${description}". Return only the category name.` }],
  // });
  await logRequest({ feature: 'category_suggestion', userId, success: false, error: 'not_implemented' });
  return { success: false, error: 'AI not yet implemented' };
}

// ── Generate a contractor business description ────────────────────────────────
export async function generateDescription(
  input: { companyName: string; category: string; city: string; yearsExperience?: number },
  userId?: string,
): Promise<AIResponse<string>> {
  await logRequest({ feature: 'description_generation', userId, success: false, error: 'not_implemented' });
  return { success: false, error: 'AI not yet implemented' };
}

// ── Analyze an uploaded photo (content mod + category detection) ──────────────
export async function analyzePhoto(
  imageUrl: string,
  userId?: string,
): Promise<AIResponse<{ safe: boolean; category?: string; description?: string }>> {
  await logRequest({ feature: 'photo_analysis', userId, success: false, error: 'not_implemented' });
  return { success: false, error: 'AI not yet implemented' };
}

// ── Recommend contractors for a homeowner request ────────────────────────────
export async function recommendContractors(
  input: { projectDescription: string; zipCode: string; budget?: string },
  userId?: string,
): Promise<AIResponse<string[]>> {
  await logRequest({ feature: 'contractor_recommendation', userId, success: false, error: 'not_implemented' });
  return { success: false, error: 'AI not yet implemented' };
}

// ── Generate an SEO blog article on a given topic ────────────────────────────
export async function generateArticle(
  topic: string,
  userId?: string,
): Promise<AIResponse<{ title: string; content: string; metaDescription: string }>> {
  await logRequest({ feature: 'article_generation', userId, success: false, error: 'not_implemented' });
  return { success: false, error: 'AI not yet implemented' };
}

// ── Moderate text content (reviews, descriptions, messages) ─────────────────
export async function moderateContent(
  text: string,
): Promise<AIResponse<{ safe: boolean; reason?: string }>> {
  await logRequest({ feature: 'content_moderation', success: false, error: 'not_implemented' });
  return { success: false, error: 'AI not yet implemented' };
}
