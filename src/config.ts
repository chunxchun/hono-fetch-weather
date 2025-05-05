export type Bindings = {
  MY_DOMAIN: KVNamespace;
  DB: D1Database;
  BUCKET: R2Bucket;
  API_KEY: string;
};

const workersBaseUrl = "find2meals.workers.dev";
const reactDemoAppBaseUrl = "cf-react-demo-app";
const reactAppBaseUrl = "cf-react-app";

export const weatherBaseUrl = "https://www.info.gov.hk/gia/wr";
export const bearerToken = "joerogan";

export const reactDemoAppDomain = `https://${reactDemoAppBaseUrl}.${workersBaseUrl}`;
export const reactAppDomain = `https://${reactAppBaseUrl}.${workersBaseUrl}`;
