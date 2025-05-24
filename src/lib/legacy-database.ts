import { HeatStressWorkWarning, PressLink } from "@/types/weather";
import { Context } from "hono";

const insertHeatStressWorkWarnings = async (
  c: Context,
  hsww: HeatStressWorkWarning
) => {
  try {
    // prepare sql
    const columns = [
      "id",
      "content",
      "url",
      "level",
      "report_date",
      "start_time",
      "cancelled_time",
      "created_at",
      "updated_at",
    ];
    const columnStr = columns.join(",");
    const tableName = "heat_stress_work_warnings";
    const insertValues = `(
      "${hsww.id}", 
      "${hsww.content}", 
      "${hsww.url}", 
      "${hsww.level}", 
      "${hsww.report_date}",
      "${hsww.start_time}",
      "${hsww.cancelled_time}",
      "${hsww.created_at}", 
      "${hsww.updated_at}"
      )`;

    const sqlInsert = `INSERT INTO ${tableName} (${columnStr}) VALUES ${insertValues}`;
    const trimmedSqlInsert = sqlInsert
      .replaceAll("\n", "")
      .replaceAll("\t", "")
      .replaceAll('\\"', '"');
    // insert to d1
    const insertResult = await c.env.DB.prepare(trimmedSqlInsert).all();
    return insertResult;
  } catch (err) {
    throw err;
  }
};

const insertPressLinks = async (c: Context, pressLinks: PressLink[]) => {
  try {
    const columns = [
      "id",
      "title",
      "url",
      "press_release_date",
      "created_at",
      "updated_at",
    ];
    const columnStr = columns.join(",");
    const tableName = "press_links";
    const insertValues = pressLinks.reduce((prev, curr) => {
      return (
        prev +
        `("${curr.id}", "${curr.title}", "${curr.url}", "${curr.press_release_date}", "${curr.created_at}", "${curr.updated_at}"),`
      );
    }, "");
    const valueStr = insertValues.slice(0, -1) + ";";
    const sqlInsert = `INSERT INTO ${tableName} (${columnStr}) VALUES ${valueStr}`;
    const insertResult = await c.env.DB.prepare(sqlInsert).all();
    return insertResult;
  } catch (err) {
    throw err;
  }
};
