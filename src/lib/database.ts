import { drizzle } from "drizzle-orm/d1";
import {
  dailyReportImagesTable,
  dailyReportsTable,
} from "../db/dailyReportSchema";
import { Context } from "hono";
import { Bindings } from "../config";
import { DailyReport, DailyReportImage } from "../types/dailyReport";
import {
  DailySummary,
  HeatStressWorkWarning,
  HourlyReading,
  PressLink,
} from "../types/weather";
import {
  heatStressWorkWarningsTable,
  hourlyReadingsTable,
  pressLinksTable,
  dailySummariesTable,
} from "../db/weatherSchema";
import { eq } from "drizzle-orm";
import { link } from "fs";

// daily report
export const deleteDailyReportImageByUrl = async (
  c: Context<{ Bindings: Bindings }>,
  url: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .delete(dailyReportImagesTable)
    .where(eq(dailyReportImagesTable.url, url))
    .returning();
};

export const insertDailyReport = async (
  c: Context<{ Bindings: Bindings }>,
  dailyReport: DailyReport
) => {
  const db = drizzle(c.env.DB);
  return db.insert(dailyReportsTable).values(dailyReport).returning();
};

export const readDailyReportById = async (
  c: Context<{ Bindings: Bindings }>,
  dailyReportId: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(dailyReportsTable)
    .where(eq(dailyReportsTable.id, dailyReportId));
};

export const readDailyReportByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(dailyReportsTable)
    .where(eq(dailyReportsTable.date, date));
};

// daily report image

export const insertDailyReportImage = async (
  c: Context<{ Bindings: Bindings }>,
  dailyReportImage: DailyReportImage
) => {
  const db = drizzle(c.env.DB);
  return db.insert(dailyReportImagesTable).values(dailyReportImage).returning();
};

// press link

export const insertPressLink = async (
  c: Context<{ Bindings: Bindings }>,
  pressLink: PressLink
) => {
  const db = drizzle(c.env.DB);
  return db.insert(pressLinksTable).values(pressLink).returning();
};

export const selectPressLinkByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(pressLinksTable)
    .where(eq(pressLinksTable.press_release_date, date));
};
// hourly reading

export const insertHourlyReading = async (
  c: Context<{ Bindings: Bindings }>,
  hourlyReading: HourlyReading
) => {
  const db = drizzle(c.env.DB);
  return db.insert(hourlyReadingsTable).values(hourlyReading).returning();
};

export const selectHourlyReportByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(hourlyReadingsTable)
    .where(eq(hourlyReadingsTable.report_date, date));
};
// heat stress work warning

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

// daily summary

export const insertDailySummary = async (
  c: Context<{ Bindings: Bindings }>,
  dailySummary: DailySummary
) => {
  try {
    const db = drizzle(c.env.DB);
    console.log(`insert `, dailySummary)
    return db.insert(dailySummariesTable).values(dailySummary).returning();
  } catch (err) {
    throw err;
  }
};

export const selectDailySummaryByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(dailySummariesTable)
    .where(eq(dailySummariesTable.date, date));
};
