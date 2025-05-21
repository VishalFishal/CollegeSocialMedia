const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const download = require('image-downloader');
const { PrismaClient } = require("@prisma/client");

const LINKEDIN_URL = 'https://www.linkedin.com/school/snu-chennai/posts';
const COOKIES_FILE = 'cookies_linkedin.json';
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const prisma = new PrismaClient();

const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const scrollToLoadMorePosts = async (page) => {
    let previousHeight;
    let postsLoaded = 0;
    const targetPosts = 20;

    while (postsLoaded < targetPosts) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await waitFor(2000);

        const posts = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("div.feed-shared-update-v2"))
                .filter(post => post.getAttribute("data-urn")?.includes("activity"));
        });
        postsLoaded = posts.length;

        const newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === previousHeight) break;
    }
};

const scrapeLinkedin = async () => {
    console.log(`[${new Date().toLocaleTimeString()}] 🔍 Starting LinkedIn scrape...`);

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.defaultBrowserContext();
    const page = await context.newPage();

    try {
        if (fs.existsSync(COOKIES_FILE)) {
            const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf8'));
            await context.setCookie(...cookies);
            console.log("✅ Loaded session cookies!");
        } else {
            throw new Error("❌ No cookies found! Please log in manually and save cookies.");
        }

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        );

        await page.goto(LINKEDIN_URL, { waitUntil: "domcontentloaded", timeout: 120000 });
        await page.waitForSelector("div.feed-shared-update-v2", { timeout: 60000 });

        await scrollToLoadMorePosts(page);
        const posts = await page.$$("div.feed-shared-update-v2");

        const scrapedPosts = [];

        for (const post of posts) {
            let localImagePath = "No image";

            try {
                const caption = await post.$eval("span.break-words, div.feed-shared-text", el => el.innerText.trim());
                const image = await post.$eval("img.feed-shared-image__image, div.update-components-image img", el => el.src);

                let profileUrl = await page.url();
                const profileName = profileUrl.split("/").filter(Boolean).pop();

                if (image && image.startsWith("https://media.licdn.com/")) {
                    const fileName = `img_${Date.now()}.jpg`;
                    const downloadPath = path.join(__dirname, 'images/linkedin_posts', fileName);
                    try {
                        await download.image({ url: image, dest: downloadPath });
                        localImagePath = `/images/linkedin_posts/${fileName}`;
                    } catch (err) {
                        console.error("❌ Failed to download image:", err.message);
                    }
                }

                try {
                    await prisma.linkedInPost.create({
                      data: {
                        caption: caption,
                        imagePath: localImagePath,
                        postUrl: profileUrl,
                        profileName: profileName
                      }
                    });
                    console.log("✅ Saved post to DB:", postUrl);
                  } catch (err) {
                    if (err.code === "P2002") {
                      console.log("⚠️ Duplicate post skipped:", postUrl);
                    } else {
                      console.error("❌ DB insert error:", err.message);
                    }
                  }
                await page.keyboard.press("Escape");
                await waitFor(1000);

            } catch (err) {
                console.warn("⚠️ Could not scrape one post:", err.message);
            }
        }
        console.log("✅ Scraping completed!");
    } catch (error) {
        console.error("❌ Scraping failed:", error);
    } finally {
        await browser.close();
    }
};

scrapeLinkedin();
setInterval(scrapeLinkedin, 60 * 60 * 2 * 1000);
