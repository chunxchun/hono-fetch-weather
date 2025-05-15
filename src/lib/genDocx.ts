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
import { DOCX_DATA } from "../types/docx";

const createTableCell = async (text: string, imageBuffer: ArrayBuffer) => {
  return new TableCell({
    children: [
      new Paragraph({
        text: text,
        children: [
          new ImageRun({
            data: imageBuffer,
            type: "png",
            transformation: { width: 300, height: 300 },
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

export const generateDocx = async (data: DOCX_DATA) => {
  const { title, images } = data;
  console.log(`generate docx title: ${title}, images: ${images}`);
  // const imageBuffers = images.map(async (image) => {
  //   const response = await fetch(image.url);
  //   const buffer = await response.arrayBuffer();
  //   return buffer;
  // });

  const resp = await fetch(images[0].url);
  const buffer = await resp.arrayBuffer();
  const tableCell = await createTableCell(images[0].num, buffer);

  const resp1 = await fetch(images[1].url);
  const buffer1 = await resp1.arrayBuffer();
  const tableCell1 = await createTableCell(images[1].num, buffer1);

  const resp2 = await fetch(images[2].url);
  const buffer2 = await resp2.arrayBuffer();
  const tableCell2 = await createTableCell(images[2].num, buffer2);

  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Table({
              rows: [
                new TableRow({
                  children: [tableCell, tableCell1],
                }),
                new TableRow({
                  children: [tableCell2],
                }),
              ],
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
