import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});

app.get("/health", (req, res) => {
console.log("GET /health");
res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
console.log("POST /api/chat hit");
console.log("Message:", req.body?.message || "");
console.log("Files count:", req.files ? req.files.length : 0);

try {
const userMessage = req.body?.message || "";

const input = [
{
role: "user",
content: userMessage || "Hello"
}
];

app.post("/api/chat", async (req, res) => {
console.log("POST /api/chat hit");

try {
const userMessage = req.body?.message || "";

const response = await client.responses.create({
model: "gpt-4.1-mini",
input: userMessage
});

const reply =
response?.output?.[0]?.content?.[0]?.text ||
response?.output_text ||
"No reply";

res.json({ reply });

} catch (err) {
console.error("Server error:", err);

res.status(500).json({
error: err.message
});
}
});

const response = await client.responses.create({
model: "gpt-4.1-mini",
input
});

const reply =
response?.output?.[0]?.content?.[0]?.text ||
response?.output_text ||
"No reply returned";

console.log("Reply generated");
res.json({ reply });
} catch (err) {
console.error("Server route error:", err);
res.status(500).json({
error: "Server error",
details: err.message
});
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
