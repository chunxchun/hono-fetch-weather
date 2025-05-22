import { appBaseUrl } from "@/config";

const fetchUrl = `https://${appBaseUrl}/api/`;
const test = async (url ) => {
  const result = await fetch(fetchUrl);
};

test(fetchUrl);
