export type DOCX_IMAGE_DATA = {
  id: string;
  num: string;
  url: string;
  desc: string;
  width: number;
  height: number;
};
export type DOCX_DATA = { title: string; images: Array<DOCX_IMAGE_DATA> };
