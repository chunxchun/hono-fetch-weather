import { integer, sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const dailyReportImagesTable = sqliteTable("daily_report_images", {
  id: text().primaryKey(),
  date: text().notNull(),
  desc: text().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  url: text().notNull(),
  building: text().notNull(),
  level: text().notNull(),
  location: text().notNull(),
  substrate: text().notNull(),
  work: text().notNull(),
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

export const dailyReportManPowersTable = sqliteTable(
  "daily_report_man_powers",
  {
    id: text().primaryKey(),
    date: text().notNull(),
    work_desc: text().notNull(), // string array -> json
    quantity: integer().notNull(),
    man_count: integer().notNull(),
    location: text().notNull(),
    remarks: text().notNull(),
    created_at: text().notNull(),
    updated_at: text().notNull(),
  }
);
