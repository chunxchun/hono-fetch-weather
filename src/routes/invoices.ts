import { Hono } from "hono";
import { Bindings } from "../config";
import { generateDocx } from "../lib/genDocx";
import { v4 as uuidv4 } from "uuid";
import { DOCX_DATA } from "../types/docx";
const app = new Hono<{ Bindings: Bindings }>();

const docxData: DOCX_DATA = {
  title: "Daily Report",
  images: [
    {
      id: "1",
      num: "1",
      url: "https://placehold.co/600x400",
      desc: "600x400 image",
    },
    {
      id: "2",
      num: "2",
      url: "https://placehold.co/300x200",
      desc: "300x200 image",
    },
    {
      id: "3",
      num: "3",
      url: "https://placehold.co/150x100",
      desc: "150x100 image",
    },
  ],
};

app.get("/html", async (c) => {
  try {
  } catch (err) {
    return c.json({ err: err });
  }
});

app.post("/docx", async (c) => {
  const body = await c.req.parseBody();
  const docxDataStr = body["docxData"];

  if (docxDataStr instanceof File) {
    return c.json(
      { success: false, message: `document data should be string` },
      400
    );
  }

  if (typeof docxDataStr !== "string") {
    return c.json({ success: false, message: `document data error` }, 400);
  }

  console.log(`before parse, ${docxDataStr}`);
  const data = (await JSON.parse(docxDataStr)) as DOCX_DATA;
  console.log(`after parse, ${data}`);
  console.log(typeof data);
  console.log(typeof data.title);
  console.log(typeof data.images);

  console.log(docxData)
  try {
    const docBuffer = await generateDocx(docxData, c);

    const docId = uuidv4();
    const path = `docx/${docId}.docx`;
    const result = await c.env.BUCKET.put(path, docBuffer);
    console.log("Successfully uploaded to R2 bucket");

    return c.json({
      success: true,
      message: `doc saved to ${path}`,
      result: result,
    });
  } catch (err) {
    return c.json(
      {
        success: false,
        message: `failed to upload document to R1, ${err}`,
      },
      500
    );
  }
});

app.get("/pdf", async (c) => {
  try {
  } catch (err) {
    return c.json({ err: err });
  }
});

export default app;
