const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.bsp.gov.ph/SitePages/Regulations/RegulationsList.aspx?TabId=1",
     { waitUntil: "networkidle2" });

  await page.waitForFunction(
    () => document.querySelectorAll("#RegTable tbody tr").length > 0
  );

  // changing "Issuance Type" dropdown to "Circulars"
  await page.select("#cboReportType", "Circular Letters");

  await page.evaluate(() => {
    $("#divdtFrom").datepicker("setDate", new Date(2024, 0, 1));
  });

  await wait(900);

  await page.click("#btnRefresh");

  await wait(6000);
  await page.waitForFunction(
    () => document.querySelectorAll("#RegTable tbody tr").length > 0
  );

  const html = await page.content();
  const $ = cheerio.load(html);

  const urls = [];
  $("#RegTable tbody tr").each((i, row) => {
    const link = $(row).find("a").first().attr("href");
    
      urls.push(link);
    
  });

  await browser.close();

  console.log(`Found ${urls.length} URLs`);
  console.log(urls);
}

scrapeData();