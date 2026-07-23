const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.zbs-giz.si/ustanovni-akti-in-porocila/';

async function scrapeReports(url) {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  const scriptContent = $('script')
    .filter((_, el) => ($(el).html() || '').includes('et_link_options_data'))
    .first()
    .html();

  if (!scriptContent) throw new Error('et_link_options_data script block not found');

  const match = scriptContent.match(/et_link_options_data\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error('Could not parse et_link_options_data');

  const linkData = JSON.parse(match[1]);

  const seen = new Set();
  const results = [];

  for (const { class: cls, url: fileUrl } of linkData) {
    const filename = fileUrl.split('/').pop();
    if (seen.has(filename)) continue;
    seen.add(filename);

    const $el = $(`.${cls}`).first();
    const heading = $el.find('h4.et_pb_module_header').first().text().trim();
    const title = heading || $el.text().trim().split('\n')[0].trim() || null;

    results.push({ title, url: fileUrl });
  }

  return results;
}

scrapeReports(url)
  .then((results) => {
    console.log(results);
  })
  .catch((err) => console.error('Scrape failed:', err.message));