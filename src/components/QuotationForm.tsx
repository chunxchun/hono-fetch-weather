import type { FC } from "hono/jsx";
import { Button } from "@/components/ui/button";

export const QuotationForm: FC = () => {
  return (
    <>
      <h1 class="text-3xl underline">Form</h1>
      <Button variant="outline" >click</Button>
    </>
  );
};
