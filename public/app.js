console.log("app.js loaded");

window.addEventListener("DOMContentLoaded", () => {
console.log("DOM loaded");

const sendBtn = document.getElementById("sendBtn");
const status = document.getElementById("status");

if (!sendBtn) {
console.error("Send button not found");
return;
}

sendBtn.addEventListener("click", send);
status.textContent = "Page ready";
});

async function send() {
const status = document.getElementById("status");
const chat = document.getElementById("chat");
const messageEl = document.getElementById("message");
const fileInput = document.getElementById("fileInput");

status.textContent = "Send button clicked";

const message = messageEl ? messageEl.value : "";
const files = fileInput ? fileInput.files : [];

const formData = new FormData();
formData.append("message", message);

for (const file of files) {
formData.append("files", file);
}

try {
status.textContent = "Sending request...";

const res = await fetch("/api/chat", {
method: "POST",
body: formData
});

status.textContent = `Response received: ${res.status}`;

const text = await res.text();
console.log("Raw response:", text);

let data;
try {
data = JSON.parse(text);
} catch (e) {
chat.innerHTML += `<p><b>Server returned non-JSON:</b> ${text}</p>`;
return;
}

chat.innerHTML +=
`<p><b>You:</b> ${message}</p>` +
`<p><b>AI:</b> ${data.reply || "No reply returned"}</p>`;

status.textContent = "Done";
} catch (err) {
console.error("Fetch error:", err);
status.textContent = `Error: ${err.message}`;
chat.innerHTML += `<p><b>Error:</b> ${err.message}</p>`;
}
}
