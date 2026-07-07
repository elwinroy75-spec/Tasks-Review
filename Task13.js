const puppeteer = require("puppeteer");
const cheerio   = require("cheerio");
const fs        = require("fs");

const URL    = "https://www.hkex.com.hk/Services/Circulars-and-Notices/Participant-and-Members-Circulars?sc_lang=en";
const TARGET = 250;
const wait   = (ms) => new Promise(r => setTimeout(r, ms));

// Phase 1: Launch browser and navigate to page
async function launchAndNavigate() {
  const browser = await puppeteer.launch({ headless: true });
  const page    = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  console.log("Page loaded.");
  return { browser, page };
}

// Phase 2: Scroll until TARGET items are loaded
async function scrollUntilLoaded(page) {
  let prevCount = 0, stalls = 0;

  while (true) {
    const count = await page.evaluate(() =>
      document.querySelectorAll(".whats_on_tdy_text_2").length
    );
    console.log(`Items loaded: ${count}`);

    if (count >= TARGET) {
      console.log("Reached target Count");
      break;
    }

    stalls = count === prevCount ? stalls + 1 : 0;

    if (stalls >= 5) {
      console.log("No more items to load.");
      break;
    }

    prevCount = count;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wait(15000);
  }
}

// Phase 3: Extract HTML content and close browser
async function extractAndClose(browser, page) {
  const html = await page.content();
  await browser.close();
  return html;
}

// Phase 4: Parse circulars from raw HTML
function parseCirculars(html) {
  const $       = cheerio.load(html);
  const results = [];

  $(".whats_on_tdy_row").each((_, group) => {
    const day       = $(group).find(".whats_on_tdy_ball_number div").text().trim();
    const monthYear = $(group).find(".whats_on_tdy_ball").children().last().text().trim();
    const date      = `${day} ${monthYear}`;

    $(group).find(".whats_on_tdy_row_in").each((_, row) => {
      const $anchor = $(row).find(".whats_on_tdy_text_2 a").first();
      const href    = $anchor.attr("href") || "";

      results.push({
        date,
        departmentCode : $(row).find(".whats_on_tdy_text_1 a").text().trim(),
        refNumber      : $(row).find(".whats_on_tdy_text_3").text().trim(),
        linkText       : $anchor.text().trim(),
        link           : href.startsWith("http") ? href : "https://www.hkex.com.hk" + href,
      });
    });
  });

  const parsed = results.filter(r => r.linkText).slice(0, TARGET);
  console.log(`Parsed ${parsed.length} records.`);
  return parsed;
}

// Phase 5: Save results to JSON file
function saveResults(records, outputPath = "hkex_circulars.json") {

  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
  console.log(`\nSaved ${records.length} records to ${outputPath}`);

  records.slice(0, 3).forEach((r, i) =>
    console.log(`[${i + 1}] ${r.date} | ${r.departmentCode} | ${r.linkText.slice(0, 60)}`)
  );
}

// main function
(async () => {
  const { browser, page } = await launchAndNavigate();  
  await scrollUntilLoaded(page);                        
  const html    = await extractAndClose(browser, page); 
  const records = parseCirculars(html);                 
  saveResults(records);                                 
})();