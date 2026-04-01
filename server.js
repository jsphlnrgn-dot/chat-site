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

app.post("/api/chat", upload.array("files"), async (req, res) => {
try {
const userMessage = req.body.message;

let input = [{ role: "user", content: userMessage }];

// Handle uploaded files
if (req.files) {
for (const file of req.files) {
const uploaded = await client.files.create({
file: fs.createReadStream(file.path),
purpose: "assistants"
});

input.push({
role: "user",
content: [
{ type: "input_text", text: "Analyze this file" },
{ type: "input_file", file_id: uploaded.id }
]
});
}
}

const response = await client.responses.create({
model: "gpt-4.1-mini",
input
});

res.json({ reply: response.output[0].content[0].text });
} catch (err) {
console.error(err);
res.status(500).send("Error");
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
