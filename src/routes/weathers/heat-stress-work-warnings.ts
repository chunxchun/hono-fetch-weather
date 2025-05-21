import { Bindings } from "@/config";
import { load } from "cheerio";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
dayjs.extend(customParseFormat);

import { successResponse } from "@/lib/helpers";
import type {
  HeatStressWorkWarning
} from "@/types/weather";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  return successResponse(c, `get weathers/heat-stress-work-warnings routes success`);
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

// fetch a heat stress work warning content, and save to d1
app.post("/:id/:url", async (c) => {
  const { id, url } = c.req.param();

  if (!id) {
    return c.json(
      {
        success: false,
        message: "enter a valid id for heat stress work warning",
      },
      400
    );
  }

  if (!url) {
    return c.json(
      {
        success: false,
        message: "enter a valid url for heat stress work warning",
      },
      400
    );
  }

  const decodeUrl = decodeURI(url);
  const dateStr = decodeUrl.split("/").pop()?.slice(1, 9);
  const yyyy = dateStr?.slice(0, 4);
  const mm = dateStr?.slice(4, 6);
  const dd = dateStr?.slice(6, 8);

  const date = `${yyyy}-${mm}-${dd}`;

  try {
    const content = await fetch(decodeUrl);
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

    // prepare sql
    const columns = [
      "id",
      "content",
      "url",
      "level",
      "report_date",
      "start_time",
      "cancelled_time",
      "created_at",
      "updated_at",
    ];
    const columnStr = columns.join(",");
    const tableName = "heat_stress_work_warnings";
    const insertValues = `(
    "${hsww.id}", 
    "${hsww.content}", 
    "${hsww.url}", 
    "${hsww.level}", 
    "${hsww.report_date}",
    "${hsww.start_time}",
    "${hsww.cancelled_time}",
    "${hsww.created_at}", 
    "${hsww.updated_at}"
    )`;

    const sqlInsert = `INSERT INTO ${tableName} (${columnStr}) VALUES ${insertValues}`;
    const trimmedSqlInsert = sqlInsert
      .replaceAll("\n", "")
      .replaceAll("\t", "")
      .replaceAll('\\"', '"');

    // insert to d1
    const insertResult = await c.env.DB.prepare(trimmedSqlInsert).all();

    if (!insertResult.success) {
      return c.json({
        success: false,
        message: "Error inserting heat stress work warning data to d1",
      });
    }

    return c.json(
      {
        success: true,
        message: "Create heat stress work warning success",
        results: hsww,
      },
      200
    );
  } catch (err) {
    return c.json(
      {
        success: false,
        message: `Create heat stress work warning failed`,
        err: err,
      },
      400
    );
  }
});

// fetch all heat stress work warning of a particular date
app.get("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ succss: false, message: "enter a valid date" }, 400);
  }

  if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
    return c.json(
      { succss: false, message: `${date} is not a valid date` },
      400
    );
  }

  try {
    // fetch database
    const { success, results } = await c.env.DB.prepare(
      "SELECT * FROM heat_stress_work_warnings WHERE report_date = ?"
    )
      .bind(date)
      .all();

    if (!success) {
      return c.json(
        {
          success: false,
          message: `fetch d1 heat stress work warnings failed`,
        },
        400
      );
    }

    return c.json(
      {
        success: true,
        message: `fetch d1 ${date} heat stress work warnings success`,
        results: results,
      },
      200
    );
  } catch (err) {
    return c.json(
      {
        success: false,
        message: `fetch ${date} heat stress work warnings failed`,
      },
      400
    );
  }
});

app.post("/:yyyy/:mm/:dd", async (c) => {});

export default app;