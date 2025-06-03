import { Bindings } from "@/config";
import {
  deleteDailyReportImageByUrl,
  insertDailyReportImage,
  selectDailyReportImageById,
  selectDailyReportImagesByDate,
  updateDailyReportImageById,
} from "@/lib/drizzle/daily-report-images";
import {
  failedResponse,
  successResponse,
  validateDate,
  validateFormDataString,
} from "@/lib/helpers";
import { DailyReportImage, DailyReportImageUpdate } from "@/types/dailyReport";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
dayjs.extend(customParseFormat);

const app = new Hono<{ Bindings: Bindings }>();

// post image
app.on(
  "POST",
  ["/:yyyy/:mm/:dd", "/:yyyy/:mm/:dd/", "/:yyyy/:mm/:dd/:key"],
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
      
      const today = dayjs().format("YYYY-MM-DD");
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

      const results = await insertDailyReportImage(c, dailyReportImage);
      console.log(`success save data to d1, ${results}`);
      return successResponse(c, `success post daily report image`, results);
    } catch (err) {
      return failedResponse(c, `failed post daily report image`, JSON.stringify(err))
    }
  }
);

// get images by date
app.get("/:yyyy/:mm/:dd", async (c) => {
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

// get image by id
app.get("/:id", async (c) => {
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

// update image by id
app.patch("/:id", async (c) => {
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

// delete image by key (i.e. r2 key)
app.delete("/:key", async (c) => {
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

export default app;
