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

export const validateFormDateImageFile = (data: File) => {};

export const insertD1 = async (data: string, path: string, id: string) => {};

export const successResponse = (c: Context, message: string) => {
  return c.json({ success: true, message }, 200);
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
