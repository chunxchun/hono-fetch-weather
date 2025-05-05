import { Hono } from "hono";
import { Bindings } from "../config";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/images/:id", async (c) => {});
app.post("/images/:id", async (c) => {});

export default app;