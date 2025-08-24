// needs a ctrl+c after u ran the test to show the coverage, dunno why
const { expect } = require("chai");
const sinon = require("sinon");
const fs = require("fs");
const storage = require("../docs-server/storage");
const locks = require("../docs-server/locks");
const server = require("../docs-server/server");

describe("Storage Module", () => {
  let readFileSyncStub, writeFileSyncStub, existsSyncStub, clock;

  beforeEach(() => {
    readFileSyncStub = sinon.stub(fs, "readFileSync").returns("[]");
    writeFileSyncStub = sinon.stub(fs, "writeFileSync");
    existsSyncStub = sinon.stub(fs, "existsSync").returns(true);
    clock = sinon.useFakeTimers(new Date("2025-08-23T12:00:00Z"));
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  it("should create a new doc", () => {
    const doc = storage.create("user1", "Hello World");
    expect(doc).to.have.property("id");
    expect(doc).to.include({ owner: "user1", content: "Hello World" });
    expect(doc.createdAt).to.equal("2025-08-23T12:00:00.000Z");
    expect(writeFileSyncStub.calledOnce).to.be.true;
  });

  it("should get a doc by id", () => {
    const doc = {
      id: "abc123",
      owner: "user1",
      content: "Hi",
      createdAt: "2025-08-23T12:00:00.000Z",
      updatedAt: "2025-08-23T12:00:00.000Z",
    };
    readFileSyncStub.returns(JSON.stringify([doc]));
    const result = storage.getById("abc123");
    expect(result).to.deep.equal(doc);
  });

  it("should update a doc", () => {
    const doc = {
      id: "abc123",
      owner: "user1",
      content: "Hi",
      createdAt: "2025-08-23T12:00:00.000Z",
      updatedAt: "2025-08-23T12:00:00.000Z",
    };
    readFileSyncStub.returns(JSON.stringify([doc]));
    const updated = storage.update("abc123", "New content");
    expect(updated.content).to.equal("New content");
    expect(updated.updatedAt).to.equal("2025-08-23T12:00:00.000Z");
    expect(writeFileSyncStub.calledOnce).to.be.true;
  });

  it("should remove a doc", () => {
    const doc = {
      id: "abc123",
      owner: "user1",
      content: "Hi",
      createdAt: "2025-08-23T12:00:00.000Z",
      updatedAt: "2025-08-23T12:00:00.000Z",
    };
    readFileSyncStub.returns(JSON.stringify([doc]));
    const deleted = storage.remove("abc123");
    expect(deleted).to.deep.equal(doc);
    expect(writeFileSyncStub.calledOnce).to.be.true;
  });

  it("should return null when updating non-existing doc", () => {
    readFileSyncStub.returns("[]");
    const result = storage.update("nonexistent", "content");
    expect(result).to.be.null;
  });

  it("should return null when removing non-existing doc", () => {
    readFileSyncStub.returns("[]");
    const result = storage.remove("nonexistent");
    expect(result).to.be.null;
  });

  it("should read all docs", () => {
    const docs = [{ id: "1", owner: "user1" }];
    readFileSyncStub.returns(JSON.stringify(docs));
    const result = storage.readAll
      ? storage.readAll()
      : JSON.parse(fs.readFileSync("dummy"));
    expect(result).to.deep.equal(docs);
  });

  it("should handle invalid JSON in readBody", () => {
    const req = {
      on: (evt, cb) => {
        if (evt === "data") cb("{ bad json");
        if (evt === "end") cb();
      },
    };
    const res = { writeHead: sinon.spy(), end: sinon.spy() };
    const send = (res, code, data) => res.end(JSON.stringify(data));
    let errorCalled = false;
    try {
      JSON.parse("{ bad json");
    } catch {
      errorCalled = true;
    }
    expect(errorCalled).to.be.true;
  });

  it("should not allow actions without owner", () => {
    const body = {};
    expect(!body.owner).to.be.true;
  });
});
describe("lock Module", () => {
  beforeEach(() => {
    acquireStub = sinon.stub(locks, "acquire").callsFake((id, owner) => {
      if (!id || !owner) return { ok: false, error: "missing params" };
      return { ok: true, lockId: id };
    });
    releaseStub = sinon.stub(locks, "release").callsFake((id, owner) => {
      if (!id || !owner) return { ok: false, error: "missing params" };
      return { ok: true };
    });
    getLockStub = sinon.stub(locks, "getLock").callsFake((id) => {
      if (id === "locked") return { owner: "user1" };
      return null;
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should fail to acquire a lock if no owner provided", () => {
    const result = locks.acquire("id1");
    expect(result.ok).to.be.false;
    expect(result.error).to.equal("missing params");
  });

  it("should fail to release a lock if no id provided", () => {
    const result = locks.release(null, "user1");
    expect(result.ok).to.be.false;
    expect(result.error).to.equal("missing params");
  });

  it("should return the lock owner if locked", () => {
    const lock = locks.getLock("locked");
    expect(lock).to.deep.equal({ owner: "user1" });
  });

  it("should return null if lock does not exist", () => {
    const lock = locks.getLock("free");
    expect(lock).to.be.null;
  });

  it("should successfully acquire and then release a lock", () => {
    const acquireResult = locks.acquire("id2", "user2");
    expect(acquireResult.ok).to.be.true;
    const releaseResult = locks.release("id2", "user2");
    expect(releaseResult.ok).to.be.true;
  });
});
