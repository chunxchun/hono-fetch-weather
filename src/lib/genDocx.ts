import {
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Tab,
  Table,
  TableCell,
  TableRow,
  TextRun,
} from "docx";

import { getR2ImageHandler } from "../handlers/getImageHandler";
import { Context } from "hono";
import { DOCX_DATA, DOCX_IMAGE_DATA } from "../types/docx";
const MAX_DIMENSION = 300;

const createTableCell = async (
  title: string,
  imageBuffer: ArrayBuffer,
  width: number,
  height: number
) => {
  const scale = width > height ? MAX_DIMENSION / width : MAX_DIMENSION / height;

  return new TableCell({
    children: [
      new Paragraph({
        text: title,
        children: [
          new ImageRun({
            data: imageBuffer,
            type: "png",
            transformation: { width: width * scale, height: height * scale },
          }),
        ],
      }),
    ],
  });
};

// const create2x2Table = async (c: Context) => {
//   const table = new Table({
//     rows: [
//       new TableRow({
//         children: [
//           await createTableCell(
//             "1",
//             Buffer.from(await getR2ImageHandler("sc", c))
//           ),
//           await createTableCell(
//             "2",
//             Buffer.from(await getR2ImageHandler("sc", c))
//           ),
//         ],
//       }),
//     ],
//   });
//   return table;
// };
const createImageTableCell = async (image: DOCX_IMAGE_DATA) => {
  try {
    const resp = await fetch(image.url);
    const buffer = await resp.arrayBuffer();
    const tableCell = await createTableCell(
      image.desc,
      buffer,
      image.width,
      image.height
    );
    return tableCell;
  } catch (err) {
    throw new Error(`error create image table cell`);
  }
};
export const generateDocx = async (data: DOCX_DATA) => {
  const { title, images } = data;
  console.log(`generate docx title: ${title}, images: ${images}`);
  
  try {
    const imageTableCellResults = images.map((image) =>
      createImageTableCell(image)
    );
    const imageTableCells = await Promise.all(imageTableCellResults);

    // each 2 image table cells forms a new table row
    const imageTableRows = [];
    while (imageTableCells.length) {
      imageTableCells.length > 1
        ? imageTableRows.push(
            new TableRow({ children: imageTableCells.splice(0, 2) })
          )
        : imageTableRows.push(
            new TableRow({ children: imageTableCells.splice(0, 1) })
          );
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Table({
              rows: imageTableRows,
            }),
            new Paragraph({
              children: [
                new TextRun(title),
                new TextRun({
                  text: "Foo Bar",
                  bold: true,
                  size: 40,
                }),
                new TextRun({
                  children: [new Tab(), "Github is thee best"],
                  bold: true,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    throw error;
  }
};
