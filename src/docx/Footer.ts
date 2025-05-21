import {
  AlignmentType,
  Footer,
  ImageRun,
  PageNumber,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const createLeftSignTableCell = (
  tongKeeRep: string,
  signature: ArrayBuffer
) => {
  return new TableCell({
    width: { size: 50, type: "pct" },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            size: 20,
            bold: true,
            italics: true,
            text: "Reported by Tong Kee representative",
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            size: 20,
            bold: true,
            text: "Name: ",
          }),
          new TextRun({
            size: 20,
            text: `${tongKeeRep}`,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            size: 20,
            bold: true,
            text: "Signature: ",
          }),
          new ImageRun({
            data: signature,
            type: "png",
            transformation: { width: 45, height: 25 },
          }),
        ],
      }),
    ],
  });
};

const createRightSignTableCell = (): TableCell =>
  new TableCell({
    width: { size: 50, type: "pct" },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [],
      }),
    ],
  });

export const createSignTable = (tongKeeRep: string, signature: ArrayBuffer) => {
  const leftSignTableCell = createLeftSignTableCell(tongKeeRep, signature);
  const rightSignTableCell = createRightSignTableCell();

  return new Table({
    width: {
      size: "100%",
      type: WidthType.PERCENTAGE,
    },
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        height: { value: 1500, rule: "exact" },
        children: [leftSignTableCell, rightSignTableCell],
      }),
    ],
  });
};

export const createFooter = (
  tongKeeRep: string,
  signature: ArrayBuffer
) => {
  const signTable = createSignTable(tongKeeRep, signature);
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [signTable],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT, " | Page"],
          }),
        ],
      }),
    ],
  });
};
