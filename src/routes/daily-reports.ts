import {
  dailyReportImagesTable,
  dailyReportManPowersTable,
} from "@/db/dailyReportSchema";
import {
  deleteDailyReportImageByUrl,
  insertDailyReportImage,
  selectDailyReportImageById,
  selectDailyReportImagesByDate,  
  updateDailyReportImageById,
} from "@/lib/drizzle/daily-report-images";
import {
  failedResponse,
  successResponse,
  validateDate,
  validateFormDataString,
} from "@/lib/helpers";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { Bindings } from "../config";
import type {
  DailyReportImage,
  DailyReportImageUpdate,
} from "../types/dailyReport";

const app = new Hono<{ Bindings: Bindings }>();




export default app;
