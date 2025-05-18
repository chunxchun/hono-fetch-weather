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
import { createHeader } from "./Header";
import { createFooter } from "./Footer";
import { R2_URL } from "@/config";

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

export const createTable = async (images: Array<DOCX_IMAGE_DATA>) => {
  try {
    return new Table({
      rows: await createTableRows(images),
    });
  } catch (err) {
    throw err;
  }
};
