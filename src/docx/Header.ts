import { AlignmentType, Header, ImageRun, Paragraph, TextRun } from "docx";

export const createHeader = (
  logo: ArrayBuffer,
  date: string,
  weather: string
) => {
  return new Header({
    children: [
      // logo
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: logo,
            type: "png",
            transformation: { width: 500, height: 100 },
          }),
        ],
      }),
      // date
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            size: 20,
            text: `Date: ${date}`,
          }),
        ],
      }),
      // weather
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            size: 20,
            text: `Weather: ${weather}`,
          }),
        ],
      }),
    ],
  });
};
