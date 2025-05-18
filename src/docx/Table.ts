import { R2_URL } from "@/config";
import { ImageRun, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";
import { DOCX_IMAGE_DATA, DOCX_MAN_POWER_DATA } from "../types/docx";

const MAX_DIMENSION = 300;

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
          children: [
            await createTextRun(desc),
            await createImageRun(buffer, width, height),
          ],
        }),
      ],
    });
  } catch (err) {
    throw err;
  }
};

const createEmptyTableCell = () => {
  return new TableCell({ children: [] });
};

const createTableRows = async (images: Array<DOCX_IMAGE_DATA>) => {
  const cellPromises = images.map(async (image) => createImageTableCell(image));
  const cells = await Promise.all(cellPromises);
  const tableRows: Array<TableRow> = [];
  while (cells.length) {
    cells.length > 1
      ? tableRows.push(new TableRow({ children: cells.splice(0, 2) }))
      : tableRows.push(
          new TableRow({
            children: [...cells.splice(0, 1), createEmptyTableCell()],
          })
        );
  }

  return tableRows;
};

const createTableCell = (text: string) => {
  return new TableCell({
    width: {size:100, type: 'pct'},
    children: [
      new Paragraph({
        children: [createTextRun(text)],
      }),
    ],
  });
};

const createManPowerHeaderRow = () => {
  return new TableRow({
    children: [
      createTableCell("S/N"),
      createTableCell("Work Description"),
      createTableCell("Qty"),
      createTableCell("MP"),
      createTableCell("Location"),
      createTableCell("Remarks"),
    ],
  });
};

const createManPowerRow = (idx: number, man_power: DOCX_MAN_POWER_DATA) => {
  return new TableRow({
    children: [
      createTableCell((++idx).toString()),
      createTableCell(man_power.work_desc.join(", ")),
      createTableCell(man_power.quantity),
      createTableCell(man_power.man_count.toString()),
      createTableCell(man_power.location),
      createTableCell(man_power.remarks),
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
    rows: [createManPowerHeaderRow(), ...manPowerRows],
  });
};

export const createPhotoTable = async (images: Array<DOCX_IMAGE_DATA>) => {
  try {
    return new Table({
      rows: await createTableRows(images),
    });
  } catch (err) {
    throw err;
  }
};
