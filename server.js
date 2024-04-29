const express = require("express");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Create a new Pool instance to manage database connections
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL_ID,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

// Function to send email with video post
const sendEmail = async (videoUrl) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL_ID,
    to: process.env.RECEIPIENT_EMAIL_ID,
    subject: "New video post on Twitter",
    html: `<p>A new video post was found on Twitter:</p><p><a href="${videoUrl}">Watch video</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

// Function to save posts to PostgreSQL database
async function savePostsToDatabase(posts) {
  try {
    // Connect to the database
    const client = await pool.connect();

    // Define the table schema
    await client.query(`
        CREATE TABLE IF NOT EXISTS twitter_posts (
          id SERIAL PRIMARY KEY,
          content TEXT,
          image_url TEXT,
          video_url TEXT
        );
      `);

    // Insert the scraped posts into the database
    await Promise.all(
      posts.map(async (post) => {
        const { content, imageUrl, videoUrl } = post;
        const query = `
            INSERT INTO twitter_posts (content, image_url, video_url)
            VALUES ($1, $2, $3)
          `;
        await client.query(query, [content, imageUrl, videoUrl]);
      })
    );

    // Release the database connection
    client.release();
  } catch (error) {
    console.error("Error saving posts to database:", error);
    throw error; // Rethrow the error to handle it in the route handler
  }
}

// Function to scrape Twitter posts
const scrapeTwitterPosts = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://twitter.com/realdonaldtrump");

  const posts = await page.evaluate(() => {
    const postElements = document.querySelectorAll("article");
    const postsData = [];

    postElements.forEach((postElement) => {
      const content = postElement.querySelector("[lang]")?.textContent.trim();
      const imageUrl = postElement.querySelector("img")?.getAttribute("src");
      const videoUrl = postElement
        .querySelector("video source")
        ?.getAttribute("src");

      postsData.push({ content, imageUrl, videoUrl });
    });

    return postsData;
  });

  await browser.close();

  return posts;
};

// Route to scrape and save Twitter posts
app.get("/tweets", async (req, res) => {
  try {
    const posts = await scrapeTwitterPosts();

    // Save posts to PostgreSQL database
    await savePostsToDatabase(posts);

    // Save images locally
    const imagesDirectory = path.join(__dirname, "images");
    if (!fs.existsSync(imagesDirectory)) {
      fs.mkdirSync(imagesDirectory);
    }

    posts.forEach((post, index) => {
      if (post.imageUrl) {
        const imageFileName = `image-${index + 1}.jpg`;
        const imagePath = path.join(imagesDirectory, imageFileName);
        fs.writeFileSync(imagePath, post.imageUrl);
      }
    });

    // Send email if post has video
    posts.forEach((post) => {
      console.log({ post });
      if (post.videoUrl) {
        sendEmail(post.videoUrl);
      }
    });

    res
      .status(200)
      .json({ posts, message: "Posts scraped and saved successfully" });
  } catch (error) {
    console.error("Error scraping Twitter posts:", error);
    res
      .status(500)
      .json({ error: "An error occurred while scraping Twitter posts" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
