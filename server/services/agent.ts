/**
 * AI Agent orchestrator for gerecseingatlan.hu.
 *
 * Handles multi-turn conversations with Gemini 2.0 Flash,
 * dispatches tool calls, extracts citations, and generates
 * follow-up suggestions.
 */

import { sendMessage, estimateCostEur, type LlmMessage } from "./llm";
import {
  AGENT_TOOL_DECLARATIONS,
  executeTool,
  type Citation,
} from "./agent-tools";
import { fetchFeed } from "../ingatlan-feed";
import type { NormalizedProperty } from "../../shared/types/property";
import type { FunctionCall, Part } from "@google/generative-ai";

// ─── Types ──────────────────────────────────────────────────

export interface AgentRequest {
  sessionId: string;
  propertyId?: string;
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AgentResponse {
  reply: string;
  citations: Citation[];
  suggestions: string[];
  tokensUsed: number;
  estimatedCostEur: number;
}

// ─── Constants ──────────────────────────────────────────────

const MAX_TOOL_ITERATIONS = 5;

// ─── Structured Logging ─────────────────────────────────────

function log(level: "info" | "warn" | "error", event: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, module: "agent", event, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ─── System Prompt ──────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `Te a Gerecse Ingatlan asszisztense vagy a gerecseingatlan.hu weboldalon.

FELADATOD:
- Segítesz a felhasználóknak az ingatlanok környékével kapcsolatos kérdésekben.
- Valós Google Maps adatokat használsz a válaszokhoz — soha ne találj ki helyeket, távolságokat vagy útvonalakat.
- Mindig hivatkozz a tényleges távolságokra és útvonalidőkre, amiket az eszközöktől kapsz.
- Ha egy helyet említesz, add meg a nevét és a távolságát.

NYELV:
- Alapértelmezetten magyarul válaszolj.
- Ha a felhasználó angolul ír, válts angolra.

SZABÁLYOK:
- Csak ingatlanokkal, ingatlanok környékével, lakókörnyezettel és az ingatlanpiachoz kapcsolódó kérdésekre válaszolj.
- Ha nem az ingatlanhoz vagy a környékhez kapcsolódó kérdést kapsz, udvariasan utasítsd el: "Sajnos ebben a kérdésben nem tudok segíteni. Kérdezzen az ingatlanok környezetéről, közeli szolgáltatásokról, vagy keressen ingatlanokat a kínálatunkban!"
- Légy udvarias, tömör és informatív.
- Ha nincs elég információd, kérdezz vissza.
- Ne adj pénzügyi, jogi vagy befektetési tanácsot.

ELÉRHETŐ ESZKÖZÖK:
- search_nearby_places: közeli helyek keresése (boltok, iskolák, orvosok, stb.)
- get_place_details: egy hely részletes adatai
- calculate_distance: távolság és útvonal idő számítás
- search_properties: ingatlankeresés a Gerecse Ingatlan kínálatában
- get_property_details: egy ingatlan részletes adatai`;

function buildSystemPrompt(property?: NormalizedProperty): string {
  if (!property) {
    return BASE_SYSTEM_PROMPT;
  }

  const ctx = [
    `\nJELENLEGI INGATLAN KONTEXTUS:`,
    `- Azonosító: ${property.id}`,
    `- Cím: ${property.title}`,
    `- Település: ${property.address.city}`,
  ];

  if (property.address.district) ctx.push(`- Városrész: ${property.address.district}`);
  if (property.address.street) ctx.push(`- Utca: ${property.address.street}`);
  if (property.location) ctx.push(`- Koordináták: ${property.location.lat}, ${property.location.lng}`);

  ctx.push(`- Típus: ${property.listingType === "elado" ? "Eladó" : "Kiadó"} ${property.subCategory}`);
  ctx.push(`- Ár: ${property.priceFormatted}`);

  if (property.area > 0) ctx.push(`- Alapterület: ${property.area} m²`);
  if (property.rooms > 0) ctx.push(`- Szobák: ${property.totalRooms}`);
  if (property.builtYear) ctx.push(`- Építési év: ${property.builtYear}`);
  if (property.lotSize) ctx.push(`- Telekméret: ${property.lotSize} m²`);

  const featureEntries = Object.entries(property.features || {});
  if (featureEntries.length > 0) {
    ctx.push(`- Jellemzők:`);
    for (const [key, val] of featureEntries.slice(0, 10)) {
      ctx.push(`  - ${key}: ${val}`);
    }
  }

  ctx.push(
    `\nHa a felhasználó a környékről kérdez, használd a koordinátákat a kereséshez.`,
    `Ha koordináták nincsenek megadva, keress a település neve alapján.`,
  );

  return BASE_SYSTEM_PROMPT + "\n" + ctx.join("\n");
}

// ─── Follow-up Suggestions ──────────────────────────────────

function generateSuggestions(property?: NormalizedProperty, lastMessage?: string): string[] {
  const suggestions: string[] = [];

  if (property) {
    suggestions.push(
      "Milyen boltok és szupermarketek vannak a közelben?",
      "Van-e iskola vagy óvoda a környéken?",
      "Mennyi idő a legközelebbi buszmegállóig gyalog?",
      "Milyen éttermek és kávézók találhatók a közelben?",
    );
  } else {
    suggestions.push(
      "Milyen eladó házak vannak Dorogon?",
      "Keresek kiadó lakást Esztergomban.",
      "Vannak telkek 10 millió Ft alatt?",
      "Mutasd a legújabb ingatlanokat!",
    );
  }

  // Rotate based on a simple hash of the last message to vary suggestions
  if (lastMessage) {
    const hash = lastMessage.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const shift = hash % suggestions.length;
    return [...suggestions.slice(shift), ...suggestions.slice(0, shift)].slice(0, 4);
  }

  return suggestions.slice(0, 4);
}

// ─── Property Context Loader ────────────────────────────────

async function loadPropertyContext(propertyId: string): Promise<NormalizedProperty | undefined> {
  const feedUrl = process.env.INGATLAN_XML_URL;
  if (!feedUrl) return undefined;

  try {
    const feed = await fetchFeed(feedUrl);
    return feed.properties.find((p) => p.id === propertyId);
  } catch (err) {
    log("warn", "property_context_load_failed", {
      propertyId,
      error: err instanceof Error ? err.message : String(err),
    });
    return undefined;
  }
}

// ─── Main Agent Orchestration ───────────────────────────────

/**
 * Processes a user message through the AI agent.
 * Handles multi-turn tool calling (up to MAX_TOOL_ITERATIONS rounds).
 */
export async function processMessage(request: AgentRequest): Promise<AgentResponse> {
  const { sessionId, propertyId, message, history } = request;

  log("info", "process_start", { sessionId, propertyId, messageLength: message.length });

  // Load property context if ID provided
  let property: NormalizedProperty | undefined;
  if (propertyId) {
    property = await loadPropertyContext(propertyId);
    if (!property) {
      log("warn", "property_not_found", { propertyId });
    }
  }

  const systemPrompt = buildSystemPrompt(property);

  // Build message history for the LLM
  const llmMessages: LlmMessage[] = [];

  if (history?.length) {
    for (const msg of history) {
      llmMessages.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
  }

  llmMessages.push({ role: "user", parts: [{ text: message }] });

  // Tool calling loop
  const allCitations: Citation[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let iterations = 0;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    const response = await sendMessage(systemPrompt, llmMessages, AGENT_TOOL_DECLARATIONS);

    totalInputTokens += response.tokensUsed.input;
    totalOutputTokens += response.tokensUsed.output;

    // If we got a text reply with no tool calls, we're done
    if (response.reply && response.toolCalls.length === 0) {
      const cost = estimateCostEur(totalInputTokens, totalOutputTokens);

      log("info", "process_complete", {
        sessionId,
        iterations,
        totalTokens: totalInputTokens + totalOutputTokens,
        citationCount: allCitations.length,
        estimatedCostEur: cost,
      });

      return {
        reply: response.reply,
        citations: deduplicateCitations(allCitations),
        suggestions: generateSuggestions(property, message),
        tokensUsed: totalInputTokens + totalOutputTokens,
        estimatedCostEur: cost,
      };
    }

    // Process tool calls
    if (response.toolCalls.length > 0) {
      // Add the model's response (with tool calls) to history
      llmMessages.push({
        role: "model",
        parts: response.toolCalls.map((tc) => ({
          functionCall: tc,
        })),
      });

      // Execute each tool call and collect results
      const toolResultParts: Part[] = [];

      for (const toolCall of response.toolCalls) {
        const { result, citations } = await executeTool(
          toolCall.name,
          (toolCall.args ?? {}) as Record<string, unknown>,
        );
        allCitations.push(...citations);

        toolResultParts.push({
          functionResponse: {
            name: toolCall.name,
            response: result as object,
          },
        });
      }

      // Add tool results back to the conversation
      llmMessages.push({
        role: "function",
        parts: toolResultParts,
      });

      continue;
    }

    // No reply and no tool calls — shouldn't happen, but handle gracefully
    log("warn", "empty_response", { sessionId, iteration: iterations });
    break;
  }

  // Fallback if we exhausted iterations
  if (iterations >= MAX_TOOL_ITERATIONS) {
    log("warn", "max_iterations_reached", { sessionId, iterations });
  }

  const cost = estimateCostEur(totalInputTokens, totalOutputTokens);

  return {
    reply: "Sajnos nem sikerült a kérdés feldolgozása. Kérjük, próbálja újra egyszerűbb kérdéssel.",
    citations: deduplicateCitations(allCitations),
    suggestions: generateSuggestions(property, message),
    tokensUsed: totalInputTokens + totalOutputTokens,
    estimatedCostEur: cost,
  };
}

// ─── Helpers ────────────────────────────────────────────────

function deduplicateCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  return citations.filter((c) => {
    if (seen.has(c.placeId)) return false;
    seen.add(c.placeId);
    return true;
  });
}
