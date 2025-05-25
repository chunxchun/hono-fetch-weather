import { Bindings } from "@/config";
import { hourlyReadingsTable } from "@/db/weatherSchema";
import { HourlyReading } from "@/types/weather";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Context } from "hono";

export const insertHourlyReading = async (
  c: Context<{ Bindings: Bindings }>,
  hourlyReading: HourlyReading
) => {
  const db = drizzle(c.env.DB);
  return db.insert(hourlyReadingsTable).values(hourlyReading).returning();
};

export const selectHourlyReportsByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(hourlyReadingsTable)
    .where(eq(hourlyReadingsTable.report_date, date));
};

export const deleteHourlyReportsByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .delete(hourlyReadingsTable)
    .where(eq(hourlyReadingsTable.report_date, date)).returning();
};

