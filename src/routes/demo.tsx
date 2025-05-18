import { Hono } from "hono";
import { Bindings } from "../config";
import { QuotationForm } from "../components/QuotationForm";
import { Layout
  
 } from "../components/Lyaout";
const app = new Hono<{ Bindings: Bindings }>();

app.get("/react-form", async (c) => {
  return c.html(
    <Layout>
      <QuotationForm />
    </Layout>
  );
});

export default app;
