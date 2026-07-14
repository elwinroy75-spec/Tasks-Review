const axios = require("axios");
const cheerio = require("cheerio");

const URL = "https://www.fda.gov/about-fda/center-drug-evaluation-and-research-cder/completed-research-projects-office-prescription-drug-promotion-opdp-research";
const END_MARKER = "Content current as of";

async function scrapeSections() {
  const { data: html } = await axios.get(URL);
  const $ = cheerio.load(html);

  const allHeadings = $("h2").toArray();
  const Title = $("table a[href^='#']").first().text().trim();

  const startIndex = allHeadings.findIndex((el) => $(el).text().trim() === Title);
  const endIndex = allHeadings.findIndex((el) => $(el).text().includes(END_MARKER));

  return allHeadings
    .slice(startIndex, endIndex === -1 ? undefined : endIndex)
    .map((el) => {
      const $heading = $(el);
      const content = [];

      for (const node of $heading.nextUntil("h2").get()) {
        const text = $(node).text().trim();
        if (!text) continue;
        if (/^more information/i.test(text)) break;
        content.push(text);
      }

      return { title: $heading.text().trim(), content: content.join(" ") };
    });
}

scrapeSections()
  .then((sections) => {
    console.log(`Found ${sections.length} sections`);
    console.log(JSON.stringify(sections,null,2));
  })
  .catch((err) => console.error("Failed:", err.message));