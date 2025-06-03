import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Context } from "hono";
import { Bindings } from "@/config";
import {
  dailyReportImagesTable,
  dailyReportsTable,
} from "@/db/dailyReportSchema";
import { DailyReport, DailyReportImage } from "@/types/dailyReport";
import dayjs from "dayjs";

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

// image

export const insertDailyReportImage = async (
  c: Context<{ Bindings: Bindings }>,
  dailyReportImage: DailyReportImage
) => {
  const db = drizzle(c.env.DB);
  return db.insert(dailyReportImagesTable).values(dailyReportImage).returning();
};

export const selectDailyReportImagesByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(dailyReportImagesTable)
    .where(eq(dailyReportImagesTable.date, date));
};

export const deleteDailyReportImagesByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .delete(dailyReportImagesTable)
    .where(eq(dailyReportImagesTable.date, date))
    .returning();
};

export const selectDailyReportImageById = async (
  c: Context<{ Bindings: Bindings }>,
  id: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(dailyReportImagesTable)
    .where(eq(dailyReportImagesTable.id, id));
};

export const selectDailyReportImageByUrl = async (
  c: Context<{ Bindings: Bindings }>,
  url: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(dailyReportImagesTable)
    .where(eq(dailyReportImagesTable.url, url));
};

export const updateDailyReportImageById = async (
  c: Context<{ Bindings: Bindings }>,
  id: string,
  dailyReportImage: DailyReportImage
) => {
  const db = drizzle(c.env.DB);
  const today = dayjs().format("YYYY-MM-DD");
  return db
    .update(dailyReportImagesTable)
    .set({ ...dailyReportImage, updated_at: today })
    .where(eq(dailyReportImagesTable.id, id))
    .returning();
};

export const deleteDailyReportImageById = async (
  c: Context<{ Bindings: Bindings }>,
  id: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .delete(dailyReportImagesTable)
    .where(eq(dailyReportImagesTable.id, id))
    .returning();
};

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
