import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";

import {
  bearerToken,
  Bindings,
  quotationAppDomain,
  reactAppDomain,
  reactDemoAppDomain,
} from "./config";

// routes
import dailyReportsRoute from "./routes/daily-reports";
import imagesRoute from "./routes/images";
import invoicesRoute from "./routes/invoices";
import testsRoute from "./routes/tests";
import weathersRoute from "./routes/weathers";
import demoRoute from "./routes/demo";
const app = new Hono<{ Bindings: Bindings }>();

const allowedOrigin = [reactDemoAppDomain, reactAppDomain, quotationAppDomain];
const apiCors = {
  origin: ["http://localhost:5173", ...allowedOrigin],
  // origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: [
    "Origin",
    "Authorization",
    "Content-Type",
    "Accept",
    // "X-Requested-With",
    // "x-client-key",
    // "x-client-token",
    // "x-client-secret",
  ],
  // credentials: true
};
app.use("/api/*", cors());
app.use("/api/*", bearerAuth({ token: bearerToken }));

app.get("/", (c) => c.json({ name: "Hello Hono!" }, 200));
app.notFound((c) => c.json({ success: false, message: "File not found" }, 404));

app.route("/demo", demoRoute);
app.route("/api/tests", testsRoute);
app.route("/api/invoices", invoicesRoute);
app.route("/api/images", imagesRoute);
app.route("/api/weathers", weathersRoute);
app.route("/api/daily-reports", dailyReportsRoute);

export default app;
