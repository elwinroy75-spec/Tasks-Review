const puppeteer = require("puppeteer");
const fs        = require("fs");

const PAGE_URL = "https://www.ins.gov.co/buscador-eventos/Paginas/Info-Evento.aspx";
const YEARS    = ["2025", "2026"];
const wait     = (ms) => new Promise((r) => setTimeout(r, ms));

// Phase 1: Open the browser and load the page 
async function openPage() {
  const browser = await puppeteer.launch({ headless: true });
  const page    = await browser.newPage();
  await page.goto(PAGE_URL, { waitUntil: "networkidle2", timeout: 90000 });
  console.log("Page loaded.");
  return { browser, page };
}

// Phase 2: Click the year headers to reveal event sub-groups
async function expandYears(page) {
  await page.waitForFunction(() => document.querySelectorAll("tbody td.ms-gb").length > 0);
  await wait(2000);

  await page.evaluate((years) => {
    document.querySelectorAll("tbody td.ms-gb").forEach((td) => {
      if (years.some((yr) => td.textContent.includes(`: ${yr}`)))
        td.querySelector("a")?.click();
    });
  }, YEARS);

  await wait(3000); 
  console.log("Year groups expanded.");
}

// ── Phase 3: Collect all event sub-groups for each target years 
async function getEventGroups(page) {
  const groups = await page.evaluate((years) => {

    // Step A: map "webpart-yearIndex" → year  e.g. "8-1" → "2026"
    const yearMap = {};
    document.querySelectorAll("tbody td.ms-gb").forEach((td) => {
      const id = td.closest("tbody")?.id || "";
      const yr = td.textContent.match(/:\s*(\d{4})/)?.[1];
      const ix = id.match(/titl(\d+)-(\d+)_$/);
      if (yr && ix && years.includes(yr)) yearMap[`${ix[1]}-${ix[2]}`] = yr;
    });

    // Step B: collect every event sub-group whose parent year is in yearMap
    const groups = [];
    document.querySelectorAll("tbody td.ms-gb2").forEach((td) => {
      const id = td.closest("tbody")?.id || "";
      const m  = id.match(/titl(\d+)-(\d+)_(\d+)_$/);
      if (!m) return;

      const year = yearMap[`${m[1]}-${m[2]}`];
      if (!year) return;

      groups.push({
        titleId : id,
        bodyId  : id.replace("titl", "tbod").replace(/_$/, "__"), 
        year,
        event   : td.textContent.replace(/^.*Evento\s*:\s*/, "").replace(/\s*\(\d+\).*/, "").trim(),
      });
    });

    return groups;
  }, YEARS);

  console.log(`Found ${groups.length} event sub-groups.`);
  return groups;
}

// ── Phase 4: Click each sub-group and read the file links from the DOM 
async function collectLinks(page, groups) {
  const results = [];

  for (let i = 0; i < groups.length; i++) {
    const { titleId, bodyId, year, event } = groups[i];
    process.stdout.write(`[${i + 1}/${groups.length}] ${year} / ${event} ... `);

    // Click the event sub-group header
    await page.evaluate((id) => {
      document.querySelector(`#${CSS.escape(id)} a`)?.click();
    }, titleId);

    // Wait for SharePoint to load the file rows into the tbody
    await page.waitForFunction(
      (id) => document.getElementById(id)?.getAttribute("isloaded") === "true",
      { timeout: 15000 },
      bodyId
    ).catch(() => {});

    // Read file links directly from the DOM
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

// Phase 5: Save results to JSON 
function saveResults(records) {
  fs.writeFileSync("ins_events.json", JSON.stringify(records, null, 2));
  console.log(`\nSaved ${records.length} records → ins_events.json`);
}

// main function
(async () => {
  const { browser, page } = await openPage();
  await expandYears(page);
  const groups  = await getEventGroups(page);
  const records = await collectLinks(page, groups);
  await browser.close();
  saveResults(records);
})();
