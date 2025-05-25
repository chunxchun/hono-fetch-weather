import { drizzle } from "drizzle-orm/d1";
import { Context } from "hono";
import { Bindings } from "@/config";
import { dailySummariesTable } from "@/db/weatherSchema";
import { eq } from "drizzle-orm";

export const setDailySummaryFetchedHSWW = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .update(dailySummariesTable)
    .set({ fetched_hsww: true })
    .where(eq(dailySummariesTable.date, date))
    .returning();
};

export const deleteDailySummaryByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .delete(dailySummariesTable)
    .where(eq(dailySummariesTable.date, date))
    .returning();
};
