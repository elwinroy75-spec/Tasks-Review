const puppeteer = require("puppeteer");

const BASE_URL = "https://quotes.toscrape.com";

// Get author details from author page
async function getAuthorDetails(page, path) {
  await page.goto(BASE_URL + path, { waitUntil: "networkidle2" });

  return await page.evaluate(() => ({
    name: document.querySelector("h3")?.innerText.trim(),
    bornDate: document.querySelector(".author-born-date")?.innerText.trim(),
    bornLocation: document.querySelector(".author-born-location")?.innerText.trim(),
    description: document.querySelector(".author-description")?.innerText.trim(),
  }));
}

// Extract quotes from current page
async function getQuotes(page) {
  return await page.evaluate(() =>
    Array.from(document.querySelectorAll(".quote")).map(q => ({
      text: q.querySelector(".text")?.innerText.trim(),
      author: q.querySelector(".author")?.innerText.trim(),
      authorLink: q.querySelector('a[href^="/author/"]')?.getAttribute("href"),
      tags: Array.from(q.querySelectorAll(".tag")).map(t => t.innerText.trim()),
    }))
  );
}

// Get next page URL
async function getNextPage(page) {
  return await page.evaluate(() => {
    const next = document.querySelector(".next a");
    return next ? next.href : null;
  });
}

async function scrapeAll() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  let url = BASE_URL;
  const allData = [];

  while (url) {
    await page.goto(url, { waitUntil: "networkidle2" });

    const quotes = await getQuotes(page);

    for (const q of quotes) {
      if (q.authorLink) {
        q.authorDetails = await getAuthorDetails(page, q.authorLink);
      }
    }

    allData.push(...quotes);

    url = await getNextPage(page);
  }

  console.log(allData);

  await browser.close();
}

scrapeAll();