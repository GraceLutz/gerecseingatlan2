/**
 * LLM client for the AI agent — Gemini 2.0 Flash.
 *
 * Model choice rationale (May 2025 pricing):
 *   Gemini 2.0 Flash: ~$0.10 / 1M input tokens, ~$0.40 / 1M output tokens
 *   GPT-4o mini:      ~$0.15 / 1M input, ~$0.60 / 1M output
 *   Claude Haiku 4.5: ~$0.80 / 1M input, ~$4.00 / 1M output
 *
 * Gemini 2.0 Flash wins on cost by a wide margin, supports function calling,
 * and handles Hungarian well. At ~300 tokens per question+answer and ~50 daily
 * conversations, monthly LLM cost is under $1.
 *
 * @env GEMINI_API_KEY — required
 */

import {
  GoogleGenerativeAI,
  type Content,
  type FunctionDeclaration,
  type FunctionCall,
  type GenerateContentResult,
  type Part,
} from "@google/generative-ai";

// ─── Types ──────────────────────────────────────────────────

export interface LlmMessage {
  role: "user" | "model" | "function";
  parts: Part[];
}

export interface LlmResponse {
  reply: string | null;
  toolCalls: FunctionCall[];
  tokensUsed: { input: number; output: number; total: number };
}

// ─── Structured Logging ─────────────────────────────────────

function log(level: "info" | "warn" | "error", event: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, module: "llm", event, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ─── Client singleton ───────────────────────────────────────

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
    log("info", "client_initialized");
  }
  return genAI;
}

// ─── Model configuration ────────────────────────────────────

const GEMINI_MODEL = "gemini-2.0-flash";

// ─── Cost estimation ────────────────────────────────────────

const COST_PER_1M_INPUT_TOKENS_EUR = 0.092;
const COST_PER_1M_OUTPUT_TOKENS_EUR = 0.368;

export function estimateCostEur(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1_000_000) * COST_PER_1M_INPUT_TOKENS_EUR +
    (outputTokens / 1_000_000) * COST_PER_1M_OUTPUT_TOKENS_EUR
  );
}

// ─── Main API ───────────────────────────────────────────────

/**
 * Sends a message to Gemini 2.0 Flash with optional function calling tools.
 * Returns the model's text reply and/or tool calls, plus token usage.
 */
export async function sendMessage(
  systemPrompt: string,
  messages: LlmMessage[],
  tools?: FunctionDeclaration[],
): Promise<LlmResponse> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
    ...(tools?.length
      ? { tools: [{ functionDeclarations: tools }] }
      : {}),
  });

  const contents: Content[] = messages.map((m) => ({
    role: m.role === "function" ? "function" : m.role,
    parts: m.parts,
  }));

  const startMs = Date.now();

  let result: GenerateContentResult;
  try {
    result = await model.generateContent({ contents });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("error", "generate_failed", { error: message, elapsed: Date.now() - startMs });
    throw err;
  }

  const response = result.response;
  const candidate = response.candidates?.[0];

  const reply = candidate?.content?.parts
    ?.filter((p): p is Part & { text: string } => "text" in p && typeof p.text === "string")
    .map((p) => p.text)
    .join("") || null;

  const toolCalls: FunctionCall[] = candidate?.content?.parts
    ?.filter((p): p is Part & { functionCall: FunctionCall } => "functionCall" in p && !!p.functionCall)
    .map((p) => p.functionCall) ?? [];

  const usage = response.usageMetadata;
  const tokensUsed = {
    input: usage?.promptTokenCount ?? 0,
    output: usage?.candidatesTokenCount ?? 0,
    total: usage?.totalTokenCount ?? 0,
  };

  log("info", "generate_complete", {
    elapsed: Date.now() - startMs,
    tokensUsed,
    hasReply: !!reply,
    toolCallCount: toolCalls.length,
  });

  return { reply, toolCalls, tokensUsed };
}
