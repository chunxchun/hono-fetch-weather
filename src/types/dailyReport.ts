import {
  dailyReportImagesTable,
  dailyReportsTable,
} from "../db/dailyReportSchema";

export type DailyReportImage = typeof dailyReportImagesTable.$inferInsert;

export type DailyReport = typeof dailyReportsTable.$inferInsert;
