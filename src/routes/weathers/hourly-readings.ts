import { Bindings } from "@/config";
import { load } from "cheerio";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
dayjs.extend(customParseFormat);

import { successResponse } from "@/lib/helpers";
import type {
  HourlyReading
} from "@/types/weather";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  return successResponse(c, `get weathers/hourly-readings routes success`);
});

// get the weather press hourly reading content from d1
app.get("/:id", async (c) => {
  const { id } = c.req.param();

  if (!id) {
    return c.json({ success: false, message: "enter a valid id" }, 400);
  }

  try {
    // fetch database
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM hourly_readings WHERE id = ?"
    )
      .bind(id)
      .all();

    return c.json(
      {
        success: true,
        message: "Read hourly reading success",
        results: results,
      },
      200
    );
  } catch (err) {
    return c.json(
      {
        success: false,
        message: "Read hourly reading failed",
        err: err,
      },
      400
    );
  }
});

// fetch a weather press hourly readings content, and save the text to d1
app.post("/:id/:url", async (c) => {
  const { id, url } = c.req.param();

  if (!id) {
    return c.json(
      { success: false, message: "enter a valid id for hourly reading" },
      400
    );
  }

  if (!url) {
    return c.json(
      { success: false, message: "enter a valid url for hourly reading" },
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
    const reportSelector = "#weather_report";
    const reportContent = $(reportSelector).text();

    // extract information
    const temperature =
      reportContent.match(
        /(?<=THE AIR TEMPERATUREWAS )(.*?)(?= DEGREES CELSIUS)/g
      )?.[0] || "";
    const humidity =
      reportContent.match(/(?<=RELATIVE HUMIDITY )(.*?)(?= PERCENT)/g)?.[0] ||
      "";
    const time =
      reportContent.match(
        /(?<=AT )(.*?)(?= AT THE HONG KONG OBSERVATORY)/g
      )?.[0] || "";

    const today = dayjs().format("YYYY-MM-DD");
    const hourlyReading: HourlyReading = {
      id: id,
      content: reportContent.replaceAll('"', ""),
      url: url,
      temperature: temperature,
      humidity: humidity,
      report_time: time,
      report_date: date,
      created_at: today,
      updated_at: today,
    };

    // prepare sql
    const columns = [
      "id",
      "content",
      "url",
      "temperature",
      "humidity",
      "report_time",
      "report_date",
      "created_at",
      "updated_at",
    ];
    const columnStr = columns.join(",");
    const tableName = "hourly_readings";
    const insertValues = `("${hourlyReading.id}", "${hourlyReading.content}", "${hourlyReading.url}", "${hourlyReading.temperature}", "${hourlyReading.humidity}", "${hourlyReading.report_time}", "${hourlyReading.report_date}", "${hourlyReading.created_at}", "${hourlyReading.updated_at}")`;
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
        message: "Error inserting hourly reading data to d1",
      });
    }

    return c.json(
      {
        success: true,
        message: "Create hourly reading success",
        results: hourlyReading,
      },
      200
    );
  } catch (err) {
    return c.json(
      {
        success: false,
        message: "Create hourly reading failed",
        err: err,
      },
      400
    );
  }
});

// fetch hourly report of a particular date
app.get("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ succss: false, message: `enter a valid date` }, 400);
  }
  // dayjs('2022-01-33').isValid();
  // true, parsed to 2022-02-02
  if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
    return c.json(
      { succss: false, message: `${date} is not a valid date` },
      400
    );
  }

  try {
    // fetch database
    const { success, results } = await c.env.DB.prepare(
      "SELECT * FROM hourly_readings WHERE report_date = ?"
    )
      .bind(date)
      .all();

    if (!success) {
      return c.json(
        { success: false, message: `fetch d1 ${date} hourly readings failed` },
        400
      );
    }

    return c.json({
      success: true,
      message: `fetch d1 ${date} hourly readings success`,
      results: results,
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `fetch d1 ${date} hourly readings failed`,
      err: err,
    });
  }
});

export default app;
