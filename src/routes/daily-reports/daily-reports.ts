import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
import { Bindings, R2_URL } from "../../config";
import { failedResponse, successResponse, validateDate } from "@/lib/helpers";
import {
  DAILY_REPORTS_IMAGES_ROUTE_PATH,
  DAILY_REPORTS_MAN_POWERS_ROUTE_PATH,
  DAILY_REPORTS_ROUTE_PATH,
} from "@/route.config";
dayjs.extend(customParseFormat);

import dailyReportsImagesRoute from "./images";
import dailyReportsManPowersRoute from "./man-powers";

import { createDailyReport } from "@/lib/daily-reports/docx/daily-reports";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  return successResponse(c, `get ${DAILY_REPORTS_ROUTE_PATH} routes success`);
});

app.route(`/${DAILY_REPORTS_IMAGES_ROUTE_PATH}`, dailyReportsImagesRoute);
app.route(
  `/${DAILY_REPORTS_MAN_POWERS_ROUTE_PATH}`,
  dailyReportsManPowersRoute
);

app.get("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = validateDate(yyyy, mm, dd);

  try {
    const object = await c.env.BUCKET.get(`docx/${date}.docx`);
    if (object === null) {
      return c.json({ success: false, message: `daily report not found` }, 404);
    }

    return c.json(
      {
        success: true,
        message: `daily report for ${date} found`,
        results: [{ url: `${R2_URL}/docx/${date}.docx` }],
      },
      200
    );
    // const headers = new Headers();
    // object.writeHttpMetadata(headers);
    // headers.set("etag", object.httpEtag);
    // return new Response(object.body, {
    //   headers,
    // });
  } catch (err) {
    return failedResponse(
      c,
      `failed get daily report for date ${date}`,
      JSON.stringify(err)
    );
  }
});

app.post("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = validateDate(yyyy, mm, dd);
  try {
    const result = await createDailyReport(c, date);
    return successResponse(
      c,
      `success create daily report for date ${date}`,
      result
    );
  } catch (err) {
    return failedResponse(
      c,
      `failed create daily report for date ${date}`,
      JSON.stringify(err)
    );
  }
});

export default app;
