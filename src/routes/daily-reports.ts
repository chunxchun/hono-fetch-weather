import {
  dailyReportImagesTable,
  dailyReportManPowersTable,
} from "@/db/dailyReportSchema";
import {
  deleteDailyReportImageByUrl,
  insertDailyReportImage,
  selectDailyReportImageById,
  selectDailyReportImagesByDate,
  updateDailyReportImageById,
} from "@/lib/drizzle/daily-reports";
import {
  failedResponse,
  successResponse,
  validateDate,
  validateFormDataString,
} from "@/lib/helpers";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { Bindings } from "../config";
import type {
  DailyReportImage,
  DailyReportImageUpdate,
} from "../types/dailyReport";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/images/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  try {
    const date = validateDate(yyyy, mm, dd);
    const results = await selectDailyReportImagesByDate(c, date);
    return successResponse(
      c,
      `fetch d1 ${date} daily report images success`,
      results
    );
  } catch (err) {
    return failedResponse(
      c,
      `failed get daily report images for date ${yyyy}-${mm}-${dd}`,
      JSON.stringify(err)
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

app.patch("/images/:id", async (c) => {
  const { id } = c.req.param();
  const formData = await c.req.parseBody();

  const imageDesc = formData["desc"]
    ? validateFormDataString(formData["desc"])
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
  const work = formData["work"] ? validateFormDataString(formData["work"]) : "";

  const data: DailyReportImageUpdate = {};
  // push non-empty fields to data
  if (imageDesc) {
    data.desc = imageDesc;
  }
  if (building) {
    data.building = building;
  }
  if (level) {
    data.level = level;
  }
  if (location) {
    data.location = location;
  }
  if (substrate) {
    data.substrate = substrate;
  }
  if (work) {
    data.work = work;
  }

  try {
    const results = await updateDailyReportImageById(c, id, data);
    return successResponse(
      c,
      `success update daily report image ${id}`,
      results
    );
  } catch (err) {
    return failedResponse(
      c,
      `failed update daily report image ${id}`,
      JSON.stringify(err)
    );
  }
});

app.get("/images/:id", async (c) => {
  const { id } = c.req.param();
  try {
    const results = await selectDailyReportImageById(c, id);
    return successResponse(c, `success get daily report image ${id}`, results);
  } catch (err) {
    return failedResponse(
      c,
      `failed get daily report image ${id}`,
      JSON.stringify(err)
    );
  }
});

// delete by key (i.e. r2 key)
app.delete("/images/:key", async (c) => {
  const { key } = c.req.param();
  console.log(`delete image ${key}`);

  try {
    // check R2
    const deleteR2Result = await c.env.BUCKET.delete(key);
    // console.log("delete r2", deleteR2Result);
    // check D1
    const deleteD1Result = await deleteDailyReportImageByUrl(c, key);
    // console.log("delete d1", deleteD1Result);
    return c.json({
      success: true,
      message: `success remove daily report image ${key}`,
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `fail delete image`,
      err: err,
    });
  }
});

app.post("/man-powers/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();

  try {
    const data = await c.req.json();
    const date = validateDate(yyyy, mm, dd);
    const today = dayjs().format("yyyy-mm-dd");
    // fetch database
    const insertData = {
      id: uuidv4(),
      date,
      work_desc: data.work_desc,
      quantity: data.quantity,
      man_count: data.quantity,
      location: data.location,
      remarks: data.remarks,
      created_at: today,
      updated_at: today,
    };
    const db = drizzle(c.env.DB);
    const results = await db
      .insert(dailyReportManPowersTable)
      .values(insertData);

    return successResponse(
      c,
      `post d1 ${date} daily report man power success`,
      results
    );
  } catch (err) {
    return failedResponse(
      c,
      `failed post daily report man power for date ${yyyy}-${mm}-${dd}`,
      JSON.stringify(err)
    );
  }
});

app.get("/man-powers/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  try {
    const date = validateDate(yyyy, mm, dd);
    // fetch database
    const db = drizzle(c.env.DB);
    const results = await db
      .select()
      .from(dailyReportManPowersTable)
      .where(eq(dailyReportManPowersTable.date, date));

    return successResponse(
      c,
      `fetch d1 ${date} daily report man powers success`,
      results
    );
  } catch (err) {
    return failedResponse(
      c,
      `failed get daily report man powers for date ${yyyy}-${mm}-${dd}`,
      JSON.stringify(err)
    );
  }
});

export default app;
