const express = require("express");
const { init, consumeMessages } = require("./rabbitmq-app/app");
const { queueMainUrl } = require("./rabbitmq-app/MainPro");

const PORT = 3000;
const CONSUMER_INTERVAL_MS = 2000;

async function start() {
  try {
    await init();
    await queueMainUrl();

    setInterval(consumeMessages, CONSUMER_INTERVAL_MS);
    console.log(`[consumer] started - checking queue every ${CONSUMER_INTERVAL_MS / 1000}s`);

    const app = express();
    app.get("/", (req, res) => res.send("OK"));
    app.listen(PORT, () => console.log(`[server] running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("[server] failed to start:", err.message);
  }
}

start();