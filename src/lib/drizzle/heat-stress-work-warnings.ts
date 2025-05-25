import {
  HeatStressWorkWarning,
  HeatStressWorkWarningSummary
} from "@/types/weather";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Context } from "hono";
import { Bindings } from "@/config";
import {
  heatStressWorkWarningsTable,
  heatStressWorkWarningSummariesTable
} from "@/db/weatherSchema";

export const insertHeatStressWorkWarning = async (
  c: Context<{ Bindings: Bindings }>,
  heatStressWorkWarning: HeatStressWorkWarning
) => {
  const db = drizzle(c.env.DB);
  return db
    .insert(heatStressWorkWarningsTable)
    .values(heatStressWorkWarning)
    .returning();
};

export const selectHeatStressWorkWarningByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(heatStressWorkWarningsTable)
    .where(eq(heatStressWorkWarningsTable.report_date, date));
};

export const deleteHeatStressWorkWarningByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .delete(heatStressWorkWarningsTable)
    .where(eq(heatStressWorkWarningsTable.report_date, date));
};

export const insertHeatStressWorkWarningSummary = async (
  c: Context<{ Bindings: Bindings }>,
  heatStressWorkWarningSummary: HeatStressWorkWarningSummary
) => {
  const db = drizzle(c.env.DB);
  return db
    .insert(heatStressWorkWarningSummariesTable)
    .values(heatStressWorkWarningSummary)
    .returning();
};

export const selectHeatStressWorkWarningSummaryByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(heatStressWorkWarningSummariesTable)
    .where(eq(heatStressWorkWarningsTable.report_date, date));
};
