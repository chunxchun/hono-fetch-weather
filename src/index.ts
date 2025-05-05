import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";

import { v4 as uuidv4 } from "uuid";
import { drizzle } from "drizzle-orm/d1";
import { uuid } from "drizzle-orm/gel-core";

import {
  Bindings,
  reactAppDomain,
  reactDemoAppDomain,
  bearerToken,
} from "./config";

// routes
import testsRoute from "./routes/tests";
import invoicesRoute from "./routes/invoices";
import imagesRoute from "./routes/images";
import weathersRoute from "./routes/weathers";
import dailyReportsRoute from "./routes/daily-reports";

const app = new Hono<{ Bindings: Bindings }>();

const allowedOrigin = [reactDemoAppDomain, reactAppDomain];

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", ...allowedOrigin],
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Authorization"],
  })
);
app.use("*", bearerAuth({ token: bearerToken }));

app.get("/", (c) => c.json({ name: "Hello Hono!" }, 200));
app.notFound((c) => c.json({ err: "File not found" }, 404));

app.route("/api/tests", testsRoute);
app.route("/api/invoices", invoicesRoute);
app.route("/api/images", imagesRoute);
app.route("/api/weathers", weathersRoute);
app.route("/api/daily-reports", dailyReportsRoute);

export default app;
