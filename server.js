const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json()); // to parse JSON
app.use('/images', express.static('images'));

app.get("/posts", async (req, res) => {
  const { profileName } = req.query;
  const where = profileName ? { profileName } : {};
  const posts = await prisma.post.findMany({
    where,
    orderBy: { timestamp: "desc" }
  });
  res.json(posts);
});

app.get("/profileNames", async (req, res) => {
  const profiles = await prisma.post.findMany({
    select: { profileName: true },
    distinct: ["profileName"],
  });
  const names = profiles.map(p => p.profileName);
  res.json(names);
});


app.get("/linkedin_posts", async (req, res) => {
  const linkedin_posts = await prisma.linkedInPost.findMany({
    orderBy: { timestamp: "desc" }
  });
  res.json(linkedin_posts);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  return res.json({ message: "Login successful", email: user.email });
});

// --- POST /register (optional helper for testing)
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashed }
    });
    res.json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Backend running on http://localhost:3000");
});