const http = require("http");
const { addLog } = require("./storage");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const PROXY_PORT = 4000;
const DOCS_SERVER = "http://localhost:5000";
const SECRET_KEY = "my-jwt-secret";

function send(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch {
        reject("invalid JSON");
      }
    });
  });
}

http
  .createServer(async (req, res) => {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.replace("Bearer ", "");

    let payload;
    try {
      payload = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return send(res, 401, { ok: false, error: "Unauthorized" });
    }
    if (req.method === "POST" && req.url === "/docs") {
      addLog({
        user: payload.userId || "unknown",
        action: "create",
        timestamp: new Date().toISOString(),
      });
    }

    const url = DOCS_SERVER + req.url;
    let options = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    };

    try {
      if (req.method !== "GET") {
        //Post, Put, delete
        options.body = JSON.stringify(await readBody(req));
      }

      const response = await fetch(url, options);
      const data = await response.json();
      send(res, response.status, data);
    } catch (err) {
      send(res, 500, { ok: false, error: err.toString() });
    }
  })
  .listen(PROXY_PORT, () =>
    console.log("Proxy server running on port", PROXY_PORT)
  );
