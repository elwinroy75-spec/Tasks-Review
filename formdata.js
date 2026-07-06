const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeData() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://www.bsp.gov.ph/SitePages/Regulations/RegulationsList.aspx?TabId=1",

     { waitUntil: "networkidle2" });

  await page.waitForSelector("#RegTable tbody tr");

  // Selecting the circulars from the drop-down
  await page.evaluate(() => {
    $("#cboReportType").val("Circulars").trigger("change");
  });

  // Setting date
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

    // Collect links
    $("#RegTable tbody tr").each((_, row) => {
      const href = $(row).find("a").first().attr("href");
        urls.push(href);
      
    });

    if ($("#RegTable_next").hasClass("disabled")) {
      break;
    }

    // Go to next page
    await page.click("#RegTable_next");

    await delay(1500);
  }

  await browser.close();

  console.log(urls.length,"urls");
  console.log(urls);

  return urls;
}

scrapeData().catch(console.error);