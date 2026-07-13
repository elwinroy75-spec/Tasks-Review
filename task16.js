const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const BASE = 'https://www.a2x.co.za/news/';

async function scrapeNewsUrls() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#NewsMsgTbl tbody tr a.newsDetailView', { timeout: 15000 });

  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  const urls = [];

  $('#NewsMsgTbl tbody tr a.newsDetailView').each((_, el) => {
    const newsRef = $(el).attr('newsref');
    if (!newsRef) return;
    urls.push(`${BASE}news-detail?_=${Date.now()}&newsRef=${newsRef}`);
  });

  return urls;
}

scrapeNewsUrls()
  .then((urls) => {
    console.log(`Found ${urls.length} urls`);
    urls.forEach((url) => console.log(url));
  })
  .catch((err) => console.error('Scrape failed:', err.message));