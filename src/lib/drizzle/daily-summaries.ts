import { drizzle } from "drizzle-orm/d1";
import { Context } from "hono";
import { Bindings } from "@/config";
import { dailySummariesTable } from "@/db/weatherSchema";
import { eq } from "drizzle-orm";
import { DailySummary } from "@/types/weather";

export const insertDailySummary = async (
  c: Context<{ Bindings: Bindings }>,
  dailySummary: DailySummary
) => {
  try {
    const db = drizzle(c.env.DB);
    return db.insert(dailySummariesTable).values(dailySummary).returning();
  } catch (err) {
    throw err;
  }
};

export const selectDailySummaryByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  try {
    const db = drizzle(c.env.DB);
    return db
      .select()
      .from(dailySummariesTable)
      .where(eq(dailySummariesTable.date, date));
  } catch (err) {
    throw err;
  }
};

export const deleteDailySummaryByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  try {
    const db = drizzle(c.env.DB);
    return db
      .delete(dailySummariesTable)
      .where(eq(dailySummariesTable.date, date))
      .returning();
  } catch (err) {
    throw err;
  }
};

export const setDailySummaryFetchedHSWW = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  try {
    const db = drizzle(c.env.DB);
    return db
      .update(dailySummariesTable)
      .set({ fetched_hsww: true })
      .where(eq(dailySummariesTable.date, date))
      .returning();
  } catch (err) {
    throw err;
  }
};


// export const setDailySummaryFetchedPressLinks = async (
//   c: Context<{ Bindings: Bindings }>,
//   date: string
// ) => {
//   try {
//     const db = drizzle(c.env.DB);
//     return db
//       .update(dailySummariesTable)
//       .set({ fetch_pl: true })
//       .where(eq(dailySummariesTable.date, date))
//       .returning();
//   } catch (err) {
//     throw err;
//   }
// };

// export const setDailySummaryFetchedHourlyReadings = async (
//   c: Context<{ Bindings: Bindings }>,
//   date: string
// ) => {
//   try {
//     const db = drizzle(c.env.DB);
//     return db
//       .update(dailySummariesTable)
//       .set({ fetch_hr: true })
//       .where(eq(dailySummariesTable.date, date))
//       .returning();
//   } catch (err) {
//     throw err;
//   }
// };
