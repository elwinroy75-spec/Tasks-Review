const axios = require("axios");
const cheerio = require("cheerio");

const API_URL =
  "https://www.nyse.com/api/notifications/public/system/1/summaries/filter?pageSize=9&pageNumber=0&sortKey=publishedDate&sortOrder=desc";

const BASE_URL =
  "https://www.nyse.com/api/notifications/public/summary/";

// Fetch detail of a single notification
async function fetchUpdates(id) {
  try {
    const url = `${BASE_URL}${id}?systemId=1`;

    const response = await axios.get(url);

    console.log(`\nResponse for ID ${id}:`);
    console.log(JSON.stringify(response.data, null, 2));

    // Try to detect where the actual object is
    const item =
      response.data.data ||
      response.data.result ||
      response.data;

    if (!item) {
      console.log("No data found.");
      return null;
    }

    const date = item.publishedDate
      ? new Date(item.publishedDate).toISOString().split("T")[0]
      : null;

    const $ = cheerio.load(item.body || "");
    const content = $("body").text().replace(/\s+/g, " ").trim();

    return {
      id: item.id || id,
      title: item.subject || "",
      date,
      content,
      url,
    };
  } catch (err) {
    console.error(
      `Error fetching ${id}:`,
      err.response?.status || err.message
    );
    return null;
  }
}

// Fetch list of links
async function fetchData() {
  try {
    const response = await axios.get(API_URL);

    const summaries = response.data.data || [];

    const results = [];

    for (const summary of summaries) {
      console.log("ID:", summary.id);

      const detail = await fetchUpdates(summary.id);

      if (detail) {
        results.push(detail);
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

  console.log("FINAL RESULT");
  console.dir(result, { depth: null });
})();