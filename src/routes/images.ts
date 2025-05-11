import { Hono } from "hono";
import { Bindings } from "../config";
import { v4 as uuidv4 } from "uuid";

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

  const acceptedImageTypes = ["image/jpg", "image/jpeg", "image/png"];
  
  if (!acceptedImageTypes.includes(imageFile.type)) {
    return c.json(
      { success: false, message: "image_file is not of image type" },
      400
    );
  }

  try {
    const fileBuffer = await imageFile.arrayBuffer();
    const fileName = imageFile.name;
    const ext = fileName.split(".").pop();
    const path = `${key}.${ext}`;
    const result = await c.env.BUCKET.put(`images/${path}`, fileBuffer);

    return c.json(
      { success: true, message: `success upload images file to R2`, result: result },
      200
    );
  } catch (err) {
    return c.json(
      { success: false, message: `fail upload image to R2`, err: err },
      400
    );
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
