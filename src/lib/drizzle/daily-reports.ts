import { Bindings } from "@/config";
import {
  dailyReportsTable
} from "@/db/dailyReportSchema";
import { DailyReport } from "@/types/dailyReport";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Context } from "hono";

export const insertDailyReport = async (
  c: Context<{ Bindings: Bindings }>,
  dailyReport: DailyReport
) => {
  const db = drizzle(c.env.DB);
  return db.insert(dailyReportsTable).values(dailyReport).returning();
};

export const deleteDailyReportById = async (
  c: Context<{ Bindings: Bindings }>,
  id: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .delete(dailyReportsTable)
    .where(eq(dailyReportsTable.id, id))
    .returning();
};

export const deleteDailyReportByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .delete(dailyReportsTable)
    .where(eq(dailyReportsTable.date, date))
    .returning();
};

export const selectDailyReportById = async (
  c: Context<{ Bindings: Bindings }>,
  dailyReportId: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(dailyReportsTable)
    .where(eq(dailyReportsTable.id, dailyReportId));
};

export const selectDailyReportByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(dailyReportsTable)
    .where(eq(dailyReportsTable.date, date));
};

