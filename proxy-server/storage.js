const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "..", "data", "proxy_logs.json");

function readAllLogs() {
  if (!fs.existsSync(LOG_FILE)) return [];
  const raw = fs.readFileSync(LOG_FILE, "utf8") || "[]";
  return JSON.parse(raw);
}

function addLog(entry) {
  const logs = readAllLogs();
  logs.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

module.exports = { readAllLogs, addLog };
