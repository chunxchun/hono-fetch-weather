import { Hono } from "hono";
import { Bindings } from "../config";
import { successResponse } from "../lib/helpers";
import { v4 as uuidv4 } from "uuid";
const app = new Hono<{ Bindings: Bindings }>();

app.post("/r2", async (c) => {
  try {
    const key = uuidv4();
    const formData = await c.req.parseBody();
    const file = formData["file"] as File;
    const fileBuffer = await file.arrayBuffer();
    const ext = file.name.split(".").pop();
    const response = await c.env.BUCKET.put(`${key}.${ext}`, fileBuffer);
    return c.json({ success: true, message: `success put r2`, result: response });
  } catch (err) {
    return c.json({ success: false, message: `failed put r2` }, 500);
  }
});

app.get("/r2/:key", async (c) => {
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
    return c.json({ success: false, message: `fail get object from r2` });
  }
});

app.post("/form-data", async (c) => {
  const formData = await c.req.parseBody();
  console.log(`got form data: ${formData["image_file"]}`);
  console.log(`got form data: ${formData["level"]}`);
  console.log(`got form data: ${formData["location"]}`);
  return c.json({
    success: true,
    message: `your form data ${formData["building"]}`,
  });
});

app.post("/", async (c) => {
  const { q } = c.req.query();
  if (q === "123") {
    console.log("redirect");
    return c.redirect("/api/test2", 301);
  }

  return c.json({ msg: "test post done" });
});

app.get("/test2", async (c) => {
  return successResponse(c, `success get test2`);
});

app.post('/docx', async (c) => {

})
export default app;
