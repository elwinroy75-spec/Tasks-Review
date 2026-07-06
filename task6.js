const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://www.gov.uk";
const SEARCH_URL =
  "https://www.gov.uk/search/news-and-communications?organisations%5B%5D=hm-treasury&order=updated-newest";

// const headers = {
//   "User-Agent":
//     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
// };

// Fetch HTML 
const fetchHTML = async (url) => {
  const { data } = await axios.get(url);
  return cheerio.load(data);
};

// Get article URLs
const getNewsUrls = async () => {
  try {
    const $ = await fetchHTML(SEARCH_URL);

    const urls = $("li.gem-c-document-list__item a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter((href) => href?.startsWith("/government/"))
      .map((href) => BASE_URL + href);

    return [...new Set(urls)];
  } catch (err) {
    console.error("Error fetching search page:", err.message);
    return [];
  }
};

// Extract article  title, Content, date
const scrapeArticle = async (url) => {
  try {
    const $ = await fetchHTML(url);

    const title = $("h1").first().text().trim() || "No title";

    let date = $("dt:contains('Published')")
      .next("dd")
      .text()
      .trim()
      .slice(0, 12) || null;

    let content = $("main p, article p, .gem-c-govspeak p")
      .map((_, el) => $(el).text())
      .get()
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!content || content.length < 50) {
      content = $("p")
        .map((_, el) => $(el).text())
        .get()
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }

    return {
      url,
      title,
      date,
      content: content.slice(0, 500),
    };
  } catch (err) {
    console.error(`Error scraping ${url}: ${err.message}`);
    return null;
  }
};

(async () => {
  const urls = await getNewsUrls();

  console.log(`Found ${urls.length} URLs`);

  if (!urls.length) return;

  const articles = (
    await Promise.all(urls.map(scrapeArticle))
  ).filter(Boolean);

  console.log("\nFINAL OUTPUT:\n");
  console.log(articles);
})();