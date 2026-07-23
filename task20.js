const axios = require("axios");
const cheerio = require("cheerio");

const URL = "http://oscbulletin.carswell.com/bb/osc/bb/4905/on4905.htm";
const NoticeAnchor = (name) => !!name && /^[A-Z]_\d+_\d+$/.test(name);
const clean = (text) => text.replace(/\s+/g, " ").trim();

async function scrapeBulletin() {
  const { data: html } = await axios.get(URL, { headers: { "User-Agent": "Mozilla/5.0" } });
  const $ = cheerio.load(html);

  const result = {};
  let chapter, section, notice;

  const save = () => {
    if (notice) result[chapter][section].push({ title: notice.title, content: clean(notice.parts.join(" ")) });
    notice = null;
  };

  $("body").children().each((_, el) => {
    const $el = $(el);
    const tag = el.tagName;

    if (tag === "h3" && $el.find("a[name]").length) {
      //save();
      chapter = clean($el.text()).replace(/^[A-Z]\.\s*/, "");
      result[chapter] ??= {};
    } else if (tag === "h4" && NoticeAnchor($el.next("p").find("a[name]").attr("name"))) {
      //save();
      section = clean($el.text());
      result[chapter][section] ??= [];
    } else if (tag === "p" && NoticeAnchor($el.find("a[name]").attr("name"))) {
      save();
      notice = { title: clean($el.text()), parts: [] };
    } else if (notice) {
      const text = clean($el.text());
      if (text) notice.parts.push(text);
    }
  });
  //save();

  return result;
}

scrapeBulletin()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Scrape failed:", err.message));