const axios = require("axios");
const https = require("https");
 
const BASE = "https://www.amlc.gov.ph";
 
async function getPageUrls(page = 1, limit = 6) {
  const { data } = await axios.get(`${BASE}/api/news`, {
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });
 
  const start = (page - 1) * limit;
  const pageItems = data.data.slice(start, start + limit);
 
  return pageItems.map((item) => `${BASE}/news-and-announcements/${item.slug}`);
}
 
(async () => {
  try {
    const urls = await getPageUrls(1);
    console.log(`Found ${urls.length} urls`);
    urls.forEach((url) => console.log(url));
  } catch (err) {
    console.error("Failed:", err.response?.status || err.message);
  }
})();