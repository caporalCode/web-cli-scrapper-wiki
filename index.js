const qoa = require("qoa");
const { format } = require("date-fns");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");
const ps = [
  {
    type: "input",
    query: "Entrer le lien de l'article WIKIPEDIA:",
    handle: "link",
  },
];

const scrapper = async function () {
  const { link } = await qoa.prompt(ps);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(link);
  const sommary = await page.evaluate(() => {
    const getSommaryObject = function (element) {
      if (!element.querySelector("ul")) {
        return {
          number: element.querySelector("span.tocnumber").textContent,
          text: element.querySelector("span.toctext").textContent,
        };
      } else {
        let elementChilds = element.querySelectorAll("ul li");
        let subtitles = [];
        for (const child of elementChilds) {
          subtitles.push(getSommaryObject(child));
        }
        return {
          number: element.querySelector("span.tocnumber").textContent,
          text: element.querySelector("span.toctext").textContent,
          subtitles: subtitles,
        };
      }
    };
    let sommaryElement = document.querySelector("div#toc");
    let sommaryListItem = sommaryElement.querySelectorAll("ul li.toclevel-1");
    let sommary = [];
    for (item of sommaryListItem) {
      const resultItem = getSommaryObject(item);
      sommary.push(resultItem);
    }
    return sommary;
  });
  console.log(sommary);
  const filename = `sommary-${format(new Date(), "yyyyMMdd-HHmmss")}.json`;
  await fs.appendFile(
    path.join(__dirname, "data", filename),
    JSON.stringify(sommary),
  );
  browser.close();
};
scrapper();
