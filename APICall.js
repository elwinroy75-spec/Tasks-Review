const axios = require("axios");
const cheerio = require("cheerio");

const API_URL =
  "https://www.nyse.com/api/notifications/public/system/1/summaries/filter?pageSize=9&pageNumber=0&sortKey=publishedDate&sortOrder=desc";

const BASE_URL =
  "https://www.nyse.com/api/notifications/public/summary/";

async function fetchUpdates(id) {
  try {
    const url = `${BASE_URL}${id}?systemId=1`;

    const { data } = await axios.get(url);

    const $ = cheerio.load(data.body || "");
    const content = $("body").text().replace(/\s+/g, " ").trim();

    return {
      id: data.id,
      url,
      title: data.subject,
      date: new Date(data.publishedDate).toISOString().split("T")[0],
      content
    };
  } catch (err) {
    console.error(`Error fetching ${id}:`, err.response?.status || err.message);
    return null;
  }
}

async function fetchData() {
  try {
    const { data } = await axios.get(API_URL);

    const results = [];

    for (const item of data.data) {
      const details = await fetchUpdates(item.id);

      if (details) {
        results.push(details);
      }
    }

    return results;
  } catch (err) {
    console.error("API Error:", err.response?.status || err.message);
    return [];
  }
}

(async () => {
  const result = await fetchData();
  console.log(result);
})();