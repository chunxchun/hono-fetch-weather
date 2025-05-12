import { Context } from "hono";

export const getImageHandler = async (c: Context) => {
  const imageId = c.req.param("imageId");

  if (!imageId) {
    return c.json({ err: "Require image id" }, 400);
  }

  try {
    const image = await c.env.MY_BUCKET.get(`${imageId}`);

    if (!image) {
      return c.json({ err: "Image not found" }, 404);
    }

    return c.json({ image });
  } catch (err) {
    return c.json({ err: "Error getting image" }, 500);
  }
};

export const getR2ImageHandler = async (
  c: Context,
  key: string,
  folder: string = ""
) => {
  try {
    const imageUrl = folder === "" ? `${key}` : `${folder}/${key}`;
    const image = await c.env.MY_BUCKET.get(`${imageUrl}`);

    if (image === null) {
      throw new Error("image not found");
    }
    console.log("get R2 image success");
    return image.body;
  } catch (error) {
    return c.json({ error: "Image not found" }, 404);
  }
};
