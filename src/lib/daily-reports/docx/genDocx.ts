import {
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from "docx";
import { DOCX_DATA, DOCX_IMAGE_DATA, DOCX_MAN_POWER_DATA } from "@/types/docx";
import { createHeader } from "@/docx/Header";
import { createFooter } from "@/docx/Footer";
import { createPhotoTable, createManPowerTable } from "@/docx/Table";
import { Context } from "hono";
import { DailyReportManPower } from "@/types/dailyReport";

const createTitleSection = (
  client: string,
  project: string,
  title: string,
  man_powers: DOCX_MAN_POWER_DATA[],
  location: string
) => {
  const total_man_count = man_powers.reduce(
    (acc, cur) => (acc += cur.man_count),
    0
  );

  return [
    new Paragraph({
      children: [
        new TextRun({ text: `Client: `, bold: true, size: 28 }),
        new TextRun({
          text: client,
          bold: false,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Project: `, bold: true, size: 28 }),
        new TextRun({
          text: project,
          bold: false,
          size: 28,
        }),
      ],
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      alignment: "center",
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 28,
          underline: { type: "single" },
        }),
      ],
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      children: [
        new TextRun({ text: `Total MP: `, bold: true, size: 28 }),
        new TextRun({
          text: total_man_count.toString(),
          bold: false,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Location: `, bold: true, size: 28 }),
        new TextRun({
          text: location,
          bold: false,
          size: 28,
        }),
      ],
    }),
  ];
};

const createDoc = async ({
  logo,
  signature,
  title,
  client,
  date,
  weather,
  project,
  location,
  man_powers,
  images,
}: DOCX_DATA) => {
  console.log("prepare doc");
  const header = createHeader(logo, date, weather);
  console.log(`header ready`);
  const titleSection = createTitleSection(
    client,
    project,
    title,
    man_powers,
    location
  );

  const manPowerTable = await createManPowerTable(man_powers);
  console.log(`man power table ready`);
  const photoTable = await createPhotoTable(images);
  console.log(`photo table ready`);
  const footer = createFooter("William Wu", signature);
  console.log(`footer ready`);

  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          headers: {
            default: header,
          },
          footers: {
            default: footer,
          },
          children: [
            ...titleSection,
            manPowerTable,
            new Paragraph({ children: [new PageBreak()] }),
            photoTable,
          ],
        },
      ],
    });
    return doc;
  } catch (err) {
    throw err;
  }
};

export const generateDocx = async (c: Context, data: DOCX_DATA) => {
  try {
    console.log("generate docx");
    const doc = await createDoc(data);
    const docBuffer = await Packer.toBuffer(doc);
    const path = `docx/${data.date}.docx`;
    const result = await c.env.BUCKET.put(path, docBuffer);
    console.log("Successfully uploaded to R2 bucket");
    return result;
  } catch (error) {
    throw error;
  }
};
