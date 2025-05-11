import { Context } from "hono";

export const putFileToR2 = async (
  c: Context,
  file: File,
  key: string,
  folder: string = ""
) => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const fileName = file.name;
    const ext = fileName.split(".").pop();
    const path = `${key}.${ext}`;
    const putUrl = folder ? `${folder}/${path}` : `${path}`;
    return c.env.BUCKET.put(putUrl, fileBuffer);
  } catch (err) {
    throw new Error(`failed put file to R2`);
  }
};
