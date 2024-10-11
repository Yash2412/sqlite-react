/**
 * @author Yash Janoria <yash.janoria@314ecorp.com>
 * @description Hook for
 */

import { useEffect, useState } from "react";

const worker = new Worker("/worker.js", { type: "module" });

const useSQLite = () => {
  const [data, setData] = useState<Record<string, any>[] | string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    worker.onmessage = (e) => {
      if (e.data.type === "loading") {
        setIsLoading(true);
        setError(undefined);
      } else if (e.data.type === "success") {
        setIsLoading(false);
        setError(undefined);
        setData(e.data.payload);
      } else if (e.data.type === "error") {
        setIsLoading(false);
        setError(e.data.payload);
      }
    };
  }, []);

  const runQuery = (query: string) => {
    worker.postMessage({ type: "runQuery", query });
  };

  const saveFileInOPFS = async (file: File) => {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(file.name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
  };

  const updateDB = (db?: File) => {
    if (db) {
      setIsLoading(true);
      saveFileInOPFS(db)
        .then(() => {
          worker.postMessage({ type: "changeDB", dbName: db.name });
        })
        .catch((e) => setError(e));
    }
  };

  return {
    isLoading,
    data,
    error,
    runQuery,
    updateDB,
  };
};

export default useSQLite;
