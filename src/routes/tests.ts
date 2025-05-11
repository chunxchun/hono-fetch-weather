import { Hono } from "hono";
import { Bindings } from "../config";
import { successResponse } from "../lib/helpers";

const app = new Hono<{ Bindings: Bindings }>();

app.post("/form-data", async (c) => {




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
