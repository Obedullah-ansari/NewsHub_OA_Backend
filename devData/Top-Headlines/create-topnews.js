const mongoose = require("mongoose");
const request = require("request-promise");
const cheerio = require("cheerio");
const Topnews = require("../../models/topnewsmodal"); // Adjust the path to your model
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config({ path: "../config.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB);
    console.log("Database is connected");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

const scrapeAndInsertTop = async () => {
  try {
    const response = await request({
      uri: process.env.URL_TOP,
      headers: JSON.parse(process.env.HEADERS_TOP),
      gzip: true,
    });

    const $ = cheerio.load(response);

    // Define a categories object with selectors for each category
    const categories = {
      INDIA:
        "div.NewsList_heading__nav__ZoMcU:has(a[href='/india']) + div.NewsList_newslist__1Bh2x li h3 a",
      SPORTS:
        "div.NewsList_heading__nav__ZoMcU:has(a[href='/sports']) + div.NewsList_newslist__1Bh2x li h3 a",
      EDUCATION:
        "div.NewsList_heading__nav__ZoMcU:has(a[href='/education-today']) + div.NewsList_newslist__1Bh2x li h3 a",
      TECHNOLOGY:
        "div.NewsList_heading__nav__ZoMcU:has(a[href='/technology']) + div.NewsList_newslist__1Bh2x li h3 a",
    };

    const topNewsData = {
      INDIA: [],
      SPORTS: [],
      EDUCATION: [],
      TECHNOLOGY: [],
    };

    // Iterate over each category and scrape the top 5 headlines
    for (const [category, selector] of Object.entries(categories)) {
      $(selector).each((index, element) => {
        if (index < 5) {
          const headline = $(element).text().trim();
          let href = $(element).attr("href");
          if (href.startsWith("/")) {
            href = `${process.env.URL_NEWS}${href}`;
          }
          topNewsData[category].push({ topheadline: headline, link: href });
        }
      });
    }

    // Insert the scraped data into the database
    await Topnews.findOneAndUpdate({}, topNewsData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    console.log("Top news headlines imported successfully");
  } catch (error) {
    console.error("An error occurred while scraping data:", error);
  }
};

const deleteData = async () => {
  try {
    await Topnews.deleteMany();
    console.log("Data is deleted from the database successfully");
  } catch (error) {
    console.error("An error occurred while deleting data:", error);
  }
};

// console.log("Script is starting...");
// console.log(process.argv);

const main = async () => {
  await connectToDatabase();

  if (process.argv[2] === "--import") {
    await scrapeAndInsertTop();
  } else if (process.argv[2] === "--delete") {
    await deleteData();
  }

  cron.schedule("0 */6 * * *", async () => {
    console.log("Running scheduled scrape and insert task...");
    await scrapeAndInsertTop();
  });
  console.log("Scheduled job set to run every 6 hours.");
};

main();
