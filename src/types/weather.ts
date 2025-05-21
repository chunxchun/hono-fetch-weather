import {
  pressLinksTable,
  hourlyReadingsTable,
  heatStressWorkWarningsTable,
  dailySummariesTable
} from "../db/weatherSchema";

export type PressLink =  typeof pressLinksTable.$inferInsert;
export type HourlyReading =  typeof hourlyReadingsTable.$inferInsert;
export type HeatStressWorkWarning = typeof heatStressWorkWarningsTable.$inferInsert;
export type DailySummary = typeof dailySummariesTable.$inferInsert


