import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dailyReportImagesTable = sqliteTable("daily_report_images", {
  id: text().primaryKey(),
  date: text().notNull(),
  desc: text().notNull(),
  url: text().notNull().unique(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const dailyReportsTable = sqliteTable("daily_reports", {
  id: text().primaryKey(),
  date: text().notNull().unique(),
  title: text().notNull(),
  weather_summary: text().notNull(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});
