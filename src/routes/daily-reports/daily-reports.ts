import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
import { Bindings } from "../../config";
import { successResponse } from "@/lib/helpers";
import { DAILY_REPORTS_IMAGES_ROUTE_PATH, DAILY_REPORTS_MAN_POWERS_ROUTE_PATH, DAILY_REPORTS_ROUTE_PATH } from "@/route.config";
dayjs.extend(customParseFormat);

import dailyReportsImagesRoute from "./images";
import dailyReportsManPowersRoute from "./man-powers";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  return successResponse(c, `get ${DAILY_REPORTS_ROUTE_PATH} routes success`);
});

app.route(`/${DAILY_REPORTS_IMAGES_ROUTE_PATH}`, dailyReportsImagesRoute);
app.route(`/${DAILY_REPORTS_MAN_POWERS_ROUTE_PATH}`, dailyReportsManPowersRoute);

export default app;