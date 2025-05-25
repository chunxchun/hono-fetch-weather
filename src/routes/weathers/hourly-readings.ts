import {
  appBaseUrl,
  AuthGetOption,
  AuthPostOption,
  BearerAuthHeader,
  Bindings,
} from "@/config";
import { load } from "cheerio";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
dayjs.extend(customParseFormat);
import { v4 as uuidv4 } from "uuid";
import {
  failedResponse,
  getDateFromUrl,
  successResponse,
  validateDate,
} from "@/lib/helpers";
import type { HourlyReading, PressLink } from "@/types/weather";
import { insertHourlyReading, selectPressLinkByDate } from "@/lib/database";
import {
  HOURLY_READINGS_LINKS_ROUTE_PATH,
  PRESS_LINKS_ROUTE_PATH,
  WEATHERS_ROUTE_PATH,
} from "@/route.config";

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

const scrapeHourlyReading = async (url: string): Promise<HourlyReading> => {
  try {
    const date = getDateFromUrl(url);
    const content = await fetch(decodeURI(url));
    const html = await content.text();

    const $ = load(html);
    const reportSelector = "#weather_report";
    const reportContent = $(reportSelector).text();

    // extract information
    const temperature =
      reportContent.match(/(?<=WAS )(.*?)(?= DEGREES)/g)?.[0] || "";
    const humidity =
      reportContent.match(/(?<=HUMIDITY )(.*?)(?= PER)/g)?.[0] || "";
    const time =
      reportContent.match(
        /(?<=AT )(.*?)(?= AT THE HONG KONG OBSERVATORY)/g
      )?.[0] || "";

    const id = uuidv4();
    const today = dayjs().format("YYYY-MM-DD");
    const hourlyReading: HourlyReading = {
      id: id,
      content: reportContent
        .replaceAll('"', "")
        .replaceAll("\n", "")
        .replaceAll("\t", "")
        .replaceAll('\\"', '"'),
      url: url,
      temperature: temperature,
      humidity: humidity,
      report_time: time,
      report_date: date,
      created_at: today,
      updated_at: today,
    };
    return hourlyReading;
  } catch (err) {
    throw err;
  }
};

// fetch a weather press hourly readings content, and save the text to d1
app.post("/:url", async (c) => {
  const { url } = c.req.param();

  if (!url) {
    return c.json(
      { success: false, message: "enter a valid url for hourly reading" },
      400
    );
  }

  try {
    const hourlyReading = await scrapeHourlyReading(url);
    const insertResults = await insertHourlyReading(c, hourlyReading);
    return successResponse(
      c,
      `success post hourly reading success`,
      insertResults
    );
  } catch (err) {
    return failedResponse(c, `failed post hourly reading`, JSON.stringify(err));
  }
});

app.post("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();

  try {
    const date = validateDate(yyyy, mm, dd);
    // fetch press links
    const pressLinks = await selectPressLinkByDate(c, date);

    if (!pressLinks) {
      return failedResponse(c, `failed get press links for date ${date}`);
    }

    if (!pressLinks.length) {
      return failedResponse(c, `no press links found for date ${date}`);
    }

    const hourlyReadingUrls = pressLinks
      .filter((link) => link.title.includes("HOURLY READINGS"))
      .map((link) => link.url);

    const hourlyReadingPromises = hourlyReadingUrls.map((url) =>
      scrapeHourlyReading(url)
    );
    const hourlyReadings = await Promise.all(hourlyReadingPromises);
    const insertPromises = hourlyReadings.map((hourlyReading) =>
      insertHourlyReading(c, hourlyReading)
    );
    await Promise.all(insertPromises);

    return successResponse(c, `success post hourly readings for date ${date}`);
  } catch (err) {
    return failedResponse(
      c,
      `failed post hourly readings for date ${yyyy}-${mm}-${dd}`,
      JSON.stringify(err)
    );
  }

  // filter

  // post for each valid press links
});

// fetch hourly report of a particular date
app.get("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = validateDate(yyyy, mm, dd);
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
