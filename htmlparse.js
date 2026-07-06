const axios = require("axios");

const SEARCH_API =
  "https://www.gov.uk/api/search/news-and-communications.json?filter_organisations=hm-treasury&order=updated-newest";

const BASE_URL = "https://www.gov.uk";

// Fetch article URLs from API
const getNewsUrls = async () => {
  try {
    const { data } = await axios.get(SEARCH_API);

    return data.results.map((item) => BASE_URL + item.link);
  } catch (err) {
    console.error("Search API error:", err.message);
    return [];
  }
};

// Fetch single article using CONTENT API
const scrapeArticle = async (url) => {
  try {
    const apiUrl = "https://www.gov.uk/api/content" + url.replace(BASE_URL, "");

    const { data } = await axios.get(apiUrl);

    return {
      url,
      title: data.title,
      date: data.public_updated_at
        ? data.public_updated_at.slice(0, 10)
        : null,
      content: data.details?.body?.slice(0, 500) || "",
    };
  } catch (err) {
    console.error("Article error:", url, err.message);
    return null;
  }
};

// Main runner
(async () => {
  const urls = await getNewsUrls();

  console.log(`Found ${urls.length} URLs`);

  if (!urls.length) return;

  const articles = (
    await Promise.all(urls.map(scrapeArticle))
  ).filter(Boolean);

  console.log("\nFINAL OUTPUT:\n");
  console.log(JSON.stringify(articles, null, 2));
})();