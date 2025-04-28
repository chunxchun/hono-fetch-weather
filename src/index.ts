import { Hono } from "hono";
import { load } from "cheerio";
import { v4 as uuidv4 } from "uuid";
import { drizzle } from "drizzle-orm/d1";

type Bindings = {
  // DAILY_WEATHER_REPORT_LINKS: KVNamespace;
  DB: D1Database;
  API_KEY: string;
};
const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.notFound((c) => c.text("404", 404));

// const saveToD1 = async (c) => {
//   const db = drizzle(c.env.DB);
//   const result = await db.select().from(press_release).all();
// };
app.get("/api/weather/hourly-readings/:yyyy/:mm/:dd", async (c) => {
  const yyyy = c.req.param("yyyy");
  const mm = c.req.param("mm");
  const dd = c.req.param("dd");
  const date = `${yyyy}-${mm}-${dd}`;

  // get all hourly readings for [date]
});
// get a weather press hourly readings content, and save the text to d1
app.post("/api/weather/hourly-readings", async (c) => {
  const url = c.req.query("url");

  if (!url) {
    return c.text("enter url", 400);
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
  const content = await fetch(`${baseUrl}${url}`);
  const html = await content.text();

  const $ = load(html);
  const reportSelector = "#weather_report";
  const reportText = $(reportSelector).text();
  const temperature =
    reportText.match(
      /(?<=THE AIR TEMPERATUREWAS )(.*?)(?= DEGREES CELSIUS)/g
    )?.[0] || "";
  const humidity =
    reportText.match(/(?<=RELATIVE HUMIDITY )(.*?)(?= PERCENT)/g)?.[0] || "";
  const time =
    reportText.match(/(?<=AT )(.*?)(?= AT THE HONG KONG OBSERVATORY)/g)?.[0] ||
    "";
  return c.json({
    report: reportText,
    temperature: temperature,
    humidity: humidity,
    report_time: time,
    report_date: date,
  });
});

app.get("/api/weather/press_links/:yyyy/:mm/:dd", async (c) => {
  const yyyy = c.req.param("yyyy");
  const mm = c.req.param("mm");
  const dd = c.req.param("dd");
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.text("enter date", 400);
  }

  try {
    // fetch database
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM press_releases WHERE press_date = ?"
    )
      .bind(date)
      .all();

    return c.json({ date: date, results: results });
  } catch (err) {
    return c.json({ err: err });
  }
});

app.post("/api/weather/press_links/:yyyy/:mm/:dd", async (c) => {
  const yyyy = c.req.param("yyyy");
  const mm = c.req.param("mm");
  const dd = c.req.param("dd");
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.text("enter date", 400);
  }

  // if ()
  try {
    const baseUrl = "https://www.info.gov.hk/gia/wr";
    const content = await fetch(`${baseUrl}/${yyyy}${mm}/${dd}.htm`);
    const html = await content.text();
    const $ = load(html);
    const pressLinkSelector =
      "#contentBody > div.colLeft.w635.resLeftContent > div.leftBody > ul";
    const pressLinks = $(pressLinkSelector).children("li");

    const result: Array<{
      id: string;
      title: string;
      url: string;
      press_date: string;
    }> = [];

    pressLinks.each((_, el) => {
      const pressLink = {
        id: uuidv4(),
        title: $(el).text(),
        url: $(el).children("a").attr("href") || "",
        press_date: date,
      };
      result.push(pressLink);
    });
    const columns = ["id", "title", "url", "press_date"];
    const columnStr = columns.join(",");
    const tableName = "press_releases";
    const insertValues = result.reduce((prev, curr) => {
      return (
        prev +
        `("${curr.id}", "${curr.title}", "${curr.url}", "${curr.press_date}"),`
      );
    }, "");
    const valueStr = insertValues.slice(0, -1) + ";";
    const sqlInsert = `INSERT INTO ${tableName} (${columnStr}) VALUES ${valueStr}`;

    await c.env.DB.prepare(sqlInsert).all();

    return c.json({ msg: "done", pressLinks: result });
  } catch (err) {
    return c.json({ err: err });
  }
});

export default app;
