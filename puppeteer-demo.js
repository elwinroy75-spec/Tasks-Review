/*const puppeteer = require("puppeteer");

// 1. Create a normal async function
async function scrapePage() {
  // 2. Launch browser
  const browser = await puppeteer.launch({
    headless: "new",
  });

  // 3. Open a new page
  const page = await browser.newPage();

  // 4. Go to the website
  await page.goto(
    "https://www.gov.uk/government/news/green-book-changes-to-drive-investment-in-all-parts-of-uk",
    { waitUntil: "networkidle2" }
  );

  // 5. Extract data inside browser context
  const data = await page.evaluate(() => {
    const title = document.querySelector("h1")?.innerText;

    const paragraphs = Array.from(document.querySelectorAll("main p"))
      .map(p => p.innerText)
      .filter(text => text.length > 0);

    return {
      title,
      paragraphs,
    };
  });

  // 6. Print result
  console.log(data);

  // 7. Close browser
  await browser.close();
}

// 8. Call the function
scrapePage();*/

const puppeteer = require("puppeteer");

const BASE_URL = "https://quotes.toscrape.com";

async function getAuthorDetails(page, authorPath) {
  const url = BASE_URL + authorPath;

  await page.goto(url, { waitUntil: "networkidle2" });

  return await page.evaluate(() => {
    const name = document.querySelector("h3")?.innerText.trim();

    const bornDate = document
      .querySelector(".author-born-date")
      ?.innerText.trim();

    const bornLocation = document
      .querySelector(".author-born-location")
      ?.innerText.trim();

    const description = document
      .querySelector(".author-description")
      ?.innerText.trim();

    return {
      name,
      bornDate,
      bornLocation,
      description,
    };
  });
}

async function scrapeAll() {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();

  let currentUrl = BASE_URL;
  let allData = [];

  while (currentUrl) {
    await page.goto(currentUrl, { waitUntil: "networkidle2" });

    // 1. Scrape quotes on current page
    const quotes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".quote")).map(q => ({
        text: q.querySelector(".text")?.textContent.trim(),
        author: q.querySelector(".author")?.textContent.trim(),
        authorLink: q.querySelector('a[href^="/author/"]')?.getAttribute("href"),
        tags: Array.from(q.querySelectorAll(".tag")).map(t =>
          t.textContent.trim()
        ),
      }));
    });

    // 2. Enrich with author details
    for (const quote of quotes) {
      if (quote.authorLink) {
        quote.authorDetails = await getAuthorDetails(page, quote.authorLink);
      }
    }

    allData.push(...quotes);

    // 3. Find next page
    currentUrl = await page.evaluate(() => {
      const next = document.querySelector(".next a");
      return next ? next.href : null;
    });
  }

  console.log(JSON.stringify(allData, null, 2));

  await browser.close();
}

scrapeAll();

const texts = await page.$$eval(".shortbreaks a", elements =>
  elements.map(el => el.innerText)
);