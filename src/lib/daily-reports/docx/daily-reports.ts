import { drizzle } from "drizzle-orm/d1";
import { Bindings } from "@/config";
import { Context } from "hono";
import { selectDailyReportImagesByDate } from "../../drizzle/daily-report-images";
import { selectDailyReportManPowersByDate } from "../../drizzle/daily-report-man-powers";
import { generateDocx } from "./genDocx";
import {
  DOCX_DATA,
  DOCX_IMAGE_DATA,
  LOCAL_DOCX_DATA,
  POST_DOCX_DATA,
} from "@/types/docx";
import { Client, Location, Project, Title } from "../dailyReportConstants";
import { logoUrl, signatureUrl } from "@/config";
import { selectDailySummaryByDate } from "@/lib/drizzle/daily-summaries";

export const createDailyReport = async (c: Context, date: string) => {
  console.log("start create daily report");
  try {
    const logo = await fetch(logoUrl);
    const logoBuffer = await logo.arrayBuffer();

    const signature = await fetch(signatureUrl);
    const signatureBuffer = await signature.arrayBuffer();

    const images = await selectDailyReportImagesByDate(c, date);
    if (!images.length) {
      return c.json({ success: false, message: `no images found` }, 404);
    }

    const imageData = images.map((image, idx) => {
      const docxImageData: DOCX_IMAGE_DATA = {
        id: image.id,
        num: (idx + 1).toString(),
        url: image.url,
        desc:
          image.desc ||
          image.building +
            image.level + " " +
            image.location +
            image.substrate +
            image.work,
        width: image.width,
        height: image.height,
      };
      return docxImageData;
    });
    console.log("image data");
    console.log(imageData);

    const manPowers = await selectDailyReportManPowersByDate(c, date);
    if (!manPowers.length) {
      return c.json({ success: false, message: `no man powers found` }, 404);
    }
    console.log("man powers");
    console.log(manPowers);

    const weather = await selectDailySummaryByDate(c, date);
    if (!weather.length) {
      return c.json(
        { success: false, message: `no weather summary found` },
        404
      );
    }

    const docData: POST_DOCX_DATA = {
      title: Title,
      client: Client,
      date: date,
      weather: `Temperature ${weather[0].min_temperature}-${weather[0].max_temperature}°C, Humidity ${weather[0].min_humidity}-${weather[0].max_humidity}%`,
      project: Project,
      location: Location,
      images: imageData,
      man_powers: manPowers,
    };

    const localData: LOCAL_DOCX_DATA = {
      logo: logoBuffer,
      signature: signatureBuffer,
    };

    const docxData: DOCX_DATA = { ...docData, ...localData };
    const report = await generateDocx(c, docxData);
    return report;
  } catch (err) {
    throw err;
  }
};
