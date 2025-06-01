"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const score = [{ id: 12, name: "kobuta", score: 40000 }, { id: 32, name: "tanuki", score: 30000 }, { id: 3, name: "kitune", score: 50000 }, { id: 3, name: "neko", score: 10000 }]

  //点数が多い順に順位をつける
  //さんまとよんまの要件分岐

  //function listTodos() {
  //  client.models.Todo.observeQuery().subscribe({
  //  next: (data) => setTodos([...data.items]),
  //});
  //}

  // useEffect(() => {
  //   listTodos();
  // }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Enter the result"),
    });
  }

  const battletitle = "試合形式";
  const name = "neko";
  const start = (score.length === 4 ? 30000 : 35000)
  const date = 2025_05_30

  return (
    <main className="p-6">
      <h1 className="text-2x1 font-bold mb-4">戦績</h1>
      <button onClick={createTodo} className="mb-4 px-4 py-2 bg-blue-300 text-white rounded hover:bg-blue-600">戦歴を追加する</button>

      <div className="flex border rounded overflow-hidden">
        <div className="w-1/4 border-r p-4">
          <div className="flex justify-center mb6">
            <div className="test-3x1">写真</div>
          </div>
          <ul className="space-y-2">
            <li className="text-center ">
              {date}
            </li>
          </ul>
        </div>
      </div>

      <div className="w-3/4 p-4">
        <h2 className="text-lg font-semibold mb-2">{battletitle}</h2>
        <ul className="space-y-2">
          {[...score]
            .sort((a, b) => Number(b.score) - Number(a.score))
            .slice(0, score.length === 4 ? 4 : 3)
            .map((score, index) => (
              <li key={score.id} className="flex justify-between items-center p-2 rounded">
                <span>{index + 1}位 </span>
                <span>{score.name} </span>
                <span>{score.score}点 </span>
                <span>{(Number(score.score) - start) / 1000}</span>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}