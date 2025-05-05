import { Hono } from "hono";
import { Bindings, weatherBaseUrl } from "../config";
import { load } from "cheerio";
import { v4 as uuidv4 } from "uuid";
import * as dayjs from "dayjs";

const app = new Hono<{ Bindings: Bindings }>();

// get all weather press links of a particular day from d1
app.get("/press_links/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ succss: false, message: "enter a valid date" }, 400);
  }

  if (!dayjs(date).isValid()) {
    return c.json({ succss: false, message: "enter a valid date" }, 400);
  }

  try {
    // fetch database
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM press_links WHERE press_release_date = ?"
    )
      .bind(date)
      .all();

    return c.json({ success: true, date: date, results: results });
  } catch (err) {
    return c.json({ success: false, message: err });
  }
});

// fetch from hko data, and save all weather press links of a particular day to d1
app.post("/press_links/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ succss: false, message: "enter a valid date" }, 400);
  }

  if (!dayjs(date).isValid()) {
    return c.json({ succss: false, message: "enter a valid date" }, 400);
  }

  try {
    const content = await fetch(`${weatherBaseUrl}/${yyyy}${mm}/${dd}.htm`);
    const html = await content.text();
    const $ = load(html);
    const pressLinkSelector =
      "#contentBody > div.colLeft.w635.resLeftContent > div.leftBody > ul";
    const pressLinkElements = $(pressLinkSelector).children("li");

    type PressLink = {
      id: string;
      title: string;
      url: string;
      press_release_date: string;
      created_at: string;
      updated_at: string;
    };
    const pressLinks: Array<PressLink> = [];
    const today = dayjs().format("YYYY-MM-DD");

    pressLinkElements.each((_, el) => {
      const pressLink: PressLink = {
        id: uuidv4(),
        title: $(el).text(),
        url: $(el).children("a").attr("href") || "",
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

    return c.json({ success: true, message: "done", pressLinks: pressLinks });
  } catch (err) {
    return c.json({ success: false, message: err });
  }
});

// get the heat stress work warning content from d1
app.get("/hsww/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ err: "enter a valid date" }, 400);
  }

  try {
  } catch (err) {
    return c.json({ err: err }, 500);
  }
});

// fetch a heat stress work warning content, and save the text to d1
app.post("/hsww/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ err: "enter a valid date" }, 400);
  }

  try {
  } catch (err) {
    return c.json({ err: err });
  }
});

// get the weather press hourly reading content from d1
app.get("/hourly-readings/:id", async (c) => {
  const { id } = c.req.query();

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

    if (results.length === 0) {
      return c.json({ success: false, message: "No record found" }, 400);
    }
    
    return c.json({
      success: true,
      message: "Read record success",
      results: results,
    });
  } catch (err) {
    return c.json({ success: false, message: err });
  }
});

// fetch a weather press hourly readings content, and save the text to d1
app.post("/hourly-readings", async (c) => {
  const { url } = c.req.query();

  if (!url) {
    return c.json({ success: false, message: "enter a valid url" }, 400);
  }

  // console.log(url);
  const decodeUrl = decodeURI(url);
  // console.log(decodeUrl);
  const dateStr = decodeUrl.split("/").pop()?.slice(1, 9);
  const yyyy = dateStr?.slice(0, 4);
  const mm = dateStr?.slice(4, 6);
  const dd = dateStr?.slice(6, 8);

  const date = `${yyyy}-${mm}-${dd}`;
  const baseUrl = "https://www.info.gov.hk";
  const fullUrl = `${baseUrl}${url}`;

  try {
    const content = await fetch(fullUrl);
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

    type HourlyReading = {
      id: string;
      // title: string;
      content: string;
      url: string;
      temperature: string;
      humidity: string;
      report_date: string;
      report_time: string;
      created_at: string;
      updated_at: string;
    };

    const id = uuidv4();
    const today = dayjs().format("YYYY-MM-DD");
    const hourlyReading: HourlyReading = {
      id: id,
      content: reportContent,
      url: fullUrl,
      temperature: temperature,
      humidity: humidity,
      report_time: time,
      report_date: date,
      created_at: today,
      updated_at: today,
    };
    // const columns = Object.keys(hourlyReading);
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
    const insertValues = `(
    "${hourlyReading.id}", 
    "${hourlyReading.content}", 
    "${hourlyReading.url}", 
    "${hourlyReading.temperature}", 
    "${hourlyReading.humidity}",
    "${hourlyReading.report_time}",
    "${hourlyReading.report_date}",
    "${hourlyReading.created_at}", 
    "${hourlyReading.updated_at}"
    )`;
    const sqlInsert = `INSERT INTO ${tableName} (${columnStr}) VALUES ${insertValues}`;

    // insert to d1
    await c.env.DB.prepare(sqlInsert).all();

    return c.json({
      success: true,
      message: "Create hourly reading success",
      results: hourlyReading,
    });
  } catch (err) {
    return c.json({ success: false, message: err });
  }
});

export default app;
