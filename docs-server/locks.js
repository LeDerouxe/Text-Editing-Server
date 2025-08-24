const fs = require("fs");
const path = require("path");
const LOCK_DIR = path.join(__dirname, "..", "data", "locks");
if (!fs.existsSync(LOCK_DIR)) fs.mkdirSync(LOCK_DIR, { recursive: true });

function lockPath(id) {
  return path.join(LOCK_DIR, id + ".lock");
}

function acquire(id, user) {
  const file = lockPath(id);
  if (fs.existsSync(file)) {
    const lock = JSON.parse(fs.readFileSync(file, "utf8"));
    return { ok: false, lock };
  }
  fs.writeFileSync(file, JSON.stringify({ by: user, at: Date.now() }));
  return { ok: true };
}

function release(id, user) {
  const file = lockPath(id);
  if (!fs.existsSync(file)) return { ok: false };
  const lock = JSON.parse(fs.readFileSync(file, "utf8"));
  if (lock.by !== user) return { ok: false, lock };
  fs.unlinkSync(file);
  return { ok: true };
}

function getLock(id) {
  const file = lockPath(id);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

module.exports = { acquire, release, getLock };
