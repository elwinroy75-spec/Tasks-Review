const puppeteer = require("puppeteer");
 
(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
 
    const page = await browser.newPage();
 
    await page.goto("https://www.incredibleindia-tourism.org/state-in-india/state-in-india.html", {
        waitUntil: "networkidle2"
    });
 
    const data = await page.$$eval(".pnl-body p.shortbreaks", elements =>
         elements.map(state => {
            const name = state.querySelector("a").innerText;

            const para = state.nextElementSibling? state.nextElementSibling.outerHTML : "";

            return {
                name, para
            };
         })
    );

    // const data = await page.$$eval(".pnl-body", elements =>
    //      elements.map(state => {
    //         const names = state.querySelector(".shortbreaks").innerText;

    //         const para = state.nextElementSibling? state.nextElementSibling.innerText : "";

    //         return {
    //             names, para
    //         };
    //      })
    // );
    
    console.log(data);
    await browser.close();
})();