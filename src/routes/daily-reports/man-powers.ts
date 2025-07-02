import { Bindings } from "@/config";
import { failedResponse } from "@/lib/helpers";
import { successResponse } from "@/lib/helpers";
import { deleteDailyReportManPowerById, insertDailyReportManPower, selectDailyReportManPowerById, selectDailyReportManPowersByDate, updateDailyReportManPowersById } from "@/lib/drizzle/daily-report-man-powers";
import { validateDate } from "@/lib/helpers";
import { DailyReportManPower } from "@/types/dailyReport";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
dayjs.extend(customParseFormat);

const app = new Hono<{ Bindings: Bindings }>();

// post man power
app.post("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();

  try {
    const data = await c.req.json();
    const date = validateDate(yyyy, mm, dd);
    const today = dayjs().format("yyyy-mm-dd");
    // fetch database
    const insertData: DailyReportManPower = {
      id: uuidv4(),
      date,
      work_desc: data.work_desc,
      quantity: parseInt(data.quantity),
      man_count: parseInt(data.quantity),
      location: data.location,
      remarks: data.remarks,
      created_at: today,
      updated_at: today,
    };
    const results = await insertDailyReportManPower(c, insertData);
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

// get man powers by date
app.get("/:yyyy/:mm/:dd", async (c) => {
  const { yyyy, mm, dd } = c.req.param();
  try {
    const date = validateDate(yyyy, mm, dd);
    const results = await selectDailyReportManPowersByDate(c, date)
 
    return successResponse(
      c,
      `get daily report man powers for date ${date} success`,
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

// get man power by id
app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const results = await selectDailyReportManPowerById(c, id)
  return successResponse(c, `get daily report man power ${id} success`, results)
})

// update man power by id
app.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const data = await c.req.json();
  const results = await updateDailyReportManPowersById(c, id, data)
  return successResponse(c, `update daily report man power ${id} success`, results)
})

// delete man power by id
app.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const results = await deleteDailyReportManPowerById(c, id)
  return successResponse(c, `delete daily report man power ${id} success`, results)
})

export default app;
