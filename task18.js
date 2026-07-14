const axios = require("axios");
const https = require("https");

const BASE = "https://www.amlc.gov.ph";

async function getUnSanctionsUrls() {
  const { data } = await axios.get(`${BASE}/api/un-sanctions`, {
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  return data.data.map((item) => `${BASE}/un-sanctions/${item.slug}`);
}

(async () => {
  try {
    const urls = await getUnSanctionsUrls();
    console.log(`Found ${urls.length} urls`);
    urls.forEach((url) => console.log(url));
  } catch (err) {
    console.error("Failed:", err.response?.status || err.message);
  }
})();