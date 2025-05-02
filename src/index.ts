import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth'
import { cors } from 'hono/cors'

import { load } from "cheerio";
import { v4 as uuidv4 } from "uuid";
import { drizzle } from "drizzle-orm/d1";
import { generateDocx } from './lib/genDocx'
import { uuid } from "drizzle-orm/gel-core";

type Bindings = {
  MY_DOMAIN: KVNamespace;
  DB: D1Database;
  BUCKET: R2Bucket;
  API_KEY: string;
};
const app = new Hono<{ Bindings: Bindings }>();

const token = 'joerogan'
const myAppDomain = 'https://cf-react-demo-app.find2meals.workers.dev'
const allowedOrigin = [myAppDomain]

app.use('*', cors({
  origin: allowedOrigin,
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Authorization'],
}));
app.use('*', bearerAuth({ token }));

app.get("/", (c) => {
  return c.json({ name: "Hello Hono!" });
});
app.notFound((c) => c.json({ err: "File not found" }, 404));

app.get('/api/test2', async (c) => {
  console.log('test2 get')
  // const q = c.req.query('abc')
  return c.json({ name: "test2 get done" })
})

app.post('/api/test', async (c) => {
  console.log('test post')
  const q = c.req.query('q')
  console.log('query:', q)
  if (q === '123') {
    console.log('redirect')
    return c.redirect('/api/test2', 301);
  }

  return c.json({ msg: 'test post done' })
})

app.post('/api/upload-image', async (c) => {

  const key = uuidv4();
  const formData = await c.req.parseBody();
  const imageFile = formData['imageFile'];

  if (!(imageFile instanceof File)) {
    return c.json({ err: 'Not a file' }, 400);
  }

  if (imageFile.type !== "image/*") {
    return c.json({ err: "Upload file is not an image" }, 400)
  }

  try {

    const fileBuffer = await imageFile.arrayBuffer();
    const fileName = imageFile.name;
    const ext = fileName.split('.').pop();
    const path = `${key}.${ext}`
    console.log(fileName, ext, path)

    await c.env.BUCKET.put(path, fileBuffer);

    return c.json({ msg: "Image file saved to R2", imageUrl: path })
  } catch (err) {
    return c.json({ err: err }, 400)
  }
})

app.get("/api/download-image/:key", async (c) => {

  const key = c.req.param('key');

  try {

    const object = await c.env.BUCKET.get(key);

    if (object === null) {
      return c.json({ err: "File not found" }, 404);
    }

    return c.newResponse(object.body, 200, { ETag: object.httpEtag })
  } catch (err) {
    return c.json({ err: err, key: key }, 400)
  }
})

app.get('/api/daily-report-images/:id', async (c) => { })
app.post('/api/daily-report-images/:id', async (c) => { })

// get the heat stress work warning content from d1
app.get("/api/weather/heat-stress-work-warning/:yyyy/:mm/:dd", async (c) => {
  const yyyy = c.req.param("yyyy");
  const mm = c.req.param("mm");
  const dd = c.req.param("dd");
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ err: "enter a valid date" }, 400);
  }

  try {

  } catch (err) {
    return c.json({ err: err }, 500)
  }
});

// fetch a heat stress work warning content, and save the text to d1
app.post("/api/weather/heat-stress-work-warning/:yyyy/:mm/:dd", async (c) => {
  const yyyy = c.req.param("yyyy");
  const mm = c.req.param("mm");
  const dd = c.req.param("dd");
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ err: "enter a valid date" }, 400);
  }

  try { } catch (err) { return c.json({ err: err }) }
});

// get the weather press hourly reading content from d1
app.get("/api/weather/hourly-readings", async (c) => {
  const url = c.req.query("url");

  if (!url) {
    return c.json({ err: 'enter url' }, 400);;
  }

  try { } catch (err) { return c.json({ err: err }) }
});

// fetch a weather press hourly readings content, and save the text to d1
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

// get all weather press links of a particular day from d1
app.get("/api/weather/press_links/:yyyy/:mm/:dd", async (c) => {
  const yyyy = c.req.param("yyyy");
  const mm = c.req.param("mm");
  const dd = c.req.param("dd");
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ err: "enter date" }, 400);
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

// fetch from hko data, and save all weather press links of a particular day to d1
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


app.get("/api/html", async (c) => { try { } catch (err) { return c.json({ err: err }) } })
app.get("/api/docx", async (c) => {
  try {
    const docBuffer = await generateDocx('abc', c);

    try {
      const docId = uuidv4();
      await c.env.BUCKET.put(`${docId}.docx`, docBuffer);
      console.log('Successfully uploaded to R2 bucket');
    } catch (err) {
      return c.json({ error: 'Failed to upload document to storage' }, 500);

    }

  } catch (err) { return c.json({ err: err }) }
})
app.get("/api/pdf", async (c) => { try { } catch (err) { return c.json({ err: err }) } })

export default app;
