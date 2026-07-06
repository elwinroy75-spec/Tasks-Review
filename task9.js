const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
 
(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
 
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );
 
    await page.goto("https://www.incredibleindia-tourism.org/state-in-india/state-in-india.html", {
        waitUntil: "load",
        timeout: 60000
    });
 
    await page.evaluate(() => {
        // Convert href attributes
        document.querySelectorAll('[href]').forEach(el => {
            const href = el.getAttribute('href');
            if (href) {
                el.setAttribute('href', el.href);
            }
        });
        
        // Convert src attributes
        document.querySelectorAll('[src]').forEach(el => {
            const src = el.getAttribute('src');
            if (src) {
            el.setAttribute('src', el.src);
            }
        });
        
        // Convert srcset attributes
        document.querySelectorAll('[srcset]').forEach(el => {
            const srcset = el.srcset;
            if (srcset) {
            el.setAttribute('srcset', srcset);
            }
        });
    });
    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("p.shortbreaks a"))
            .map(a => a.href);
    });
    //we get all the unlique links
    const uniqueLinks = [...new Set(links)];
    console.log("Links:", uniqueLinks);
 
    //array to store the statename and the place with description
    const result = [];
    for(let link of uniqueLinks){
        //we load the link page
        await page.goto(link, {
            waitUntil: "load",
            timeout: 60000
        });
        const htmlContent = await page.content();
        const $ = cheerio.load(htmlContent);
 
        //extract the statename
        const stateName = $("div.page-title h1").text();
 
        //array to push placeName and description
        const places = [];
        $("h3.shortbreaks").each((i, element) => {
            const placeName = $(element).text();
            const description = $(element).next("p").text();
 
            places.push({
                placeName, description
            });
        });
        result.push({
            stateName, places
        });
    }
    
    console.log(JSON.stringify(result, null, 3));
 
    
    await browser.close();
})();

 