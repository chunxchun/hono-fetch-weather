import { Hono } from "hono";
import { Bindings } from "../config";
import { successResponse } from "../lib/helpers";

const app = new Hono<{ Bindings: Bindings }>();

app.post("/form-data", async (c) => {
  const formData = await c.req.parseBody();
  console.log(`got form data: ${formData['image_file']}`)
  console.log(`got form data: ${formData['level']}`)
  console.log(`got form data: ${formData['location']}`)
  return c.json({ success: true, message: `your form data ${formData['building']}`})
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

export default app;
