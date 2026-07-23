const { produceMessages, PAGE_URL } = require("./app");

async function queueMainUrl() {
  try {
    await produceMessages(PAGE_URL);
    console.log("[main-producer] queued main page url:", PAGE_URL);
  } catch (err) {
    console.error("[main-producer] failed to queue main page url:", err.message);
  }
}

module.exports = { queueMainUrl };