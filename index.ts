import { fetch, write } from "bun";
import fs from "fs";

interface Item {
  date: string;
  size: string;
  title: string;
  magnet: string;
}

type MonthData = {
  [month: string]: Item[];
};

type YearData = {
  [year: string]: MonthData;
};

let all: YearData = {};

function getMonthFromDate(dateString: string): string {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const parts = dateString.split("-");
  const monthIndex = parseInt(parts[0], 10) - 1;

  return months[monthIndex];
}

function processData(text: string, name = "") {
  //   let items: MonthData = {};
  let itemsArray: Item[] = [];
  let item: Item = {
    date: "",
    size: "",
    title: "",
    magnet: "",
  };
  let resets = 0;
  let counter = 0;

  let lines = text.split("\n");
  lines = lines.filter((line) => line.includes("<td>"));

  lines.forEach((line) => {
    if (!line.includes("<td>")) {
      return;
    }

    line = line.replace("<td>", "").replace("</td>", "");

    if (!line.includes("<button")) {
      line = line
        .replace(/&#038;/g, "&")
        .replace(/&#8217;/g, "’")
        .replace(/&#8220;/g, "“")
        .replace(/&#8221;/g, "”")
        .replace(/&#8211;/g, "–")
        .replace(/&#8212;/g, "—")
        .replace(/&#8230;/g, "…")
        .replace(/&#8242;/g, "′")
        .replace(/&#8243;/g, "″")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    }
    if (line.includes("<button")) {
      line = line
        .replace('<button class="copy-btn" onclick="copyMagnetLink(\'', "")
        .replace("')\">Copy Magnet</button>", "");
    }
    line = line.trim();
    if (counter === 4) {
      counter = 0;

      itemsArray.push(item);
      item = {
        date: "",
        size: "",
        title: "",
        magnet: "",
      };
      resets++;
    }

    if (counter === 0) {
      item.date = line;
    }
    if (counter === 1) {
      item.size = line;
    }
    if (counter === 2) {
      item.title = line;
    }
    if (counter === 3) {
      item.magnet = line;
    }
    counter++;
  });

  return itemsArray;
  //   await write("data.json", JSON.stringify(all));
}

const pages = {
  "2020": "https://thealexjonesshow.net/?page_id=1651",
  "2021": "https://thealexjonesshow.net/?page_id=1571",
  "2022": "https://thealexjonesshow.net/?page_id=1569",
  "2023": "https://thealexjonesshow.net/?page_id=1567",
  "2024": "https://thealexjonesshow.net/?page_id=1562",
};

function getItemsByMonth(items: Item[]) {
  let itemsByMonth: MonthData = {};

  return itemsByMonth;
}

async function main() {
  const date = new Date();
  fs.mkdir(`data/${date.getDate()}`, (err) => {
    if (err) {
      console.log(err);
    }
  });
  let combined: Item[] = [];
  const zero = await fetch(pages["2020"]);
  const zeroText = await zero.text();
  let data = processData(zeroText, "2020");
  combined = combined.concat(data);
  await write(`data/${date.getDate()}/2020.json`, JSON.stringify(data));

  const one = await fetch(pages["2021"]);
  const oneText = await one.text();
  data = processData(oneText, "2021");
  combined = combined.concat(data);
  await write(`data/${date.getDate()}/2021.json`, JSON.stringify(data));

  const two = await fetch(pages["2022"]);
  const twoText = await two.text();
  data = processData(twoText, "2022");
  combined = combined.concat(data);
  await write(`data/${date.getDate()}/2022.json`, JSON.stringify(data));

  const three = await fetch(pages["2023"]);
  const threeText = await three.text();
  data = processData(threeText, "2023");
  combined = combined.concat(data);
  await write(`data/${date.getDate()}/2023.json`, JSON.stringify(data));

  const four = await fetch(pages["2024"]);
  const fourText = await four.text();
  data = processData(fourText, "2024");
  combined = combined.concat(data);
  await write(`data/${date.getDate()}/2024.json`, JSON.stringify(data));

  await write(`data/${date.getDate()}/combined.json`, JSON.stringify(combined));
}

await main();
