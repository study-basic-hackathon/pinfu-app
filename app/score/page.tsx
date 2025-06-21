"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
// import "./../app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
<<<<<<< Updated upstream

=======
import { propertyValidator } from "aws-cdk-lib";
import { ensurePlayerExists, getPlayerByUserId } from "../utils/playerUtils";
import Link from "next/link";
>>>>>>> Stashed changes
Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
<<<<<<< Updated upstream
  // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const todos=[{id: 13,name: "はむすたー",score: 40000},{id: 10,name: "はむすたー",score: 30000},{id: 15,name: "はむすたー",score: 50000}]
=======
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [playerInfo, setPlayerInfo] = useState<Schema["Player"]["type"] | null>(null);
  const [players, setPlayers] = useState<Schema["Player"]["type"][]>([]);
  const [match, setmatches] = useState<Schema["MahjongScore"]["type"][]>([]);
  const [allScores, setAllScores] = useState<Schema["MahjongScorePlayer"]["type"][]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesWithScores, setMatchesWithScores] = useState<any[]>([]);
  
  // ユーザー情報の取得
  useEffect(() => {
    async function fetchCurrentPlayer() {
      try {
        setLoading(true);
        // 現在のユーザーIDを取得
        const currentUser = await getCurrentUser();
        const userId = currentUser.userId;
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
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
=======
  useEffect(() => {
    async function fetchData() {
      try {
        // 試合データを取得
        const matches = await client.models.MahjongScore.list();
        const sortedmatches = matches.data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setmatches(sortedmatches);

        // 全スコアを取得
        const scores = await client.models.MahjongScorePlayer.list();
        setAllScores(scores.data);

        // プレイヤーデータを取得
        const fetchplayerdata = await client.models.Player.list();
        setPlayers(fetchplayerdata.data);
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  // 試合とスコアを組み合わせる
  useEffect(() => {
    if (match.length > 0 && allScores.length > 0 && players.length > 0) {
      const processedMatches = match.map(m => {
        // この試合のスコアを取得
        const matchScores = allScores.filter(score => score.mahjongScoreId === m.id);
        
        // スコアにプレイヤー名を追加
        const scoresWithNames = matchScores.map(score => {
          const player = players.find(p => p.userId === score.playerId);
          return {
            id: score.playerId,
            name: player?.name || "不明",
            score: score.score
          };
        });

        return {
          date: m.date,
          battletitle: m.gameType,
          score: scoresWithNames
        };
      });

      setMatchesWithScores(processedMatches);
    }
  }, [match, allScores, players]);

// // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

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
  // 戦績記録を追加
  <main className="p-6 bg-white">
    <h1 className="text-2x1 font-bold mb-4">戦績</h1>
    <Link href="/score/create" className="group">
      <button
        className="mb-4 border bg-blue-300 
                          text-white rounded 
                          hover:bg-blue-600">戦歴を追加する
      </button>
    </Link>

    <div className="space-y-6">
      {matchesWithScores.map((m, matchIndex) => (
        <div
          key={matchIndex}
          className="flex border rounded shadow 
                       overflow-hidden flex flex-col  md:flex-row">
          {/* 日付を表示 */}
          <div className="w-1/4 border-r p-4 flex bg-gray-50">
            {/* <img
                  src={m.imageurl}
                  width="150" 
                  height="150"
                /> */}
            <p className="text-sm text-center">{m.date}</p>
          </div>
          {/* 試合形式と結果を表示 */}
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
>>>>>>> Stashed changes
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