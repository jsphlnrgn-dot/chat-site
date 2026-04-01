const sendBtn = document.getElementById("sendBtn");
const messageEl = document.getElementById("message");
const fileInput = document.getElementById("fileInput");
const statusEl = document.getElementById("status");
const chatEl = document.getElementById("chat");
const fileListEl = document.getElementById("fileList");

function setStatus(text) {
statusEl.textContent = text;
}

function escapeHtml(text) {
return text
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;");
}

function addMessage(role, text, isError = false) {
const wrapper = document.createElement("div");
wrapper.className = `msg ${isError ? "error" : role}`;

const label = document.createElement("div");
label.className = "label";
label.textContent = role === "user" ? "You" : isError ? "Error" : "AI";

const body = document.createElement("div");
body.innerHTML = escapeHtml(text);

wrapper.appendChild(label);
wrapper.appendChild(body);
chatEl.appendChild(wrapper);
}

function renderFileList() {
fileListEl.innerHTML = "";

const files = Array.from(fileInput.files || []);
for (const file of files) {
const li = document.createElement("li");
li.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
fileListEl.appendChild(li);
}
}

fileInput.addEventListener("change", renderFileList);

sendBtn.addEventListener("click", sendMessage);

messageEl.addEventListener("keydown", (event) => {
if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
sendMessage();
}
});

async function sendMessage() {
const message = messageEl.value.trim();
const files = Array.from(fileInput.files || []);

if (!message && files.length === 0) {
setStatus("Type a message or choose a file first.");
return;
}

const formData = new FormData();
formData.append("message", message);

for (const file of files) {
formData.append("files", file);
}

addMessage("user", message || `[Uploaded ${files.length} file(s)]`);

sendBtn.disabled = true;
setStatus("Sending...");

try {
const res = await fetch("/api/chat", {
method: "POST",
body: formData
});

const data = await res.json().catch(() => ({}));

if (!res.ok) {
throw new Error(data.error || `Request failed with status ${res.status}`);
}

addMessage("assistant", data.reply || "No reply returned.");
setStatus("Done");
messageEl.value = "";
fileInput.value = "";
renderFileList();
} catch (err) {
addMessage("assistant", err.message || "Something went wrong.", true);
setStatus("Error");
} finally {
sendBtn.disabled = false;
}
}
