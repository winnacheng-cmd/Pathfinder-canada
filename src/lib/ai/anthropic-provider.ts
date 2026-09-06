import "server-only";
import { SYSTEM_PROMPT } from "./system-prompt";
import type { AiExplanationContext, AiProvider } from "./provider";

/** Plain fetch against the Messages API — no SDK dependency for one call. */
export class AnthropicProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5"
  ) {}

  async generateExplanation(context: AiExplanationContext): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: JSON.stringify(context) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((block) => block.type === "text")?.text;
    if (!text) throw new Error("Anthropic API returned no text content.");
    return text.trim();
  }
}
