import { drizzle } from "drizzle-orm/d1";
import { dailyReportImagesTable } from "../db/dailyReportSchema";
import { Context } from "hono";
import { Bindings } from "../config";

export type DailyReportImage = typeof dailyReportImagesTable.$inferInsert;

export const insertDailyReportImage = async (
  c: Context<{ Bindings: Bindings }>,
  dailyReportImage: DailyReportImage
) => {
  const db = drizzle(c.env.DB);
  return db.insert(dailyReportImagesTable).values(dailyReportImage).returning();
};
