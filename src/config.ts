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

export const R2_URL = `https://oneguy.company`;
export const logoUrl = `${R2_URL}/tong-kee-logo.png`
export const signatureUrl = `${R2_URL}/ww-signature.jpg`
