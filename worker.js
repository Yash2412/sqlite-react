// In `worker.js`.
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

const log = (type, payload) => postMessage({ type, payload });
const error = (args) => postMessage({ type: "error", payload: args.join(" ") });

const runQuery = function (query) {
  const db = getDB();
  try {
    const value = db.exec(query, {
      returnValue: "resultRows",
      rowMode: "object",
    });
    log("success", value);
  } catch (e) {
    error([e]);
  } finally {
    db.close();
  }
};

self.onmessage = function (message) {
  const { type } = message.data;
  console.log("Message Received", message);

  if (type === "runQuery") {
    log("loading", "Running Query");
    runQuery(message.data?.query);
  }

  if (type === "changeDB") {
    self.dbName = message.data?.dbName;
    log("success", `DB Set to ${self.dbName}`);
  }
};

function getDB() {
  if ("opfs" in self.sqlite3) {
    return new sqlite3.oo1.OpfsDb(self.dbName);
  } else {
    return new sqlite3.oo1.DB(self.dbName, "ct");
  }
}

sqlite3InitModule({
  print: console.log,
  printErr: error,
})
  .then((sqlite3) => {
    console.log("Done initializing SQLite");
    self.sqlite3 = sqlite3;
    self.dbName = "/mydb.sqlite3";

    console.log("Running SQLite3 version", sqlite3.version.libVersion);

    if ("opfs" in sqlite3) {
      console.log(
        "OPFS is available, created persisted database at",
        self.dbName
      );
    } else {
      console.log(
        "OPFS is not available, created transient database",
        self.dbName
      );
    }
  })
  .catch((e) => error("error", e));
