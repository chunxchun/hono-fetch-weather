import { Hono } from "hono";
import { Bindings } from "../config";

const app = new Hono<{ Bindings: Bindings }>();

app.post("/api/test", async (c) => {
  const { q } = c.req.query();
  if (q === "123") {
    console.log("redirect");
    return c.redirect("/api/test2", 301);
  }

  return c.json({ msg: "test post done" });
});

app.get("/api/test2", async (c) => {
  return c.json({ name: "test2 get done" });
});

export default app;
