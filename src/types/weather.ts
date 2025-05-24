import {
  pressLinksTable,
  hourlyReadingsTable,
  heatStressWorkWarningsTable,
  dailySummariesTable,
  heatStressWorkWarningSummariesTable
} from "../db/weatherSchema";

export type PressLink =  typeof pressLinksTable.$inferInsert;
export type HourlyReading =  typeof hourlyReadingsTable.$inferInsert;
export type HeatStressWorkWarning = typeof heatStressWorkWarningsTable.$inferInsert;
export type HeatStressWorkWarningSummary = typeof heatStressWorkWarningSummariesTable.$inferInsert;
export type DailySummary = typeof dailySummariesTable.$inferInsert


