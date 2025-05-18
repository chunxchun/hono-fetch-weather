import { Hono } from "hono";
import { Bindings } from "../config";
import { generateDocx } from "../lib/genDocx";
import { v4 as uuidv4 } from "uuid";
import { DOCX_DATA } from "../types/docx";
const app = new Hono<{ Bindings: Bindings }>();

app.get("/html", async (c) => {
  try {
    return c.json({ success: true, message: `success generate html` }, 200);
  } catch (err) {
    return c.json({ err: err }, 400);
  }
});

app.get("/docx/:key", async (c) => {
  try {
    const { key } = c.req.param();
    const object = await c.env.BUCKET.get(key);
    if (object === null) {
      return c.json({ success: false, message: `object not found` }, 404);
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    return new Response(object.body, {
      headers,
    });
  } catch (err) {
    return c.json({ success: false, message: `fail get document` });
  }
});

app.post("/docx", async (c) => {
  const body = await c.req.json();
  console.log("docx json", body);

  try {
    const docBuffer = await generateDocx(body);

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
