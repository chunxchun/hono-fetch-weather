// export const validateDate = (date: string) => {
//   const date.split('-')
//   const date = `${yyyy}-${mm}-${dd}`;

import { Context } from "hono";

//   if (!yyyy || !mm || !dd) {
//     return c.json({ succss: false, message: `enter a valid date` }, 400);
//   }

//   if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
//     return c.json(
//       { succss: false, message: `${date} is not a valid date` },
//       400
//     );
//   }
// };

// export const validateImageFile = (image) => {}

export const validateFormDataString = (data: string) => {};

export const ValidateFormDataFile = (data: File) => {};

export const validateFormDateImageFile = (c: Context, data: string | File) => {
  const acceptedImageTypes = ["image/jpg", "image/jpeg", "image/png"];

  if (!data) {
    throw new Error(`no image file from form data`, {});
    // return failedResponse(c, `no image_file from form data`);
  }

  if (!(data instanceof File)) {
    throw new Error(`image file is not a valid file`);
    // return failedResponse(c, `image_file is not a valid file`);
  }

  if (!acceptedImageTypes.includes(data.type)) {
    throw new Error(`image file is not of image type`);
    // return failedResponse(c, `image_file is not of image type`);
  }
  
  return data as File;
};

export const insertD1 = async (data: string, path: string, id: string) => {};

export const successResponse = (
  c: Context,
  message: string,
  result: any = null
) => {
  return result === null
    ? c.json({ success: true, message, result }, 200)
    : c.json({ success: true, message }, 200);
};

export const failedResponse = (
  c: Context,
  message: string,
  err: string = ""
) => {
  return err === ""
    ? c.json({ success: false, message }, 400)
    : c.json({ success: false, message, err }, 400);
};

type ErrorWithMessage = {
  message: string;
};

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
};

const toErrorWithMessage = (maybeError: unknown): ErrorWithMessage => {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
};

export const getErrorMessage = (error: unknown): string => {
  return toErrorWithMessage(error).message;
};
