import { Hono } from "hono";
import { Bindings, weatherBaseUrl } from "../config";
import { load } from "cheerio";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import type { PressLink, HourlyReading, HSWW } from "../types/weather";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  return c.json(
    { success: true, message: "fetch weather routes success" },
    200
  );
});

// get all weather press links of a particular day from d1
app.get("/press_links/:yyyy/:mm/:dd", async (c) => {
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
  // return c.json({ date: `${date}` });
  try {
    // fetch database
    const { success, results } = await c.env.DB.prepare(
      "SELECT * FROM press_links WHERE press_release_date = ?"
    )
      .bind(date)
      .all();

    if (!success) {
      return c.json({ success: false, message: `fetch d1 press links failed` }, 400)
    }

    return c.json({
      success: true,
      message: `fetch d1 ${date} press links success`,
      results: results,
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `fetch ${date} press links failed`,
      err: err,
    });
  }
});

// fetch from hko data, and save all weather press links of a particular day to d1
app.post("/press_links/:yyyy/:mm/:dd", async (c) => {
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
    const content = await fetch(`${weatherBaseUrl}/${yyyy}${mm}/${dd}.htm`);
    const html = await content.text();
    const $ = load(html);
    const pressLinkSelector =
      "#contentBody > div.colLeft.w635.resLeftContent > div.leftBody > ul";
    const pressLinkElements = $(pressLinkSelector).children("li");

    const pressLinks: Array<PressLink> = [];
    const today = dayjs().format("YYYY-MM-DD");

    pressLinkElements.each((_, el) => {
      const pressLink: PressLink = {
        id: uuidv4(),
        title: $(el).text(),
        url: "https://www.info.gov.hk" + $(el).children("a").attr("href") || "",
        press_release_date: date,
        created_at: today,
        updated_at: today,
      };
      pressLinks.push(pressLink);
    });
    const columns = [
      "id",
      "title",
      "url",
      "press_release_date",
      "created_at",
      "updated_at",
    ];
    const columnStr = columns.join(",");
    const tableName = "press_links";
    const insertValues = pressLinks.reduce((prev, curr) => {
      return (
        prev +
        `("${curr.id}", "${curr.title}", "${curr.url}", "${curr.press_release_date}", "${curr.created_at}", "${curr.updated_at}"),`
      );
    }, "");
    const valueStr = insertValues.slice(0, -1) + ";";
    const sqlInsert = `INSERT INTO ${tableName} (${columnStr}) VALUES ${valueStr}`;

    await c.env.DB.prepare(sqlInsert).all();

    return c.json(
      {
        success: true,
        message: "Create press links success",
        results: pressLinks,
      },
      200
    );
  } catch (err) {
    return c.json({ success: false, message: err }, 400);
  }
});

app.get('/hsww/:yyyy/:mm/:dd', async (c) => {
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
      return c.json({ success: false, message: `fetch d1 heat stress work warnings failed` }, 400)
    }

    return c.json({
      success: true,
      message: `fetch d1 ${date} heat stress work warnings success`,
      results: results
    }, 200);
  } catch (err) {
    return c.json({
      success: false,
      message: `fetch ${date} heat stress work warnings failed`
    }, 400)
  }
})

// get the heat stress work warning content from d1
app.get("/hsww/:id", async (c) => {
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

// fetch a heat stress work warning content, and save the text to d1
app.post("/hsww/:id/:url", async (c) => {
  const { id, url } = c.req.param();

  if (!id) {
    return c.json({ success: false, message: "enter a valid id for hsww" }, 400);
  }

  if (!url) {
    return c.json({ success: false, message: "enter a valid url for hsww" }, 400);
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
    const hsww: HSWW = {
      id: id,
      content: reportContent.replaceAll('"', ''),
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
    const trimmedSqlInsert = sqlInsert.replaceAll("\n", "").replaceAll("\t", "").replaceAll("\\\"", "\"")

    // insert to d1
    const insertResult = await c.env.DB.prepare(trimmedSqlInsert).all();

    if (!insertResult.success) {
      return c.json({ success: false, message: "Error inserting heat stress work warning data to d1" })
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

app.get('/hourly_readings/:yyyy/:mm/:dd', async (c) => {
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
      return c.json({ success: false, message: `fetch d1 ${date} hourly readings failed` }, 400)
    }

    return c.json({
      success: true,
      message: `fetch d1 ${date} hourly readings success`,
      results: results,
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `fetch ${date} press links failed`,
      err: err,
    });
  }
})

// get the weather press hourly reading content from d1
app.get("/hourly_readings/:id", async (c) => {
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
app.post("/hourly_readings/:id/:url", async (c) => {
  const { id, url } = c.req.param();

  if (!id) {
    return c.json({ success: false, message: "enter a valid id for hourly reading" }, 400);
  }

  if (!url) {
    return c.json({ success: false, message: "enter a valid url for hourly reading" }, 400);
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
      content: reportContent.replaceAll('"', ''),
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
    const trimmedSqlInsert = sqlInsert.replaceAll("\n", "").replaceAll("\t", "").replaceAll("\\\"", "\"")

    // insert to d1
    const insertResult = await c.env.DB.prepare(trimmedSqlInsert).all();

    if (!insertResult.success) {
      return c.json({ success: false, message: "Error inserting hourly reading data to d1" })
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

export default app;
