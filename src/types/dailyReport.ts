import {
  dailyReportImagesTable,
  dailyReportManPowersTable,
  dailyReportsTable,
} from "../db/dailyReportSchema";

export type DailyReportManPower = typeof dailyReportManPowersTable.$inferInsert;
export type DailyReportManPowerUpdate = Partial<DailyReportManPower>;

export type DailyReportImage = typeof dailyReportImagesTable.$inferInsert;
export type DailyReportImageUpdate = Partial<DailyReportImage>;

export type DailyReport = typeof dailyReportsTable.$inferInsert;
export type DailyReportUpdate = Partial<DailyReport>;