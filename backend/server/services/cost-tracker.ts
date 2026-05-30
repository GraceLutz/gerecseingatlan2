import { db } from "../db/index.js";
import { apiUsageLog } from "../db/schema/agent.js";
import { sql, and, gte } from "drizzle-orm";

const MONTHLY_BUDGET_USD = parseFloat(process.env.AGENT_MONTHLY_BUDGET_USD || "10");

function getStartOfMonthUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

interface UsageEntry {
  service: string;
  endpoint: string;
  tokensOrUnits?: number;
  estimatedCostUsd: string;
  userSessionId?: string;
  propertyId?: string;
}

/**
 * Logs an API call to the api_usage_log table.
 */
export async function logApiUsage(entry: UsageEntry): Promise<void> {
  await db.insert(apiUsageLog).values({
    service: entry.service,
    endpoint: entry.endpoint,
    tokensOrUnits: entry.tokensOrUnits ?? null,
    estimatedCostEur: entry.estimatedCostUsd,
    userSessionId: entry.userSessionId ?? null,
    propertyId: entry.propertyId ?? null,
  });
}

/**
 * Returns the total estimated cost in USD for the current calendar month.
 */
export async function getCurrentMonthSpend(): Promise<number> {
  const startOfMonth = getStartOfMonthUtc();

  const result = await db
    .select({
      total: sql<string>`COALESCE(SUM(${apiUsageLog.estimatedCostEur}), '0')`,
    })
    .from(apiUsageLog)
    .where(gte(apiUsageLog.createdAt, startOfMonth));

  return parseFloat(result[0]?.total || "0");
}

/**
 * Returns spend broken down by service for the current month.
 */
export async function getCurrentMonthSpendByService(): Promise<
  Array<{ service: string; total: number; count: number }>
> {
  const startOfMonth = getStartOfMonthUtc();

  const result = await db
    .select({
      service: apiUsageLog.service,
      total: sql<string>`COALESCE(SUM(${apiUsageLog.estimatedCostEur}), '0')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(apiUsageLog)
    .where(gte(apiUsageLog.createdAt, startOfMonth))
    .groupBy(apiUsageLog.service);

  return result.map((r) => ({
    service: r.service,
    total: parseFloat(r.total),
    count: Number(r.count),
  }));
}

/**
 * Returns true if the monthly budget has been exceeded.
 */
export async function isBudgetExhausted(): Promise<boolean> {
  const spend = await getCurrentMonthSpend();
  return spend >= MONTHLY_BUDGET_USD;
}

/**
 * Returns the budget utilization as a percentage (0-100+).
 */
export async function getBudgetUtilization(): Promise<{
  spentUsd: number;
  budgetUsd: number;
  percentUsed: number;
  exhausted: boolean;
}> {
  const spentUsd = await getCurrentMonthSpend();
  const percentUsed = (spentUsd / MONTHLY_BUDGET_USD) * 100;
  return {
    spentUsd,
    budgetUsd: MONTHLY_BUDGET_USD,
    percentUsed,
    exhausted: spentUsd >= MONTHLY_BUDGET_USD,
  };
}

/**
 * Returns daily request counts for the current month (for dashboard).
 */
export async function getDailyRequestCounts(): Promise<
  Array<{ date: string; count: number }>
> {
  const startOfMonth = getStartOfMonthUtc();

  const result = await db
    .select({
      date: sql<string>`DATE(${apiUsageLog.createdAt})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(apiUsageLog)
    .where(gte(apiUsageLog.createdAt, startOfMonth))
    .groupBy(sql`DATE(${apiUsageLog.createdAt})`)
    .orderBy(sql`DATE(${apiUsageLog.createdAt})`);

  return result.map((r) => ({
    date: String(r.date),
    count: Number(r.count),
  }));
}

/**
 * Returns top queried properties for the current month (for dashboard).
 */
export async function getTopQueriedProperties(
  limit = 10,
): Promise<Array<{ propertyId: string; count: number }>> {
  const startOfMonth = getStartOfMonthUtc();

  const result = await db
    .select({
      propertyId: apiUsageLog.propertyId,
      count: sql<number>`COUNT(*)`,
    })
    .from(apiUsageLog)
    .where(
      and(
        gte(apiUsageLog.createdAt, startOfMonth),
        sql`${apiUsageLog.propertyId} IS NOT NULL`,
      ),
    )
    .groupBy(apiUsageLog.propertyId)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);

  return result.map((r) => ({
    propertyId: r.propertyId!,
    count: Number(r.count),
  }));
}
