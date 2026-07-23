const puppeteer = require("puppeteer");
const fs        = require("fs");
const wait      = (ms) => new Promise(r => setTimeout(r, ms));
 
const BASE_URL  = "https://www.ins.gov.co/buscador-eventos";
 
const SOURCES = [
  {
    name    : "Event Reports",
    listName: "Informesdeevento",
    years   : ["2025", "2026"],
  },
  {
    name    : "Control Panels",
    listName: "tablerosdecontrol",
    years   : ["2026"],
  },
  
];
 
// Phase 1: Open page and establish session
async function launchAndSession(browser, listName) {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
  );
  await page.goto(
    `${BASE_URL}/${listName}/Forms/AllItems.aspx`,
    { waitUntil: "networkidle2", timeout: 60000 }
  );
  await wait(3000);
  console.log(`Session established for: ${listName}`);
  return page;
}
 
// Phase 2: Fetch all items filtered by year using OData GET
async function fetchAllItems(page, listName, years) {
  const allItems = [];
 
  for (const year of years) {
    console.log(`  Fetching year: ${year}`);
 
    let nextUrl = `${BASE_URL}/_api/web/lists/getbytitle('${listName}')/items`
      + `?$select=FileLeafRef,FileRef,A_x00f1_o,Evento/Title`
      + `&$expand=Evento`
      + `&$filter=A_x00f1_o eq '${year}'`
      + `&$top=500`
      + `&$orderby=FileLeafRef asc`;
 
    while (nextUrl) {
      const result = await page.evaluate(async (url) => {
        try {
          const res  = await fetch(url, {
            headers: { "Accept": "application/json;odata=verbose" }
          });
          const json = await res.json();
          return {
            items   : json?.d?.results || [],
            nextLink: json?.d?.__next  || null,
            error   : json?.error?.message?.value || null,
          };
        } catch(e) {
          return { items: [], nextLink: null, error: e.message };
        }
      }, nextUrl);
 
      if (result.error) {
        console.log(`  Error: ${result.error}`);
        break;
      }
 
      console.log(`  Got ${result.items.length} items for year ${year}`);
      allItems.push(...result.items);
 
      nextUrl = result.nextLink || null;
      if (nextUrl) {
        console.log("  Fetching next page...");
        await wait(500);
      }
    }
  }
 
  return allItems;
}
 
// Phase 3: Build clean records with properly encoded URLs
function buildRecords(items, sourceName) {
  return items
    .map(item => {
      const fileRef = item.FileRef      || "";
      const title   = item.FileLeafRef  || "";
      const year    = item.A_x00f1_o    || "";
      const evento  = item.Evento?.Title || "";
 
      // Build absolute URL then encode special characters and spaces
      const rawUrl = fileRef.startsWith("http")
        ? fileRef
        : `https://www.ins.gov.co${fileRef}`;
 
      // encodeURI handles spaces → %20 and accented chars → %C3%xx etc.
      const encodedUrl = encodeURI(decodeURI(rawUrl));
 
      // Clean title — remove .pdf (single or double) and .aspx extensions
      const cleanTitle = title
        .replace(/\.pdf\.pdf$/i, "")
        .replace(/\.pdf$/i,      "")
        .replace(/\.aspx$/i,     "")
        .trim();
 
      return {
        source: sourceName,
        year  : String(year).trim(),
        event : evento.trim(),
        title : cleanTitle,
        url   : encodedUrl,
      };
    })
    .filter(r => r.title && r.url);
}
 
// Phase 4: Save to JSON
function saveResults(records, outputPath = "ins_gov_links.json") {
  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
  console.log(`\nSaved ${records.length} total records to ${outputPath}`);
  records.slice(0, 5).forEach((r, i) =>
    console.log(`[${i+1}] [${r.source}] ${r.year} | ${r.event} | ${r.title.slice(0, 50)}`)
  );
}
 
// Main
(async () => {
  const browser    = await puppeteer.launch({ headless: true });
  const allRecords = [];
 
  for (const source of SOURCES) {
    console.log(`\nScraping: ${source.name}`);
    const page    = await launchAndSession(browser, source.listName);
    const items   = await fetchAllItems(page, source.listName, source.years);
    const records = buildRecords(items, source.name);
    console.log(`Found ${records.length} records from "${source.name}"`);
    allRecords.push(...records);
    await page.close();
  }
 
  await browser.close();
  console.log("\nBrowser closed.");
  saveResults(allRecords);
})();