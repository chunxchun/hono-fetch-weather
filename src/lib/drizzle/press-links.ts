import { drizzle } from "drizzle-orm/d1";
import { Context } from "hono";
import { Bindings } from "@/config";
import { pressLinksTable } from "@/db/weatherSchema";
import { eq } from "drizzle-orm";
import { PressLink } from "@/types/weather";

export const insertPressLink = async (
  c: Context<{ Bindings: Bindings }>,
  pressLink: PressLink
) => {
  const db = drizzle(c.env.DB);
  return db.insert(pressLinksTable).values(pressLink).returning();
};

export const selectPressLinksByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .select()
    .from(pressLinksTable)
    .where(eq(pressLinksTable.press_release_date, date));
};

export const deletePressLinksByDate = async (
  c: Context<{ Bindings: Bindings }>,
  date: string
) => {
  const db = drizzle(c.env.DB);
  return db
    .delete(pressLinksTable)
    .where(eq(pressLinksTable.press_release_date, date));
};