import { Hono } from "hono";
import { Bindings } from "../config";
import { generateDocx } from "../lib/genDocx";
import { v4 as uuidv4 } from "uuid";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/html", async (c) => {
  try {
  } catch (err) {
    return c.json({ err: err });
  }
});

app.get("/docx", async (c) => {
  try {
    const docBuffer = await generateDocx("abc", c);

    try {
      const docId = uuidv4();
      const path = `./docx/${docId}.docx`
      const result = await c.env.BUCKET.put(path, docBuffer);
      console.log("Successfully uploaded to R2 bucket");
      return c.json({ success: true, message: `doc saved to ${path}`, result: result})
    } catch (err) {
      return c.json({ error: "Failed to upload document to storage" }, 500);
    }
  } catch (err) {
    return c.json({ err: err });
  }
});

app.get("/pdf", async (c) => {
  try {
  } catch (err) {
    return c.json({ err: err });
  }
});


export default app;