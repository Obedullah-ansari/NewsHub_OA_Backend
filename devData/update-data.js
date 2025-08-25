const mongoose = require("mongoose");
const request = require("request-promise");
const cheerio = require("cheerio");
const News = require("../models/newsModel");
const dotenv = require("dotenv");
const cron = require("node-cron");
dotenv.config({ path: "../config.env" });
const importdata = require("./import-data");

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

// Connect to the database
const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB);
    console.log("Database is connected");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

// Function to update the database
const updateDataBase = async (newsType) => {
  try {
    const source = [
      {
        url: process.env.URL_HTG, // URL for The Hindu
        headers: JSON.parse(process.env.HEADERS_HTG),
      },
      {
        url: process.env.URL_HT, // URL for Times of India
        headers: JSON.parse(process.env.HEADERS_HT),
      },
    ];

    const scrap = async (sources) => {
      const response = await request({
        uri: sources.url,
        headers: sources.headers,
        gzip: true,
        encoding: "utf8",
      });

      const $ = cheerio.load(response);
      const headlines = [];
      $("div.cartHolder.listView").each((index, element) => {
        const headlineElement = $(element).find("h2.hdg3 > a");
        const headline = headlineElement.text().trim();

        let href = headlineElement.attr("href") || "";
        if (href.startsWith("/")) {
          href = `${process.env.URL_HT}${href}`;
        }

        const imageElement = $(element).find("figure img");
        let imageUrl =
          imageElement?.attr("data-src") || imageElement?.attr("src");

        if (!imageUrl) {
          imageUrl =
            "https://logowik.com/content/uploads/images/hindustan-times9271.jpg";
        }

        // Push to result
        headlines.push({ headline, href, imageUrl });
      });

      return headlines;
    };
    const headlines = await Promise.all(source.map(scrap));
    const results = await importdata(newsType);
    await News.updateOne(
      {},
      {
        $set: {
          HTG: headlines[0],
          THG: results[0],
          TOIG: results[1],
          HT: headlines[1],
          TH: results[2],
          TOI: results[3],
        },
      },
      { upsert: true }
    );

    console.log("Data is up-to-date");
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const startCronJob = () => {
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running scheduled job");
    await updateDataBase();
  });
  console.log("Cron job scheduled");
};

const main = async () => {
  await connectToDatabase();
  startCronJob();
};

main();
module.exports = updateDataBase;
