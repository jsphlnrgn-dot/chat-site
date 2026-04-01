async function send() {
const message = document.getElementById("message").value;
const files = document.getElementById("fileInput").files;

const formData = new FormData();
formData.append("message", message);

for (let file of files) {
formData.append("files", file);
}

const res = await fetch("/api/chat", {
method: "POST",
body: formData
});

const data = await res.json();

document.getElementById("chat").innerHTML +=
"<p><b>You:</b> " + message + "</p>" +
"<p><b>AI:</b> " + data.reply + "</p>";
}
