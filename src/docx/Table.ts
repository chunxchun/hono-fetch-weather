import { R2_URL } from "@/config";
import { ImageRun, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";
import { DOCX_IMAGE_DATA, DOCX_MAN_POWER_DATA } from "../types/docx";

const MAX_DIMENSION = 300;
const PHOTO_TABLE_ROW_HEIGHT = 5000;

const createTextRun = (
  text: string,
  bold: boolean = false,
  size: number = 24
) => {
  return new TextRun({
    text,
    bold,
    size,
  });
};

const createImageRun = (
  imageBuffer: ArrayBuffer,
  width: number,
  height: number
) => {
  const scale = width > height ? MAX_DIMENSION / width : MAX_DIMENSION / height;
  // console.log("scale", scale, "width", width, "height", height);
  return new ImageRun({
    data: imageBuffer,
    type: "png",
    transformation: { width: width * scale, height: height * scale },
  });
};

const createImageTableCell = async ({
  desc,
  url,
  width,
  height,
}: DOCX_IMAGE_DATA) => {
  try {
    const resp = await fetch(`${R2_URL}/${encodeURIComponent(url)}`);
    const buffer = await resp.arrayBuffer();
    console.log(`success image`);
    return new TableCell({
      children: [
        new Paragraph({
          children: [createTextRun(desc)],
        }),
        new Paragraph({
          children: [createImageRun(buffer, width, height)],
        }),
      ],
    });
  } catch (err) {
    throw err;
  }
};

const createEmptyImageTableCell = () => {
  return new TableCell({ children: [] });
};

const createPhotoTableRows = async (images: Array<DOCX_IMAGE_DATA>) => {
  const cellPromises = images.map(async (image) => createImageTableCell(image));
  const cells = await Promise.all(cellPromises);
  const tableRows: Array<TableRow> = [];
  while (cells.length) {
    cells.length > 1
      ? tableRows.push(
          new TableRow({
            height: { value: PHOTO_TABLE_ROW_HEIGHT, rule: "atLeast" },
            children: cells.splice(0, 2),
          })
        )
      : tableRows.push(
          new TableRow({
            height: { value: PHOTO_TABLE_ROW_HEIGHT, rule: "atLeast" },
            children: [...cells.splice(0, 1), createEmptyImageTableCell()],
          })
        );
  }

  return tableRows;
};

const createTableCell = (text: string, widthDXA: number) => {
  return new TableCell({
    width: { size: widthDXA, type: "dxa" },
    children: [
      new Paragraph({
        children: [createTextRun(text), createTextRun("")],
      }),
    ],
  });
};

const createManPowerHeaderRow = () => {
  return new TableRow({
    children: [
      createTableCell("S/N", 500),
      createTableCell("Work Description", 4500),
      createTableCell("Qty", 500),
      createTableCell("MP", 500),
      createTableCell("Location", 1500),
      createTableCell("Remarks", 1500),
    ],
  });
};

const createManPowerRow = (idx: number, man_power: DOCX_MAN_POWER_DATA) => {
  return new TableRow({
    children: [
      createTableCell((++idx).toString(), 500),
      createTableCell(man_power.work_desc.join(", "), 4500),
      createTableCell(man_power.quantity, 500),
      createTableCell(man_power.man_count.toString(), 500),
      createTableCell(man_power.location, 1500),
      createTableCell(man_power.remarks, 1500),
    ],
  });
};

export const createManPowerTable = async (
  man_powers: Array<DOCX_MAN_POWER_DATA>
) => {
  const manPowerRows = man_powers.map((man_power, idx) =>
    createManPowerRow(idx, man_power)
  );
  return new Table({
    columnWidths: [500, 4500, 500, 500, 1500, 1500],
    width: { size: 100, type: "pct" },
    layout: "fixed",
    rows: [createManPowerHeaderRow(), ...manPowerRows],
  });
};

export const createPhotoTable = async (images: Array<DOCX_IMAGE_DATA>) => {
  try {
    return new Table({
      rows: await createPhotoTableRows(images),
    });
  } catch (err) {
    throw err;
  }
};
