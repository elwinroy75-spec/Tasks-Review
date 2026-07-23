const puppeteer = require("puppeteer");
const fs = require("fs");

const YEARS_BACK = 2;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function openPage() {
  const browser = await puppeteer.launch({ headless: false });
  const page    = await browser.newPage();
  await page.goto("https://www.ins.gov.co/buscador-eventos/Paginas/Info-Evento.aspx", { waitUntil: "networkidle2", timeout: 90000 });
  console.log("Page loaded.");
  return { browser, page };
}

// finding the tbody ids belonging to the most recent years
async function findYears(page) {
  const { years, yearMap } = await page.evaluate((yearsBack) => {
    const rows = [...document.querySelectorAll(".col-md-4 tbody td.ms-gb")].map((td) => {
      const id = td.closest("tbody")?.id || "";
      const yr = td.textContent.match(/:\s*(\d{4})/)?.[1];
      return { id, yr };
    }).filter((r) => r.yr);

    const years = [...new Set(rows.map((r) => r.yr))]
      .sort((a, b) => b - a)
      .slice(0, yearsBack);

    // Map each target year's tbody id to its actual year text 
    const yearMap = {};
    rows.filter((r) => years.includes(r.yr)).forEach((r) => { yearMap[r.id] = r.yr; });

    return { years, yearMap };
  }, YEARS_BACK);

  console.log(`Scraping years: ${years.join(", ")}`);
  return yearMap;
}

// Click each year header (by its exact id) to expand it
async function expandYears(page, yearMap) {
  for (const id of Object.keys(yearMap)) {
    await page.click(`#${id} a`).catch(() => {});
    await wait(500);
  }
  //await wait(2000);
  console.log("Year groups expanded.");
}

// Collect every event sub-group whose tbody id matches the target years
async function getEventGroups(page, yearMap) {
  const groups = await page.evaluate((yearMap) => {
    const yearIds = Object.keys(yearMap);

    return [...document.querySelectorAll(".col-md-4 tbody td.ms-gb2")].map((td) => {
      const id = td.closest("tbody")?.id || "";
      const matchedYearId = yearIds.find((yid) => id.startsWith(yid));
      if (!matchedYearId) return null;

      return {
        titleId: id,
        bodyId : id.replace("titl", "tbod").replace(/_$/, "__"),
        year   : yearMap[matchedYearId],
        event  : td.textContent.replace(/^.*Evento\s*:\s*/, "").replace(/\s*\(\d+\).*/, "").trim(),
      };
    }).filter(Boolean);
  }, yearMap);

  console.log(`Found ${groups.length} event sub-groups.`);
  return groups;
}

// Click each sub-group and read the file links 
async function collectLinks(page, groups) {
  const results = [];
  for (let i = 0; i < groups.length; i++) {
    const { titleId, bodyId, year, event } = groups[i];
    console.log(`[${i + 1}/${groups.length}] ${year} / ${event} ... `);

    const alreadyLoaded = await page.evaluate(
      (id) => document.getElementById(id)?.getAttribute("isloaded") === "true",
      bodyId
    );

    if (!alreadyLoaded) {
      await page.click(`#${titleId} a`).catch(() => {});
      await page.waitForFunction(
        (id) => document.getElementById(id)?.getAttribute("isloaded") === "true",
        { timeout: 15000 }, bodyId
      ).catch(() => {});
    }

    const links = await page.evaluate((id) => {
      return [...document.getElementById(id)?.querySelectorAll("a[href]") ?? []]
        .filter((a) => !a.href.includes("/_layouts/") && !a.href.includes("/Forms/"))
        .map((a) => ({ name: a.textContent.trim(), url: a.href }))
        .filter((r) => r.name.length > 2);
    }, bodyId);

    console.log(`${links.length} files`);
    links.forEach((l) => results.push({ year, event, ...l }));
    await wait(300);
  }
  return results;
}
function saveResults(records) {
  fs.writeFileSync("ins_events.json", JSON.stringify(records, null, 2));
  console.log(`\nSaved records to ins_events.json`);
}

// main function
(async () => {
  const { browser, page } = await openPage();
  const yearMap = await findYears(page);
  console.log(yearMap);
  await expandYears(page, yearMap);
  const groups  = await getEventGroups(page, yearMap);
  const records = await collectLinks(page, groups);
  await browser.close();
  saveResults(records);
})();