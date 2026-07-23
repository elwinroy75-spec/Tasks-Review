const cheerio = require("cheerio");
const fs      = require("fs");
const path    = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────
const API_URL  = "https://www.hkex.com.hk/layouts/HKEX_Common/Tab/NewsCentreDetailsLoad.aspx/DisplayNewsCentreDetailsLoad";
const BASE_URL = "https://www.hkex.com.hk";
const TARGET   = 250;
const BATCH    = 20;   // loadmorecount – matches what the browser sends
const OUTPUT   = path.join(__dirname, "hkex_circulars.json");

// Fixed payload fields (copied exactly from the browser's POST body)
const BASE_PAYLOAD = {
  pageUrl          : "/Services/Circulars-and-Notices/Participant-and-Members-Circulars?sc_lang=en",
  TopicFieldName   : "Link Title1",
  DateFieldName    : "Datetime",
  FilesFieldName   : "Link1",
  ImageFieldName   : "",
  ContentFieldName : "Reference Number",
  Category1FieldName: "Category1",
  Category2FieldName: "Category2",
  Category3FieldName: "Category3",
  loadmorecount    : BATCH,
  IsLoadMore       : true,
  isCardView       : "N",
  TabItemSourceID  : "{7C84DF0B-D731-4243-995B-A957BA753BEF}",
  datefrom         : "",
  dateto           : "",
  category         : "",
  keyword          : "",
  isHideDay        : "False",
  category2        : "",
  TargetLanguage   : "en",
  TargetSite       : null,
  host             : "www.hkex.com.hk",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function toAbsolute(href) {
  if (!href) return "";
  href = href.trim();
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith("//"))       return "https:" + href;
  return BASE_URL + (href.startsWith("/") ? href : "/" + href);
}

function parseDate(day, monthYear) {
  // day = "03", monthYear = "Jul 2026"
  const raw = `${(day||"").trim()} ${(monthYear||"").trim()}`;
  const d = new Date(raw);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return raw.trim();
}

// ─── Parse one batch of HTML returned by the API ─────────────────────────────
function parseBatch(html) {
  const $       = cheerio.load(html);
  const records = [];

  $(".whats_on_tdy_row").each((_, dayBlock) => {
    const $block = $(dayBlock);

    // Date: ball div contains two children — day number and "Mon YYYY"
    const $ball     = $block.find(".whats_on_tdy_ball");
    const day       = $ball.find(".whats_on_tdy_ball_number div").first().text().trim();
    const monthYear = $ball.children().last().text().trim();

    // Each circular is one .whats_on_tdy_row_in inside this date block
    $block.find(".whats_on_tdy_row_in").each((_, row) => {
      const $row = $(row);

      // Department code(s): comma-join all links in text_1
      const deptLinks = $row.find(".whats_on_tdy_text_1 a");
      const departmentCode = deptLinks.map((_, a) => $(a).text().trim()).get().join(", ");

      // Circular link + title: in text_2
      const $circLink = $row.find(".whats_on_tdy_text_2 a").first();
      const linkText  = $circLink.text().trim();
      const href      = $circLink.attr("href") || "";

      // Reference number: in text_3
      const refNumber = $row.find(".whats_on_tdy_text_3").text().trim();

      if (!linkText && !refNumber) return; // skip empty rows

      records.push({
        linkText,
        link          : toAbsolute(href),
        date          : parseDate(day, monthYear),
        refNumber,
        departmentCode,
      });
    });
  });

  return records;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const allRecords = [];
  let currentcount = BATCH; // first call: currentcount = 20

  console.log(`Fetching circulars from HKEX API (target: ${TARGET}) …\n`);

  while (allRecords.length < TARGET) {
    const payload = { ...BASE_PAYLOAD, currentcount };

    console.log(`  → POST  currentcount=${currentcount}  (collected so far: ${allRecords.length})`);

    let responseText;
    try {
      const res = await fetch(API_URL, {
        method : "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Accept"      : "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "Referer"     : "https://www.hkex.com.hk/Services/Circulars-and-Notices/Participant-and-Members-Circulars?sc_lang=en",
          "Origin"      : "https://www.hkex.com.hk",
          "User-Agent"  : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(`  ✗ HTTP ${res.status} — stopping.`);
        break;
      }
      responseText = await res.text();
    } catch (err) {
      console.error(`  ✗ Network error: ${err.message}`);
      break;
    }

    // Parse the JSON envelope  { "d": "<escaped HTML>" }
    let htmlFragment;
    try {
      const json = JSON.parse(responseText);
      htmlFragment = json.d || "";
    } catch {
      console.error("  ✗ Failed to parse JSON response — stopping.");
      break;
    }

    if (!htmlFragment.trim()) {
      console.log("  ✓ Empty response — no more records.");
      break;
    }

    const batch = parseBatch(htmlFragment);
    console.log(`     parsed ${batch.length} records from this batch`);

    if (batch.length === 0) {
      console.log("  ✓ Zero records parsed — reached end of data.");
      break;
    }

    allRecords.push(...batch);
    currentcount += BATCH; // next page: 40, 60, 80 …

    // Polite delay between requests
    await sleep(300);
  }

  // ── Trim and save ──────────────────────────────────────────────────────────
  const output = allRecords.slice(0, TARGET);
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), "utf8");

  console.log(`\n✅  Done! ${output.length} records saved → ${OUTPUT}`);
  console.log("\nFirst 5 records (preview):");
  output.slice(0, 5).forEach((r, i) =>
    console.log(`  [${i+1}] ${r.date}  ${r.refNumber.padEnd(25)}  ${r.departmentCode.padEnd(10)}  ${r.linkText.slice(0, 60)}`)
  );
})();