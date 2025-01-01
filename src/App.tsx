import { ChangeEvent, useMemo, useState } from "react";

import "./App.css";
import useSQLite from "./hooks/useSQLite";
import { Table } from "antd";

function App() {
  const [input, setInput] = useState("");
  const [dbName, setSelectedDB] = useState("mydb.sqlite3");
  const { data, isLoading, error, runQuery, updateDB } = useSQLite();

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const content = useMemo(() => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div className="text-red-500">{error}</div>;
    }
    if (data) {
      if (Array.isArray(data)) {
        return (
          <Table
            columns={Object.keys(data[0] || {}).map((val: string) => ({
              title: val,
              dataIndex: val,
            }))}
            dataSource={data}
          />
        );
      }
      return <div>{data}</div>;
    }
  }, [data, isLoading]);

  return (
    <div className="flex flex-col gap-4 justify-start">
      <h1><a href="https://github.com/Yash2412/sqlite-react">sqlite-react</a></h1>
      <textarea
        className="rounded-md p-5 w-full"
        rows={2}
        value={input}
        onChange={handleInputChange}
        onKeyDown={(e) => (e.key === "Enter" ? runQuery(input) : null)}
        placeholder="Enter your sql query"
      />

      <div className="flex w-full gap-4 justify-between">
        <div className="w-1/3 flex text-left">Selected DB: {dbName}</div>
        <input
          type="file"
          accept=".sqlite3"
          className="w-1/3"
          onChange={(e) => {
            updateDB(e.target.files?.[0]);
            setSelectedDB(e.target.files?.[0]?.name || "");
            e.target.value = "";
          }}
        />
        <button
          className="w-1/6"
          onClick={() =>
            runQuery("SELECT * FROM sqlite_master WHERE type='table';")
          }
        >
          List Tables
        </button>
      </div>

      <div className="w-full">{content}</div>
    </div>
  );
}

export default App;
