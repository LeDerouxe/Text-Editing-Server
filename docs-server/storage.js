const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "..", "data", "docs.json");

function readAll() {
  if (!fs.existsSync(DB_FILE)) return [];
  const raw = fs.readFileSync(DB_FILE, "utf8") || "[]";
  return JSON.parse(raw);
}

function writeAll(docs) {
  fs.writeFileSync(DB_FILE, JSON.stringify(docs, null, 2));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function create(owner, content) {
  const docs = readAll();
  const now = new Date().toISOString();
  const doc = { id: genId(), owner, content, createdAt: now, updatedAt: now };
  docs.push(doc);
  writeAll(docs);
  return doc;
}

function getById(id) {
  return readAll().find((d) => d.id === id) || null;
}

function update(id, content) {
  const docs = readAll();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  docs[idx].content = content;
  docs[idx].updatedAt = new Date().toISOString();
  writeAll(docs);
  return docs[idx];
}

function remove(id) {
  const docs = readAll();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  const deleted = docs.splice(idx, 1)[0];
  writeAll(docs);
  return deleted;
}

module.exports = { create, getById, update, remove, readAll };
