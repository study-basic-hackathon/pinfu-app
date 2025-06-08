"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { propertyValidator } from "aws-cdk-lib";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const match = [{
    date: "2025/05/30",
    battletitle: "四人半荘",
    imageurl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5mUgrPY21sib6L8Hj1A7l3xTy7uBIrCwtQBFWoZB2TT2xDcTeC8nfJG6hoirMy_4zN0Hdb-DTFQFR_U4pJDFB_iXPFfnO86eNsDlfcGnKyTp7a_HE3v3FWvFmSiD6L_amVsFd4-W8J2aBJK0h5Ym8_PFu5_7XMNMRl1pyK8BsmjHdgpKpEYXVj7nHk3ax/s938/asobu_cat_shadow.png",
    score: [{ id: 12, name: "kobuta", score: 40000 },
    { id: 32, name: "tanuki", score: 30000 },
    { id: 3, name: "kitune", score: 50000 },
    { id: 2, name: "neko", score: 10000 }]
  },

  {
    date: "2025/06/06",
    battletitle: "三麻東風",
    imageurl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjOedVmKs2D92xGxLP9d5CgE39fm5CLUYVc10KpN5atFQYTZGDjjnBqr5ts7Hfd_Ic_wqfPR_d2-4slAGm9MN654shJxeI7E3pgXWASkL62Dd84RtSxjk97HSRZPOa6F-qaGesdBaPeErHk/s817/character_ha_shibou.png",
    score: [{ id: 5, name: "uma", score: 20000 },
    { id: 18, name: "inu", score: 60000 },
    { id: 15, name: "tako", score: 35000 }]
  }
  ]

  //function listTodos() {
  //  client.models.Todo.observeQuery().subscribe({
  //  next: (data) => setTodos([...data.items]),
  //});
  //}

  // useEffect(() => {
  //   listTodos();
  // }, []);

  function createscore() {
    client.models.Todo.create({
      content: window.prompt("Enter the result"),
    });
  }

  return (
    <main className="p-6 bg-white">
      <h1 className="text-2x1 font-bold mb-4">戦績</h1>
      <button onClick={createscore} 
              className="mb-4 border bg-blue-300 
                         text-white rounded 
                        hover:bg-blue-600">戦歴を追加する
      </button>

      <div className="space-y-6">
        {match.map((m, matchIndex) => (
          <div
            key={matchIndex}
            className="flex border rounded shadow 
                       overflow-hidden flex flex-col  md:flex-row">
           
              <div className="w-1/4 border-r p-4 flex bg-gray-50">
                <img
                  src={m.imageurl}
                  width="150" 
                  height="150"
                />
                <p className="text-sm text-center">{m.date}</p>
              </div>
            <div className="w-3/4 p-4">
              <h2 className="text-lg font-semibold mb-2">{m.battletitle}</h2>
              <ul className="space-y-2">
                {[...m.score]
                  .sort((a, b) => Number(b.score) - Number(a.score))
                  .slice(0, m.score.length === 4 ? 4 : 3)
                  .map((score, index) => (
                    <li key={score.id} className="flex justify-between p-2 rounded">
                      <span className="w-10">{index + 1}位 </span>
                      <span className="flex-1">{score.name} </span>
                      <span className="w-20 text-right">{score.score}点 </span>
                      <span className="w-24 text-right">{(Number(score.score) - (m.score.length === 4 ? 30000 : 35000)) / 1000}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}