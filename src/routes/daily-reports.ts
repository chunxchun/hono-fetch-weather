import { Hono } from "hono";
import { Bindings } from "../config";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { DailyReportImage } from "../types/dailyReport";
import { drizzle } from "drizzle-orm/d1";
import { dailyReportImagesTable } from "../db/dailyReportSchema";
import { eq } from "drizzle-orm";
import { insertDailyReportImage } from "../lib/database";
import { validateFormDataString } from "../lib/helpers";

const app = new Hono<{ Bindings: Bindings }>();

// app.get("/images/:id", async (c) => {
//   const { id } = c.req.param();

//   try {
//     return c.json(
//       { success: true, message: `success get daily report image ${id}` },
//       200
//     );
//   } catch (err) {
//     return c.json({
//       success: false,
//       message: `failed get daily report image ${id}`,
//     });
//   }
// });

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
    // const sqlQuery = `SELECT * FROM ${table} WHERE date = ?`;

    // const { success, results } = await c.env.DB.prepare(sqlQuery)
    //   .bind(date)
    //   .all();
    const db = drizzle(c.env.DB);
    const results = await db
      .select()
      .from(dailyReportImagesTable)
      .where(eq(dailyReportImagesTable.date, date));

    // if (!success) {
    //   return c.json(
    //     {
    //       success: false,
    //       message: `fetch d1 ${date} daily report images failed`,
    //     },
    //     400
    //   );
    // }

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
      return c.json({ success: false, message: `enter a valid date` }, 400);
    }

    const date = `${yyyy}-${mm}-${dd}`;

    if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
      return c.json(
        { succss: false, message: `${date} is not a valid date` },
        400
      );
    }

    // console.log(`post daily image date ${date}`);

    const formData = await c.req.parseBody();

    const imageFile = formData["image_file"];

    const imageDesc = formData["image_desc"]
      ? validateFormDataString(formData["image_desc"])
      : "";

    const imageWidth = formData["image_width"]
      ? validateFormDataString(formData["image_width"])
      : "0";
    const imageHeight = formData["image_height"]
      ? validateFormDataString(formData["image_height"])
      : "0";
    const reportDate = formData["report_date"]
      ? validateFormDataString(formData["report_date"])
      : "";
    const building = formData["building"]
      ? validateFormDataString(formData["building"])
      : "";
    const level = formData["level"]
      ? validateFormDataString(formData["level"])
      : "";
    const location = formData["location"]
      ? validateFormDataString(formData["location"])
      : "";
    const substrate = formData["substrate"]
      ? validateFormDataString(formData["substrate"])
      : "";
    const work = formData["work"]
      ? validateFormDataString(formData["work"])
      : "";
    console.log(location, substrate, work);
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
    console.log("passed guade clause");
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
      console.log(`success put image to r2, ${R2Key}`);

      // save data to d1
      // prepare sql
      const today = dayjs().format("YYYY-MM-DD");
      // const columns = [
      //   "id",
      //   "date",
      //   "desc",
      //   "url",
      //   "building",
      //   "level",
      //   "location",
      //   "substrate",
      //   "work",
      //   "created_at",
      //   "updated_at",
      // ];
      // const columnStr = columns.join(",");
      const dailyReportImage: DailyReportImage = {
        id: key,
        date: date,
        desc: imageDesc,
        width: parseInt(imageWidth),
        height: parseInt(imageHeight),
        url: R2Key,
        building: building,
        level: level,
        location: location,
        substrate: substrate,
        work: work,
        created_at: today,
        updated_at: today,
      };
      // const tableName = "daily_report_images";
      // const insertValues = `("${dailyReportImage.id}", "${dailyReportImage.date}", "${dailyReportImage.desc}", "${dailyReportImage.url}", "${dailyReportImage.building}", "${dailyReportImage.level}", "${dailyReportImage.location}", "${dailyReportImage.substrate}", "${dailyReportImage.work}", "${dailyReportImage.created_at}", "${dailyReportImage.updated_at}")`;
      // const sqlInsert = `INSERT INTO ${tableName} (${columnStr}) VALUES ${insertValues}`;

      console.log(
        `before insert, ${JSON.stringify(dailyReportImage, null, 2)}`
      );
      // const insertD1Result = await c.env.DB.prepare(sqlInsert).all();

      // if (!insertD1Result.success) {
      //   return c.json({
      //     success: false,
      //     message: "failed insert daily report image data to d1",
      //   });
      // }

      const results = await insertDailyReportImage(c, dailyReportImage);
      console.log(`success save data to d1, ${results}`);
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
