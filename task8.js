const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
 
const URL = "https://www.incredibleindia-tourism.org/state-in-india/state-in-india.html";
 
async function scrapeStates() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
 
  await page.goto(URL, { waitUntil: "networkidle2" });
 
  const html = await page.content();
  await browser.close();
 
  const $ = cheerio.load(html);
 
  const states = [];
 
  $("a").each((i, el) => {
    const linkText = $(el).text().trim();
 
    if (linkText.includes("read more")) {
      const $para = $(el).closest("p");
 
      // Description = paragraph content
      const description = $para.find("a").remove().end().text().trim();
      // retrieving state name
      const stateName = $para.prevAll("p.shortbreaks").first().text().trim();
 
        states.push({stateName, description});
    }
  });
 
  console.log(states);
}
scrapeStates();
  