import express from "express";
import cors from "cors";
import multer from "multer";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});

const upload = multer({
storage: multer.memoryStorage(),
limits: {
files: 5,
fileSize: 20 * 1024 * 1024
}
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
res.json({ ok: true });
});

function extractReply(response) {
if (typeof response?.output_text === "string" && response.output_text.trim()) {
return response.output_text.trim();
}

if (!Array.isArray(response?.output)) {
return "";
}

const parts = [];

for (const item of response.output) {
if (!Array.isArray(item?.content)) continue;

for (const contentItem of item.content) {
if (typeof contentItem?.text === "string" && contentItem.text.trim()) {
parts.push(contentItem.text.trim());
} else if (
typeof contentItem?.text?.value === "string" &&
contentItem.text.value.trim()
) {
parts.push(contentItem.text.value.trim());
}
}
}

return parts.join("\n").trim();
}

function buildDataUri(file) {
const mime = file.mimetype || "application/octet-stream";
const base64 = file.buffer.toString("base64");
return `data:${mime};base64,${base64}`;
}

app.post("/api/chat", upload.array("files", 5), async (req, res) => {
try {
const userMessage = (req.body?.message || "").trim();
const files = Array.isArray(req.files) ? req.files : [];

const content = [];

if (userMessage) {
content.push({
type: "input_text",
text: userMessage
});
}

for (const file of files) {
content.push({
type: "input_file",
filename: file.originalname,
file_data: buildDataUri(file)
});
}

if (content.length === 0) {
return res.status(400).json({
error: "Please type a message or upload at least one file."
});
}

const response = await client.responses.create({
model: MODEL,
input: [
{
role: "user",
content
}
]
});

const reply = extractReply(response);

console.log("RAW RESPONSE:");
console.log(JSON.stringify(response, null, 2));

if (!reply) {
return res.status(500).json({
error: "No reply returned by model",
debug: {
output_text: response?.output_text ?? null,
output_count: Array.isArray(response?.output) ? response.output.length : 0
}
});
}

res.json({ reply });
} catch (err) {
console.error("API route error:", err);

res.status(err?.status || 500).json({
error: err?.message || "Unknown server error"
});
}
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
