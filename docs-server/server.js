const http = require("http");
const { create, getById, update, remove, readAll } = require("./storage");
const { acquire, release, getLock } = require("./locks");

const PORT = 5000;

function send(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req, cb) {
  let data = "";
  req.on("data", (c) => (data += c));
  req.on("end", () => {
    try {
      cb(JSON.parse(data || "{}"));
    } catch {
      send(res, 400, { ok: false, error: "invalid JSON" });
    }
  });
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const method = req.method;
    const urlParts = url.pathname.split("/").filter(Boolean);

    if (urlParts[0] === "docs") {
      const id = urlParts[1];

      if (id) {
        switch (method) {
          case "GET": {
            const doc = getById(id);
            if (!doc) return send(res, 404, { ok: false });
            const lock = getLock(id);
            return send(res, 200, {
              ok: true,
              data: doc,
              lockedBy: lock ? lock.by : null,
            });
          }

          case "PUT":
            return readBody(req, (body) => {
              if (!body || !body.owner) return send(res, 400, { ok: false });
              const lock = getLock(id);
              if (lock && lock.by !== body.owner)
                return send(res, 423, { ok: false, error: "locked" });
              auth = getById(id);
              if (auth.owner !== body.owner)
                return send(res, 401, {
                  ok: false,
                  error: "u can access just to your files",
                });
              const doc = update(id, body.content || "");
              if (!doc) return send(res, 404, { ok: false });
              send(res, 200, { ok: true, data: doc });
            });

          case "DELETE":
            return readBody(req, (body) => {
              if (!body || !body.owner) return send(res, 400, { ok: false });
              const lock = getLock(id);
              if (lock && lock.by !== body.owner)
                return send(res, 423, { ok: false, error: "locked" });
              auth = getById(id);
              if (auth.owner !== body.owner)
                return send(res, 401, {
                  ok: false,
                  error: "u can access just to your files",
                });
              const doc = remove(id);
              if (!doc) return send(res, 404, { ok: false });
              send(res, 200, { ok: true, data: doc });
            });

          case "POST":
            if (urlParts[2] === "lock") {
              return readBody(req, (body) => {
                if (!body || !body.owner) return send(res, 400, { ok: false });
                auth = getById(id);
                if (auth.owner !== body.owner)
                  return send(res, 401, {
                    ok: false,
                    error: "u can access just to your files",
                  });
                const result = acquire(id, body.owner);
                send(res, result.ok ? 200 : 423, result);
              });
            } else if (urlParts[2] === "unlock") {
              return readBody(req, (body) => {
                if (!body || !body.owner) return send(res, 400, { ok: false });
                auth = getById(id);
                if (auth.owner !== body.owner)
                  return send(res, 401, {
                    ok: false,
                    error: "u can access just to your files",
                  });
                const result = release(id, body.owner);
                send(res, result.ok ? 200 : 400, result);
              });
            } else {
              return send(res, 405, { ok: false, error: "Method not allowed" });
            }

          default:
            return send(res, 405, { ok: false, error: "Method not allowed" });
        }
      } else {
        switch (method) {
          case "GET":
            const allDocs = readAll();
            return send(res, 200, { ok: true, data: allDocs });

          case "POST":
            return readBody(req, (body) => {
              if (!body || !body.owner) return send(res, 400, { ok: false });
              const doc = create(body.owner, body.content || "");
              send(res, 201, { ok: true, data: doc });
            });

          default:
            res.writeHead(405);
            return send(res, 405, { ok: false, error: "Method not allowed" });
        }
      }
    } else {
      send(res, 404, { ok: false });
    }
  })
  .listen(PORT, () => console.log("Docs server running on port", PORT));
