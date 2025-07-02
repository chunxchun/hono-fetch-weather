import { AlignmentType, Header, ImageRun, Paragraph, TextRun } from "docx";

const createHeaderLogo = (logo: ArrayBuffer) =>
  new Paragraph({
    alignment: "center",
    children: [
      new ImageRun({
        data: logo,
        type: "png",
        transformation: { width: 500, height: 100 },
      }),
    ],
  });

const createHeaderDate = (date: string) =>
  new Paragraph({
    alignment: "right",
    children: [
      new TextRun({
        size: 20,
        text: `Date: ${date}`,
      }),
    ],
  });

const createHeaderWeather = (weather: string) =>
  new Paragraph({
    alignment: "right",
    children: [
      new TextRun({
        size: 20,
        text: `Weather: ${weather}`,
      }),
    ],
  });

const createHeaderBottomPadding = () =>
  new Paragraph({
    alignment: "right",
    children: [],
  });

export const createHeader = (
  logo: ArrayBuffer,
  date: string,
  weather: string
) => {
  return new Header({
    children: [
      createHeaderLogo(logo),
      createHeaderDate(date),
      createHeaderWeather(weather),
      createHeaderBottomPadding(),
    ],
  });
};
