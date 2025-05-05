import { Hono } from "hono";
import { Bindings } from "../config";
import { generateDocx } from "../lib/genDocx";
import { v4 as uuidv4 } from "uuid";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/html", async (c) => {
  try {
  } catch (err) {
    return c.json({ err: err });
  }
});

app.get("/api/docx", async (c) => {
  try {
    const docBuffer = await generateDocx("abc", c);

    try {
      const docId = uuidv4();
      await c.env.BUCKET.put(`./docx/${docId}.docx`, docBuffer);
      console.log("Successfully uploaded to R2 bucket");
    } catch (err) {
      return c.json({ error: "Failed to upload document to storage" }, 500);
    }
  } catch (err) {
    return c.json({ err: err });
  }
});

app.get("/api/pdf", async (c) => {
  try {
  } catch (err) {
    return c.json({ err: err });
  }
});


export default app;