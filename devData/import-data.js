const request = require("request-promise");
const cheerio = require("cheerio");
const zlib = require("zlib");
const iconv = require("iconv-lite");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

const scrapeAndInsertNc = async (newsType) => {
  try {
    const sources = [
      {
        url: process.env.URL_THG, // URL for The Hindu
        headers: JSON.parse(process.env.HEADERS_THG),
        selector: {
          headline: "h3.title.big > a",
          container: "div.element", // Container element for the headline and image
          image: "div.picture img", // Selector for the image inside the container
        },
      },
      {
        url: process.env.URL_TOIG, // URL for Times of India
        headers: JSON.parse(process.env.HEADERS_TOIG),
        selector: {
          headline: "div.iN5CR > a",
          container: "div.iN5CR",
          image: "div.iN5CR img",
        },
      },
      {
        url: process.env.URL_TH, // URL for The Hindu
        headers: JSON.parse(process.env.HEADERS_TH),
        selector: {
          headline: "h3.title.big > a",
          container: "div.element", // Container element for the headline and image
          image: "div.picture img", // Selector for the image inside the container
        },
      },
      {
        url: process.env.URL_TOI, // URL for Times of India
        headers: JSON.parse(process.env.HEADERS_TOI),
        selector: {
          headline: "div.iN5CR > a",
          container: "div.iN5CR",
          image: "div.iN5CR img",
        },
      },
    ];
    const scrapeSource = async (source) => {
      const response = await request({
        uri: source.url,
        headers: source.headers,
        encoding: null,
        gzip: true,
        resolveWithFullResponse: true,
      });

      // Decompression and decoding
      let rawContent = response.body;
      if (response.headers["content-encoding"]) {
        switch (response.headers["content-encoding"]) {
          case "gzip":
            rawContent = zlib.gunzipSync(rawContent);
            break;
          case "deflate":
            rawContent = zlib.inflateSync(rawContent);
            break;
          case "br":
            rawContent = zlib.brotliDecompressSync(rawContent);
            break;
          default:
            console.warn(
              `Unknown content encoding: ${response.headers["content-encoding"]}`
            );
        }
      }

      const encodings = ["utf-8", "iso-8859-1", "windows-1252"];
      let decodedContent;
      for (let encoding of encodings) {
        try {
          decodedContent = iconv.decode(rawContent, encoding);
          break;
        } catch (err) {
          console.error(
            `Failed to decode with encoding ${encoding}:`,
            err.message
          );
        }
      }
      if (!decodedContent) {
        throw new Error("Failed to decode the response with any encoding");
      }

      const $ = cheerio.load(decodedContent);
      const articles = [];

      // Adjusted selector for the Times of India to get the headline from div.WavNE
      if (
        source.url === process.env.URL_TOIG ||
        source.url === process.env.URL_TOI
      ) {
        $(source.selector.container).each((index, element) => {
          const headline = $(element).find("div.WavNE").text().trim(); // Get the headline from div.WavNE
           let href = $(element).find("div.iN5CR > a").attr("href");
          if (href && href.startsWith("/")) {
            href = `${source.url}${href}`;
          }

          // Extract image URL
          const imageUrl =
            $(element).find("img").attr("data-src") ||
            $(element).find("img").attr("src") ||
            "https://androidappsindia.wordpress.com/wp-content/uploads/2012/06/toi.jpg"; // Default image URL

          articles.push({ headline, href, imageUrl });
        });
      } else {
        // For other sources, retain the existing logic
        $(source.selector.headline).each((index, element) => {
          const headline = $(element).text().trim();
          let href = $(element).attr("href");
          if (href && href.startsWith("/")) {
            href = `${source.url}${href}`;
          }

          // Extract image URL
          let imageUrl = null;
          const container = $(element).closest(source.selector.container);
          imageUrl =
            container.find(source.selector.image).attr("data-src-template") ||
            container.find(source.selector.image).attr("data-original") ||
            container.find(source.selector.image).attr("data-src") ||
            container.find(source.selector.image).attr("src") ||
            "https://india.mom-gmr.org/uploads/tx_lfrogmom/media/16509-1592_import.png"; // Default image URL

          articles.push({ headline, href, imageUrl });
        });
      }

      return articles;
    };

    const results = await Promise.all(sources.map(scrapeSource));
    return results;
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

module.exports = scrapeAndInsertNc;
