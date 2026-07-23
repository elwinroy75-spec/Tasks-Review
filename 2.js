const puppeteer = require("puppeteer");
const fs        = require("fs");

const PAGE_URL   = "https://www.ins.gov.co/buscador-eventos/Paginas/Info-Evento.aspx";
const wait       = (ms) => new Promise((r) => setTimeout(r, ms));
const YEARS_BACK = 2;

// Phase 1: Open the browser and load the page
async function openPage() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(PAGE_URL, { waitUntil: "networkidle2", timeout: 90000 });
  console.log("Page loaded.");
  return { browser, page };
}

// Phase 2: Discover which years currently exist, keep the most recent N
async function findYears(page) {
  await page.waitForFunction(() => document.querySelectorAll("tbody td.ms-gb").length > 0);
  await wait(2000);

  const years = await page.evaluate((yearsBack) => {
    const all = [...document.querySelectorAll("tbody td.ms-gb")]
      .map((td) => td.textContent.match(/:\s*(\d{4})/)?.[1])
      .filter(Boolean);
    return [...new Set(all)].sort((a, b) => b - a).slice(0, yearsBack);
  }, YEARS_BACK);

  console.log(`Scraping years: ${years.join(", ")}`);
  return years;
}

// Phase 3: Click each year header matching the target years (real visible click)
async function expandYears(page, years) {
  const yearIds = await page.evaluate((years) => {
    return [...document.querySelectorAll("tbody td.ms-gb")]
      .filter((td) => years.some((yr) => td.textContent.includes(`: ${yr}`)))
      .map((td) => td.closest("tbody")?.id)
      .filter(Boolean);
  }, years);

  for (const id of yearIds) {
    await page.click(`#${id} a`).catch(() => {});
    await wait(500);
  }

  await wait(3000);
  console.log("Year groups expanded.");
}

// Phase 4: Collect all event sub-groups belonging to the target years
async function getEventGroups(page, years) {
  const groups = await page.evaluate((years) => {
    const yearMap = {};
    document.querySelectorAll("tbody td.ms-gb").forEach((td) => {
      const id = td.closest("tbody")?.id || "";
      const yr = td.textContent.match(/:\s*(\d{4})/)?.[1];
      const ix = id.match(/titl(\d+)-(\d+)_$/);
      if (yr && ix && years.includes(yr)) yearMap[`${ix[1]}-${ix[2]}`] = yr;
    });

    return [...document.querySelectorAll("tbody td.ms-gb2")].map((td) => {
      const id = td.closest("tbody")?.id || "";
      const m  = id.match(/titl(\d+)-(\d+)_(\d+)_$/);
      if (!m || !yearMap[`${m[1]}-${m[2]}`]) return null;
      return {
        titleId: id,
        bodyId : id.replace("titl", "tbod").replace(/_$/, "__"),
        year   : yearMap[`${m[1]}-${m[2]}`],
        event  : td.textContent.replace(/^.*Evento\s*:\s*/, "").replace(/\s*\(\d+\).*/, "").trim(),
      };
    }).filter(Boolean);
  }, years);

  console.log(`Found ${groups.length} event sub-groups.`);
  return groups;
}

// Phase 5: Click each sub-group and read the file links from the DOM
async function collectLinks(page, groups) {
  const results = [];
  for (let i = 0; i < groups.length; i++) {
    const { titleId, bodyId, year, event } = groups[i];
    process.stdout.write(`[${i + 1}/${groups.length}] ${year} / ${event} ... `);

    await page.click(`#${titleId} a`).catch(() => {});
    await page.waitForFunction(
      (id) => document.getElementById(id)?.getAttribute("isloaded") === "true",
      { timeout: 15000 }, bodyId
    ).catch(() => {});

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

// Phase 6: Save results to JSON
function saveResults(records) {
  fs.writeFileSync("ins_events.json", JSON.stringify(records, null, 2));
  console.log(`\nSaved ${records.length} records → ins_events.json`);
}

// main function
(async () => {
  const { browser, page } = await openPage();
  const years   = await findYears(page);
  await expandYears(page, years);
  const groups  = await getEventGroups(page, years);
  const records = await collectLinks(page, groups);
  await browser.close();
  saveResults(records);
})();