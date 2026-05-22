const MAX_INPUT_LENGTH = Number(process.env.CHAT_MAX_INPUT_LENGTH) || 500;
const DAILY_TOKEN_BUDGET = Number(process.env.CHAT_DAILY_TOKEN_BUDGET) || 500_000;

let dailyTokenUsage = { date: new Date().toDateString(), tokens: 0 };

const SUSPICIOUS_PATTERNS = [
  /ignore (previous|above|all|the) (instruction|rule|prompt)/i,
  /forget (previous|the|your) (instruction|rule|prompt)/i,
  /felejtsd el/i,
  /system:\s*/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /pretend you are/i,
  /roleplay as/i,
  /act (like|as)/i,
  /you are now/i,
  /mostantól te/i,
  /új utasítás/i,
  /új szabály/i,
  /developer mode/i,
  /admin(istrator)? mode/i,
  /jailbreak/i,
  /DAN mode/i,
  /[A-Za-z0-9+/]{100,}={0,2}/,
];

export function validateChatInput(
  message: unknown,
  propertyId: unknown
): { valid: boolean; error?: string } {
  if (typeof message !== "string" || message.trim().length === 0) {
    return { valid: false, error: "Kérem fogalmazza meg kérdését." };
  }
  if (message.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `A kérdés túl hosszú (max. ${MAX_INPUT_LENGTH} karakter). Kérem fogalmazza meg röviden.` };
  }
  if (propertyId !== undefined && propertyId !== null && propertyId !== "") {
    if (typeof propertyId !== "string" || !/^[A-Za-z0-9_-]+$/.test(propertyId)) {
      return { valid: false, error: "A chat hibát észlelt. Kérem töltse újra az oldalt." };
    }
  }
  return { valid: true };
}

export function logSuspiciousInput(message: string, ip: string): void {
  const matches = SUSPICIOUS_PATTERNS.filter((pat) => pat.test(message));
  if (matches.length > 0) {
    console.warn(JSON.stringify({
      level: "warn",
      ts: new Date().toISOString(),
      module: "chat-security",
      event: "suspicious_input",
      ip,
      patternsMatched: matches.length,
      messagePreview: message.slice(0, 200),
    }));
  }
}

export async function checkDailyBudget(): Promise<boolean> {
  const today = new Date().toDateString();
  if (dailyTokenUsage.date !== today) {
    dailyTokenUsage = { date: today, tokens: 0 };
  }
  return dailyTokenUsage.tokens < DAILY_TOKEN_BUDGET;
}

export async function recordTokenUsage(tokens: number): Promise<void> {
  const today = new Date().toDateString();
  if (dailyTokenUsage.date !== today) {
    dailyTokenUsage = { date: today, tokens: 0 };
  }
  dailyTokenUsage.tokens += tokens;

  if (Math.floor(dailyTokenUsage.tokens / 10_000) > Math.floor((dailyTokenUsage.tokens - tokens) / 10_000)) {
    console.log(JSON.stringify({
      level: "info",
      ts: new Date().toISOString(),
      module: "chat-security",
      event: "token_usage_milestone",
      dailyTokens: dailyTokenUsage.tokens,
      budget: DAILY_TOKEN_BUDGET,
      remaining: DAILY_TOKEN_BUDGET - dailyTokenUsage.tokens,
    }));
  }
}
