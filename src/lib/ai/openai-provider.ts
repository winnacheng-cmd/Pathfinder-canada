import "server-only";
import { SYSTEM_PROMPT } from "./system-prompt";
import type { AiExplanationContext, AiProvider } from "./provider";

/** Plain fetch against the Chat Completions API — no SDK dependency for one call. */
export class OpenAiProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  ) {}

  async generateExplanation(context: AiExplanationContext): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(context) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("OpenAI API returned no content.");
    return text.trim();
  }
}
