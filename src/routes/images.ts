import { Hono } from "hono";
import { Bindings } from "../config";
import { v4 as uuidv4 } from "uuid";
import {
  failedResponse,
  getErrorMessage,
  successResponse,
  validateFormDateImageFile,
} from "../lib/helpers";
import { putFileToR2 } from "../lib/storage";

const app = new Hono<{ Bindings: Bindings }>();

app.on("POST", ["/uploads", "/uploads/", "/uploads/:key"], async (c) => {
  const key = c.req.param("key") || uuidv4();
  const formData = await c.req.parseBody();
  const imageFile = formData["image_file"];
  // const imageDesc = formData["image_desc"];
  if (!imageFile) {
    return c.json(
      { success: false, message: `no image_file from form data` },
      400
    );
  }

  if (!(imageFile instanceof File)) {
    return c.json(
      { success: false, message: "image_file is not a valid file" },
      400
    );
  }
  console.log(`image file name ${imageFile.name}`);
  // console.log(`image desc ${imageDesc}`);
  return c.json({ message: `upload image, ${key}` }, 200);
});

app.on("POST", ["/upload", "/upload/", "/upload/:key"], async (c) => {
  const key = c.req.param("key") || uuidv4();
  const formData = await c.req.parseBody();
  const imageFile = formData["image_file"];

  try {
    const validatedImageFile = validateFormDateImageFile(c, imageFile);
    const folder = "images";
    const result = await putFileToR2(c, validatedImageFile, key, folder);
    return successResponse(c, `success post image`, result);
  } catch (err) {
    return failedResponse(c, `failed post image`, getErrorMessage(err));
  }
});

app.get("/download/:key", async (c) => {
  const { key } = c.req.param();

  try {
    const image = await c.env.BUCKET.get(key);

    if (image === null) {
      return c.json({ success: false, message: "file not found" }, 404);
    }
    // return c.json({ result: image }, 200);
    return c.newResponse(image.body, 200, { ETag: image.httpEtag });
  } catch (err) {
    return c.json({ err: err, key: key }, 400);
  }
});

export default app;
