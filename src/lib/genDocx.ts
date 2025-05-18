import {
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
} from "docx";

import { DOCX_DATA, DOCX_IMAGE_DATA } from "../types/docx";
import { createHeader } from "@/docx/Header";
import { createFooter } from "@/docx/Footer";
import { createPhotoTable, createManPowerTable } from "@/docx/Table";

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
  const manPowerTable = await createManPowerTable(man_powers);
  console.log(`man power table ready`);
  const photoTable = await createPhotoTable(images);
  console.log(`photo table ready`);
  const footer = createFooter("William Wu", signature);
  console.log(`footer ready`);

  try {
    const total_man_count = man_powers.reduce((acc, cur) => acc += cur.man_count, 0)

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
            new Paragraph({
              children: [
                new TextRun({ text: `Client: `, bold: true, size: 28 }),
                new TextRun({
                  text: `PAUL Y. CREC JOINT VENTURE`,
                  bold: false,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Project: `, bold: true, size: 28 }),
                new TextRun({
                  text: `Plastering & Finishing Works for Inlet Works Building, Primary Sedimentation Tank and Transformer House No. 1 (Contract No. DC/2019/10)`,
                  bold: false,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              children: [],
            }),
            new Paragraph({
              alignment: "center",
              children: [
                new TextRun({
                  text: `Daily Site Work Summary`,
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
                  text: `PST Block, IW大樓, TX House 1`,
                  bold: false,
                  size: 28,
                }),
              ],
            }),
            manPowerTable,
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

export const generateDocx = async (data: DOCX_DATA) => {
  try {
    console.log("generate docx");
    const doc = await createDoc(data);
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    throw error;
  }
};
