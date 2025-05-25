import { Bindings, weatherBaseUrl } from "@/config";
import { load } from "cheerio";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
dayjs.extend(customParseFormat);

import { failedResponse, successResponse, validateDate } from "@/lib/helpers";
import type { PressLink } from "@/types/weather";
import { deletePressLinkByDate, insertPressLink } from "@/lib/database";

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

const scrapePressLinks = async (url: string) => {
  const content = await fetch(url);
  console.log(url);
  const year = url.slice(-13,-9)
  const month = url.slice(-9, -7)
  const day = url.slice(-6,-4)
  const date = `${year}-${month}-${day}` 
  
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
  return pressLinks;
};
// fetch from hko data, and save all weather press links of a particular day to d1
app.post("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = validateDate(yyyy, mm, dd);

  try {
    const fetchUrl = `${weatherBaseUrl}/${yyyy}${mm}/${dd}.htm`;
    const pressLinks = await scrapePressLinks(fetchUrl);
    const insertPromises = pressLinks.map((pressLink) =>
      insertPressLink(c, pressLink)
    );
    const results = await Promise.all(insertPromises);

    return successResponse(c, "Create press links success", results);
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
