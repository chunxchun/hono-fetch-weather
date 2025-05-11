import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pressLinksTable = sqliteTable("press_links", {
  id: text().primaryKey(),
  title: text().notNull(),
  url: text().notNull(),
  press_release_date: text().notNull(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const hourlyReadingsTable = sqliteTable("hourly_readings", {
  id: text().primaryKey(),
  content: text().notNull(),
  url: text().notNull(),
  temperature: text().notNull(),
  humidity: text().notNull(),
  report_time: text().notNull(),
  report_date: text().notNull(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const heatStressWorkWarningsTable = sqliteTable(
  "heat_stress_work_warnings",
  {
    id: text().primaryKey(),
    content: text().notNull(),
    url: text().notNull(),
    level: text().notNull(),
    report_date: text().notNull(),
    start_time: text().notNull(),
    cancelled_time: text().notNull(),
    created_at: text().notNull(),
    updated_at: text().notNull(),
  }
);

export const dailySummariesTable = sqliteTable("daily_summaries", {
  id: text().primaryKey(),
  min_temperature: text().notNull(),
  max_temperature: text().notNull(),
  min_humidity: text().notNull(),
  max_humidity: text().notNull(),
});
