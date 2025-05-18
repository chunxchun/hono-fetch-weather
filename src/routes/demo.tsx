import { Hono } from "hono";
import { Bindings } from "../config";
import { QuotationForm } from "../components/QuotationForm";

const app = new Hono<{ Bindings: Bindings }>();


app.get('/react-form', async (c) => {
  return c.html(<QuotationForm />)
})

export default app;