const puppeteer = require("puppeteer-core");
require("dotenv").config();
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { formatDistanceToNow } = require("date-fns");
const https = require("https");

const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const COOKIES_FILE = "cookies.json";

const prisma = new PrismaClient();

const instagramUrls = [
  process.env.INSTAGRAM_URL_1,
  process.env.INSTAGRAM_URL_2,
  process.env.INSTAGRAM_URL_3,
  process.env.INSTAGRAM_URL_4,
  process.env.INSTAGRAM_URL_5,
];

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filepath);
    https.get(url, response => {
      response.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close(resolve);
      });
    }).on("error", err => {
      fs.unlinkSync(filepath);
      reject(err);
    });
  });
};

// Smart scrolling until enough posts are in view
const autoScrollUntilPosts = async (page, minPosts = 5, maxScrolls = 10) => {
  let scrolls = 0;
  let found = 0;

  while (scrolls < maxScrolls && found < minPosts) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 2000));

    found = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("a img"));
      const uniquePosts = new Set();

      for (const img of images) {
        const anchor = img.closest("a");
        if (anchor && anchor.href.includes("/p/")) {
          uniquePosts.add(anchor.href);
        }
      }

      return uniquePosts.size;
    });

    scrolls++;
  }

  console.log(`🌀 Scrolled ${scrolls} time(s), found ${found} post(s)`);
};

const scrapeInstagram = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
  });

  const context = await browser.defaultBrowserContext();
  const page = await context.newPage();

  try {
    // Load cookies
    if (fs.existsSync(COOKIES_FILE)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, "utf8"));
      await context.setCookie(...cookies);
      console.log("✅ Loaded session cookies");
    }

    // Check login status
    await page.goto("https://www.instagram.com/", { waitUntil: "networkidle2" });
    if (await page.$("input[name='username']")) {
      console.log("🔑 Logging in...");
      await page.goto("https://www.instagram.com/accounts/login/", { waitUntil: "networkidle2" });
      await page.type("input[name='username']", process.env.INSTA_USER, { delay: 100 });
      await page.type("input[name='password']", process.env.INSTA_PASS, { delay: 100 });
      await page.click("button[type='submit']");
      await page.waitForNavigation({ waitUntil: "networkidle2" });

      const newCookies = await context.cookies();
      fs.writeFileSync(COOKIES_FILE, JSON.stringify(newCookies, null, 2));
      console.log("✅ Logged in & session saved");
    }

    let allPosts = [];

    fs.mkdirSync("images/posts", { recursive: true });

    for (const url of instagramUrls) {
      const profileName = url.split("/").filter(Boolean).pop();
      console.log(`\n📥 Visiting: ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Only scroll until we get a few posts
      await autoScrollUntilPosts(page, 3);//no of posts

      const rawPosts = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll("a img"));
        const seen = new Set();
        const results = [];

        for (const img of images) {
          const anchor = img.closest("a");
          if (anchor && anchor.href.includes("/p/") && !seen.has(anchor.href)) {
            results.push({
              image: img.src,
              postUrl: anchor.href
            });
            seen.add(anchor.href);
          }
          if (results.length >= 3) break;
        }

        return results;
      });

      const postsWithDetails = [];

      for (const post of rawPosts) {
        const postPage = await context.newPage();
        let caption = "No caption";
        let timestamp = null;

        const postId = post.postUrl.split("/").filter(Boolean).pop();
        const localPostImagePath = `images/posts/${postId}.jpg`;
        try {
          await postPage.goto(post.postUrl, { waitUntil: "networkidle2", timeout: 15000 });
          await postPage.waitForSelector("time", { timeout: 5000 });

          const data = await postPage.evaluate(() => {
            const timeTag = document.querySelector("time");
            const captionElem = document.querySelector("h1");
            return {
              timestamp: timeTag?.getAttribute("datetime") || null,
              caption: captionElem ? captionElem.innerText.replace(/\n/g, " ").trim() : "No caption",
            };
          });

          caption = data.caption;
          timestamp = data.timestamp;

          // ✅ Download post image
          await downloadImage(post.image, localPostImagePath);
          console.log(`🖼️ Downloaded post image for ${postId}`);

        } catch (err) {
          console.warn(`⚠️ Failed to fetch or download ${post.postUrl}`);
        } finally {
          await postPage.close();
        }

        postsWithDetails.push({
          ...post,
          caption,
          timestamp,
          profileName,
          localPostImagePath
        });
      }

      console.log(`✅ Extracted ${postsWithDetails.length} posts`);
      allPosts = allPosts.concat(postsWithDetails);
    }

    // Sort posts by newest first
    allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    for (const post of allPosts) {
      try {
        await prisma.post.create({
          data: post,
        });
      } catch (e) {
        if (e.code === 'P2002') {
          console.log("🔁 Skipping duplicate:", post.postUrl);
        } else {
          console.error("❌ DB error:", e);
        }
      }
    }
    //fs.writeFileSync("posts.json", JSON.stringify(allPosts, null, 2));
    console.log("\n✅ All done! Data saved to posts.json");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
};

scrapeInstagram();
setInterval(scrapeInstagram, 60 * 60 * 2 * 1000);
