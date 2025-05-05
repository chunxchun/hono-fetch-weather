import { Hono } from "hono";
import { Bindings } from "../config";
import { v4 as uuidv4 } from "uuid";

const app = new Hono<{ Bindings: Bindings }>();

app.post("/upload", async (c) => {
  const key = uuidv4();
  const formData = await c.req.parseBody();
  const imageFile = formData["image_file"];

  if (!imageFile) {
    return c.json({ err: "No image file from form data" }, 400);
  }

  if (!(imageFile instanceof File)) {
    return c.json({ err: "Image file is not a file" }, 400);
  }

  if (imageFile.type !== "image/*") {
    return c.json({ err: "Upload file is not an image" }, 400);
  }

  try {
    const fileBuffer = await imageFile.arrayBuffer();
    const fileName = imageFile.name;
    const ext = fileName.split(".").pop();
    const path = `${key}.${ext}`;
    console.log(fileName, ext, path);

    await c.env.BUCKET.put(path, fileBuffer);

    return c.json({ msg: "Image file saved to R2", imageUrl: path }, 200);
  } catch (err) {
    return c.json({ err: err }, 400);
  }
});

app.get("/download/:key", async (c) => {
  const { key } = c.req.param();

  try {
    const image = await c.env.BUCKET.get(key);

    if (image === null) {
      return c.json({ err: "File not found" }, 404);
    }

    return c.newResponse(image.body, 200, { ETag: image.httpEtag });
  } catch (err) {
    return c.json({ err: err, key: key }, 400);
  }
});

export default app;
