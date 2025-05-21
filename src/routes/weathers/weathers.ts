import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
import { Bindings } from "../../config";
dayjs.extend(customParseFormat);

import { successResponse } from "@/lib/helpers";
import dailySummariesRoute from "./daily-summaries";
import heatStressWorkWarningsRoute from "./heat-stress-work-warnings";
import hourlyReadingsRoute from "./hourly-readings";
import pressLinksRoute from "./press-links";
import {
  DAILY_SUMMARIES_ROUTE_PATH,
  HEAT_STRESS_WORK_WARNINGS_ROUTE_PATH,
  HOURLY_READINGS_LINKS_ROUTE_PATH,
  PRESS_LINKS_ROUTE_PATH,
  WEATHERS_ROUTE_PATH,
} from "@/route.config";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) =>
  successResponse(c, `get ${WEATHERS_ROUTE_PATH} routes success`)
);

app.route(`/${PRESS_LINKS_ROUTE_PATH}`, pressLinksRoute);
app.route(`/${HOURLY_READINGS_LINKS_ROUTE_PATH}`, hourlyReadingsRoute);
app.route(
  `/${HEAT_STRESS_WORK_WARNINGS_ROUTE_PATH}`,
  heatStressWorkWarningsRoute
);
app.route(`/${DAILY_SUMMARIES_ROUTE_PATH}`, dailySummariesRoute);

export default app;
