import { Bindings } from "@/config";
import { dailyReportManPowersTable } from "@/db/dailyReportSchema";
import { DailyReportManPower, DailyReportManPowerUpdate } from "@/types/dailyReport";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Context } from "hono";

export const insertDailyReportManPower = async (
  c: Context<{ Bindings: Bindings }>,
  dailyReportManPower: DailyReportManPower
) => {
  const db = drizzle(c.env.DB);
  const today = dayjs().format("YYYY-MM-DD");
  return db
    .insert(dailyReportManPowersTable)
    .values({ ...dailyReportManPower, created_at: today, updated_at: today })
    .returning();
};

export const selectDailyReportManPowersByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db.select().from(dailyReportManPowersTable).where(eq(dailyReportManPowersTable.date, date));
};

export const deleteDailyReportManPowersByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db.delete(dailyReportManPowersTable).where(eq(dailyReportManPowersTable.date, date)).returning();
};

export const selectDailyReportManPowerById = async (
  c: Context<{ Bindings: Bindings }>,
  id: string
) => {
  const db = drizzle(c.env.DB);
  return db.select().from(dailyReportManPowersTable).where(eq(dailyReportManPowersTable.id, id));
};

export const updateDailyReportManPowersById = async (
  c: Context<{ Bindings: Bindings }>,
  id: string,
  dailyReportManPower: DailyReportManPowerUpdate
) => {
  const db = drizzle(c.env.DB);
  const today = dayjs().format("YYYY-MM-DD");
  return db.update(dailyReportManPowersTable).set({ ...dailyReportManPower, updated_at: today }).where(eq(dailyReportManPowersTable.id, id)).returning();
};

export const deleteDailyReportManPowerById = async (
  c: Context<{ Bindings: Bindings }>,
  id: string
) => {
  const db = drizzle(c.env.DB);
  return db.delete(dailyReportManPowersTable).where(eq(dailyReportManPowersTable.id, id)).returning();
};





