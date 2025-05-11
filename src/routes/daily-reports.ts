import { Hono } from "hono";
import { appBaseUrl, BearerAuthHeader, bearerToken, Bindings } from "../config";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { DAILY_REPORT_IMAGE } from "../types/dailyReport";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/images/:id", async (c) => {
  const { id } = c.req.param();

  try {
    return c.json({ success: true, message: `` }, 200);
  } catch (err) {
    return c.json({
      success: false,
      message: `failed get daily report image ${id}`,
    });
  }
});

app.get("/images/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ succss: false, message: `enter a valid date` }, 400);
  }

  if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
    return c.json(
      { succss: false, message: `${date} is not a valid date` },
      400
    );
  }

  try {
    // fetch database
    const table = "daily_report_images";
    const sqlQuery = `SELECT * FROM ${table} WHERE date = ?`;

    const { success, results } = await c.env.DB.prepare(sqlQuery)
      .bind(date)
      .all();

    if (!success) {
      return c.json(
        {
          success: false,
          message: `fetch d1 ${date} daily report images failed`,
        },
        400
      );
    }

    return c.json({
      success: true,
      message: `fetch d1 ${date} daily report images success`,
      results: results,
    });
  } catch (err) {
    return c.json(
      {
        success: false,
        message: `failed get daily report images for date ${date}`,
      },
      400
    );
  }
});

app.on(
  "POST",
  [
    "/images/:yyyy/:mm/:dd",
    "/images/:yyyy/:mm/:dd/",
    "/images/:yyyy/:mm/:dd/:key",
  ],
  async (c) => {
    const key = c.req.param("key") || uuidv4();
    const { yyyy, mm, dd } = c.req.param();

    if (!yyyy || !mm || !dd) {
      return c.json({ succss: false, message: `enter a valid date` }, 400);
    }

    const date = `${yyyy}-${mm}-${dd}`;

    if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
      return c.json(
        { succss: false, message: `${date} is not a valid date` },
        400
      );
    }

    const formData = await c.req.parseBody();
    const imageFile = formData["image_file"];

    if (!imageFile) {
      return c.json(
        { success: false, message: `no image_file from form data` },
        400
      );
    }

    if (!(imageFile instanceof File)) {
      return c.json(
        { success: false, message: "image_file is not a valid file" },
        400
      );
    }

    const acceptedImageTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (!acceptedImageTypes.includes(imageFile.type)) {
      return c.json(
        { success: false, message: "image_file is not of image type" },
        400
      );
    }

    const imageDesc = formData["image_desc"];

    if (!imageDesc) {
      return c.json(
        { success: false, message: `no image_desc from form data` },
        400
      );
    }

    if (typeof imageDesc !== 'string' ) {
      return c.json(
        { success: false, message: "image_desc is not a string" },
        400
      );
    }

    try {
      // save image to r2
      const fileBuffer = await imageFile.arrayBuffer();
      const fileName = imageFile.name;
      const ext = fileName.split(".").pop();
      const path = `${key}.${ext}`;
      const folder = `daily-report-images`;
      const putR2Result = await c.env.BUCKET.put(
        `${folder}/${date}/${path}`,
        fileBuffer
      );

      if (!putR2Result) {
        return c.json({ success: false, message: `fail put r2` }, 400);
      }

      const { key: R2Key } = putR2Result;

      // const uploadUrl = `https://${appBaseUrl}/api/images/upload/${key}`;

      // save data to d1

      // prepare sql
      const columns = ["id", "date", "desc", "url", "created_at", "updated_at"];
      const columnStr = columns.join(",");
      const tableName = "daily_report_images";
      const insertValues = `()`;
      const today = dayjs().format("YYYY-MM-DD");
      const dailyReportImage: DAILY_REPORT_IMAGE = {
        id: key,
        date: date,
        desc: imageDesc,
        url: R2Key,
        created_at: today,
        updated_at: today,
      };
      const sqlInsert = `INSERT INTO ${tableName} (${columnStr}) VALUES ${insertValues}`;

      const insertD1Result = await c.env.DB.prepare(sqlInsert).all();

      if (!insertD1Result.success) {
        return c.json({
          success: false,
          message: "failed insert daily report image data to d1",
        });
      }
      return c.json(
        {
          success: true,
          message: "success insert daily report image data to d1",
          results: dailyReportImage,
        },
        200
      );
    } catch (err) {
      return c.json(
        { success: false, message: `fail post image on ${date}`, err: err },
        400
      );
    }
  }
);

export default app;
