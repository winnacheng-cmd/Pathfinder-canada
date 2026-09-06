import "server-only";
import type { AiProvider } from "./provider";
import { FallbackProvider } from "./fallback-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { OpenAiProvider } from "./openai-provider";

export type { AiExplanationContext, AiExplanationAction, AiProvider } from "./provider";

/**
 * Selects the AI provider from env. Falls back to the deterministic
 * template whenever AI_PROVIDER/the matching key is unset — the product
 * never depends on this being configured. See docs/ARCHITECTURE.md.
 */
export function getAiProvider(): { provider: AiProvider; usingFallback: boolean } {
  const providerName = process.env.AI_PROVIDER;

  if (providerName === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return { provider: new AnthropicProvider(process.env.ANTHROPIC_API_KEY), usingFallback: false };
  }

  if (providerName === "openai" && process.env.OPENAI_API_KEY) {
    return { provider: new OpenAiProvider(process.env.OPENAI_API_KEY), usingFallback: false };
  }

  return { provider: new FallbackProvider(), usingFallback: true };
}
