import { Bindings } from "@/config";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
dayjs.extend(customParseFormat);

import { insertDailySummary, selectHourlyReportByDate } from "@/lib/database";
import { failedResponse, successResponse, validateDate } from "@/lib/helpers";
import type { DailySummary, HourlyReading } from "@/types/weather";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  return successResponse(c, `get weathers/daily-summaries routes success`);
});

app.get("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  const date = `${yyyy}-${mm}-${dd}`;

  if (!yyyy || !mm || !dd) {
    return c.json({ succss: false, message: `enter a valid date` }, 400);
  }
  // dayjs('2022-01-33').isValid();
  // true, parsed to 2022-02-02
  if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
    return c.json(
      { succss: false, message: `${date} is not a valid date` },
      400
    );
  }

  try {
    const { success, results } = await c.env.DB.prepare(
      "SELECT * FROM daily_summaries WHERE date = ?"
    )
      .bind(date)
      .all();

    if (!success) {
      return c.json(
        { success: false, message: `fetch d1 ${date} daily summary failed` },
        400
      );
    }

    return c.json({
      success: true,
      message: `fetch d1 ${date} daily summary success`,
      results: results,
    });
  } catch (err) {
    return c.json({
      success: false,
      message: `failed get daily summary for date ${date}`,
      err: JSON.stringify(err),
    });
  }
});

app.post("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  try {
    const date = validateDate(yyyy, mm, dd);
    console.log("date", date);
    const hourlyReadings = await selectHourlyReportByDate(c, date);
    console.log("get hr");
    if (!hourlyReadings.length) {
      return failedResponse(c, `no hourly readings found for date ${date}`);
    }
    console.log(hourlyReadings);

    const trimmedHourlyReadings = hourlyReadings.filter(
      (hourlyReading) => hourlyReading.temperature && hourlyReading.humidity
    );
    const temperatureArr = trimmedHourlyReadings.map(
      (hourlyReading: HourlyReading) => parseInt(hourlyReading.temperature)
    );
    const humidityArr = trimmedHourlyReadings.map(
      (hourlyReading: HourlyReading) => parseInt(hourlyReading.humidity)
    );

    const maxTemperature = Math.max(...temperatureArr);
    const minTemperature = Math.min(...temperatureArr);
    const maxHumidity = Math.max(...humidityArr);
    const minHumidity = Math.min(...humidityArr);

    const id = uuidv4();
    const summary: DailySummary = {
      id,
      date,
      max_temperature: maxTemperature,
      min_temperature: minTemperature,
      max_humidity: maxHumidity,
      min_humidity: minHumidity,
    };
    console.log(summary);

    const insertResults = await insertDailySummary(c, summary);

    return successResponse(c, `success post summary for date ${date}`, insertResults);
  } catch (err) {
    return failedResponse(
      c,
      `failed post daily summary for date ${yyyy}-${mm}-${dd}`,
      JSON.stringify(err)
    );
  }
});

export default app;
