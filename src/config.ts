export type Bindings = {
  MY_DOMAIN: KVNamespace;
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  API_KEY: string;
};

const projectName = "hono-fetch-weather";
const workersBaseUrl = "find2meals.workers.dev";
const reactDemoAppBaseUrl = "cf-react-demo-app";
const reactAppBaseUrl = "cf-react-app";
const quotationAppBaseUrl = "quotation-app";
export const appBaseUrl = `${projectName}.${workersBaseUrl}`;
export const weatherBaseUrl = "https://www.info.gov.hk/gia/wr";
export const bearerToken = "joerogan";
export const BearerAuthHeader = {
  headers: `Authorization: Bearer ${bearerToken}`,
};
export const AuthGetOption = {method: "GET", ...BearerAuthHeader};
export const AuthPostOption = {method: "POST", ...BearerAuthHeader};
export const reactDemoAppDomain = `https://${reactDemoAppBaseUrl}.${workersBaseUrl}`;
export const reactAppDomain = `https://${reactAppBaseUrl}.${workersBaseUrl}`;
export const quotationAppDomain = `https://${quotationAppBaseUrl}.${workersBaseUrl}`;

// export const R2_URL = `https://pub-2b0addf01b884fb58892ece1dc10f22d.r2.dev`; // demo
export const R2_URL = `https://pub-54da6c0345f1498280dc5c7230e65fdf.r2.dev` // tong-kee
export const logoUrl = `https://pub-2b0addf01b884fb58892ece1dc10f22d.r2.dev/tong-kee-logo.png`;
export const signatureUrl = `https://pub-2b0addf01b884fb58892ece1dc10f22d.r2.dev/ww-signature.jpg`;
