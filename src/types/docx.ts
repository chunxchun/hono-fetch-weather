export type DOCX_IMAGE_DATA = {
  id: string;
  num: string;
  url: string;
  desc: string;
  width: number;
  height: number;
};

export type DOCX_MAN_POWER_DATA = {
  id: string;
  work_desc: Array<string>;
  quantity: string;
  man_count: number;
  location: string;
  remarks: string;
};

export type POST_DOCX_DATA = {
  title: string;
  client: string;
  date: string;
  weather: string;
  project: string;
  location: string;
  man_powers: Array<DOCX_MAN_POWER_DATA>;
  images: Array<DOCX_IMAGE_DATA>;
};

export type LOCAL_DOCX_DATA = {
  logo: ArrayBuffer;
  signature: ArrayBuffer;
};

export type DOCX_DATA = POST_DOCX_DATA & LOCAL_DOCX_DATA;
