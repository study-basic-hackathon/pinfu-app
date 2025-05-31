"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
// import "./../app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const todos=[{id: 13,name: "はむすたー",score: 40000},{id: 10,name: "はむすたー",score: 30000},{id: 15,name: "はむすたー",score: 50000}]

  // function listTodos() {
  //   client.models.Todo.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }

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

  return (
    <main className="p-6">
      <h1 className="text-2x1 font-bold">戦績</h1>
      <button onClick={createTodo} className="mb-4 px-4 py-2 bg-blue-300 text-white rounded hover:bg-blue-600">戦歴を追加する</button>
      
      <div className="flex border rounded overflow-hidden">
        <div className="w-1/4">
          <div className="flex justify-center">
            <div className="test-3x1">写真</div>
          </div>
          <ul className="space-y-2">
            {todos.map((todo,index) => (
              <li key={todo.id} className="text-center ">
                {index+1}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">{battletitle}</h2>

      <ul className="space-y-2">
          {todos.map((todo, index) => (
            <li key={todo.id}
                className="flex justify-between items-center p-2 rounded">

              <span>{name}.</span>
              <span>{todo.score}.</span>
              <span>{Number(todo.score)-35000}</span>
            </li>
          ))}
        </ul>
    </main>
  );
}