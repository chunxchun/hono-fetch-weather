import { Bindings, weatherBaseUrl } from "@/config";
import { load } from "cheerio";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
dayjs.extend(customParseFormat);

import { failedResponse, successResponse, validateDate } from "@/lib/helpers";
import type { PressLink } from "@/types/weather";
import { deletePressLinkByDate } from "@/lib/database";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  return successResponse(c, `get weather/press-links routes success`);
});

// get all weather press links of a particular day from d1
app.get("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();

  try {
    const validatedDate = validateDate(yyyy, mm, dd);

    // fetch database
    const table = "press_links";
    const sqlQuery = `SELECT * FROM ${table} WHERE press_release_date = ?`;
    const { success, results } = await c.env.DB.prepare(sqlQuery)
      .bind(validatedDate)
      .all();

    if (!success) {
      return failedResponse(c, `fetch d1 press links failed`);
    }

    return successResponse(
      c,
      `success get d1 ${validatedDate} press links`,
      results
    );
  } catch (err) {
    return failedResponse(c, `failed get d1 press links`);
  }
});

// fetch from hko data, and save all weather press links of a particular day to d1
app.post("/:yyyy/:mm/:dd", async (c) => {
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

app.put("/:yyyy/:mm/:dd", async (c) => {});

app.delete(":yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();

  try {
    const date = validateDate(yyyy, mm, dd);
    const results = await deletePressLinkByDate(c, date);
    return successResponse(
      c,
      `success delete press links for date ${date}`,
      results
    );
  } catch (err) {
    return failedResponse(
      c,
      `failed delete press links for date ${yyyy}-${mm}-${dd}`,
      JSON.stringify(err)
    );
  } // fetch database
});

export default app;
