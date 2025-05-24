import { Bindings } from "@/config";
import { load } from "cheerio";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
dayjs.extend(customParseFormat);

import {
  failedResponse,
  getDateFromUrl,
  successResponse,
  validateDate,
} from "@/lib/helpers";
import type { HeatStressWorkWarning, HeatStressWorkWarningSummary } from "@/types/weather";
import {
  insertHeatStressWorkWarning,
  insertHeatStressWorkWarningSummary,
  selectHeatStressWorkWarningByDate,
  selectHeatStressWorkWarningSummaryByDate,
  selectPressLinkByDate,
} from "@/lib/database";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  return successResponse(
    c,
    `get weathers/heat-stress-work-warnings routes success`
  );
});

// get the heat stress work warning content from d1
app.get("/:id", async (c) => {
  const { id } = c.req.param();

  if (!id) {
    return c.json({ success: false, message: "enter a valid id" }, 400);
  }

  try {
    // fetch database
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM heat_stress_work_warnings WHERE id = ?"
    )
      .bind(id)
      .all();

    return c.json(
      {
        success: true,
        message: "Read heat stress work warning success",
        results: results,
      },
      200
    );
  } catch (err) {
    return c.json(
      {
        success: false,
        message: "Read heat stress work warning failed",
        err: err,
      },
      400
    );
  }
});

const scrapeHeatStressWorkWarning = async (
  url: string
): Promise<HeatStressWorkWarning> => {
  try {
    const date = getDateFromUrl(url);
    const content = await fetch(decodeURI(url));
    const html = await content.text();

    const $ = load(html);
    const reportSelector = "#pressrelease";
    const reportContent = $(reportSelector).text();

    // extract information
    const level =
      reportContent.match(
        /(?<=A reminder from the Labour Department: The )(.*?)(?= Heat Stress at Work Warning)/g
      )?.[0] || "";
    const start_time =
      reportContent.match(
        /(?<=Heat Stress at Work Warning is in force as of )(.*?)(?= today)/g
      )?.[0] || "";
    const cancelled_time =
      reportContent.match(
        /(?<=The Heat Stress at Work Warning has been cancelled at )(.*?)(?= today)/g
      )?.[0] || "";

    const today = dayjs().format("YYYY-MM-DD");
    const id = uuidv4();
    const hsww: HeatStressWorkWarning = {
      id: id,
      content: reportContent.replaceAll('"', ""),
      url: url,
      level: level,
      report_date: date,
      start_time: start_time,
      cancelled_time: cancelled_time,
      created_at: today,
      updated_at: today,
    };
    return hsww;
  } catch (err) {
    throw err;
  }
};

// fetch a heat stress work warning content, and save to d1
app.post("/:url", async (c) => {
  const { url } = c.req.param();

  if (!url) {
    return c.json(
      {
        success: false,
        message: "enter a valid url for heat stress work warning",
      },
      400
    );
  }

  try {
    const hsww = await scrapeHeatStressWorkWarning(url);
    const insertResults = await insertHeatStressWorkWarning(c, hsww);
    return successResponse(
      c,
      "Create heat stress work warning success",
      insertResults
    );
  } catch (err) {
    return failedResponse(
      c,
      `Create heat stress work warning failed`,
      JSON.stringify(err)
    );
  }
});

// fetch all hsww on a particular date
app.get("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = validateDate(yyyy, mm, dd);

  try {
    // fetch database
    const fetchResults = await selectHeatStressWorkWarningByDate(c, date);

    if (!fetchResults) {
      return failedResponse(
        c,
        `fetch d1 ${date} heat stress work warnings failed`
      );
    }

    return successResponse(
      c,
      `fetch d1 ${date} heat stress work warnings success`,
      fetchResults
    );
  } catch (err) {
    return failedResponse(
      c,
      `fetch d1 ${date} heat stress work warnings failed`,
      JSON.stringify(err)
    );
  }
});

// fetch all heat stress work warning of a particular date
app.get("/daily-summaries/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();

  try {
    // fetch database
    const date = validateDate(yyyy, mm, dd);
    const fetchResults = await selectHeatStressWorkWarningSummaryByDate(
      c,
      date
    );
    return successResponse(
      c,
      `fetch d1 ${date} heat stress work warnings summary success`,
      fetchResults
    );
  } catch (err) {
    return failedResponse(
      c,
      `fetch  heat stress work warnings summary failed`,
      JSON.stringify(err)
    );
  }
});

app.post("/daily-summaries/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();

  try { 
    const date = validateDate(yyyy, mm, dd);
    // get press links
    const pressLinks = await selectPressLinkByDate(c,date)
    
    if (!pressLinks) {
      return failedResponse(c, `failed get press links for date ${date}`);
    }

    if (!pressLinks.length) {
      return failedResponse(c, `no press links found for date ${date}`);
    }

    const heatStressWorkWarningUrls = pressLinks
    .filter((link) => link.title.toLowerCase().includes("heat stress"))
    .map((link) => link.url);

    if (heatStressWorkWarningUrls.length === 0) {
      const today = dayjs().format('YYYY-MM-DD');
      const emptyHeatStressWorkWarningSummary: HeatStressWorkWarningSummary = {
        id: uuidv4(),
        heat_stress_work_warnings: "",
        report_date: date,
        created_at: today,
        updated_at: today
      }
      const insertResults = await insertHeatStressWorkWarningSummary(c, emptyHeatStressWorkWarningSummary);
      return successResponse(c, `success create empty heat stress work summary for date ${date}`)
    }

    const heatStressWorkWarningPromises = heatStressWorkWarningUrls.map(url => scrapeHeatStressWorkWarning(url));
    const heatStressWorkWarnings = await Promise.all(heatStressWorkWarningPromises)
    const insertPromises = heatStressWorkWarnings.map(hsww => insertHeatStressWorkWarning(c, hsww))
    await Promise.all(insertPromises)

    // create hsww summary

    // in force: The Amber Heat Stress at Work Warning is still in force
    // cancelled: The Heat Stress at Work Warning has been cancelled at 04.40 PM today (May 23).

  }catch(err){

  }
});

export default app;
