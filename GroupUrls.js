const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function initializeBrowser() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://www.bsp.gov.ph/SitePages/Regulations/RegulationsList.aspx?TabId=1",
    { waitUntil: "networkidle2" }
  );

  await page.waitForSelector("#RegTable tbody tr");

  const issuanceTypes = await page.$$eval("#cboReportType option", (options) =>
    options
      .map((option) => ({
        label: option.textContent,
        value: option.value,
      }))
      .filter((option) => option.value !== "ALL Issuances")
  );

  return { browser, page, issuanceTypes };
}

async function scrapeAllIssuanceTypes(page, issuanceTypes) {
  const allUrls = {};

  for (const issuanceType of issuanceTypes) {
    console.log(`\nScraping: ${issuanceType.label}`);

    await page.select("#cboReportType", issuanceType.value);

    await page.evaluate(() => {
      $("#divdtFrom").datepicker("setDate", new Date(2024, 0, 1));
    });

    await delay(500);
    await page.click("#btnRefresh");
    await delay(20000);

    const urls = [];

    while (true) {
      const html = await page.content();
      const $ = cheerio.load(html);

      $("#RegTable tbody tr").each((_, row) => {
        const href = $(row).find("a").first().attr("href");
        if (href) urls.push(href);
      });

      if ($("#RegTable_next").hasClass("disabled")) break;

      await page.click("#RegTable_next");
      await delay(1500);
    }

    allUrls[issuanceType.label] = urls;
    console.log(`${issuanceType.label}: ${urls.length} urls found`);
  }

  return allUrls;
}

function displayResults(allUrls) {
  console.log(allUrls);
}

async function scrapeData() {
  const { browser, page, issuanceTypes } = await initializeBrowser();

  const allUrls = await scrapeAllIssuanceTypes(page, issuanceTypes);

  await browser.close();

  displayResults(allUrls);

  return allUrls;
}

scrapeData().catch(console.error);