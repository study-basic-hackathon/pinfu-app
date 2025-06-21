"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { getCurrentUser } from 'aws-amplify/auth';
import "./../app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { propertyValidator } from "aws-cdk-lib";
import { ensurePlayerExists, getPlayerByUserId } from "../utils/playerUtils";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [playerInfo, setPlayerInfo] = useState<Schema["Player"]["type"] | null>(null);
  const [players,setPlayers] = useState<Schema["Player"]["type"][]>([]);
  const [match, setmatches] = useState<Schema["MahjongScore"]["type"][]>([]);
  const [scoreplayer, setscores] = useState<Schema["MahjongScorePlayer"]["type"][]>([]);
  const [loading, setLoading] = useState(true);
  
  // ユーザー情報の取得
  useEffect(() => {
    async function fetchCurrentPlayer() {
      try {
        setLoading(true);
        // 現在のユーザーIDを取得
        const currentUser = await getCurrentUser();
        const userId = currentUser.userId;

        // まず既存のプレイヤー情報を取得を試行
        let player = await getPlayerByUserId(userId);

        setPlayerInfo(player);
      } catch (error) {
        console.error("プレイヤー情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchCurrentPlayer();
    }
  }, [user]);

  useEffect(() => {

    async function fetchmatches() {
      try {
        const matches = await client.models.MahjongScore.list();
        const sortedmatches = matches.data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setmatches(sortedmatches);

        const scores = await client.models.MahjongScorePlayer.list();
        const Myscores = scores.data.filter((score) => score.playerId === user.userId)
        setscores(Myscores);
      } catch (error) {
        console.error("試合記録の取得に失敗しました", error);
      }
    }

    fetchmatches();

    async function fetchplayers(){
      try{
        const fetchplayerdata= await client.models.Player.list();
        const fetchplayers=fetchplayerdata.data;
        setPlayers(fetchplayers);
      }catch (error) {
        console.error("プレイヤーの取得に失敗しました", error);
      }
    }
    fetchplayers();
  }, []);




// // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

//function listTodos() {
//  client.models.Todo.observeQuery().subscribe({
//  next: (data) => setTodos([...data.items]),
//});
//}
const namefromid=async(playerId:string)=>{
  const player=await getPlayerByUserId(playerId);
  return player?.name;
}

const Mymatch = match.map((m => ({
  date: m.date,
  battletitle: m.gameType,
  //    imageurl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5mUgrPY21sib6L8Hj1A7l3xTy7uBIrCwtQBFWoZB2TT2xDcTeC8nfJG6hoirMy_4zN0Hdb-DTFQFR_U4pJDFB_iXPFfnO86eNsDlfcGnKyTp7a_HE3v3FWvFmSiD6L_amVsFd4-W8J2aBJK0h5Ym8_PFu5_7XMNMRl1pyK8BsmjHdgpKpEYXVj7nHk3ax/s938/asobu_cat_shadow.png",
  score: scoreplayer.map((p => ({
    id: p.playerId,
    name: namefromid(p.playerId),
    score: p.score
  })))
})))


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
    <button onClick={createscore}
      className="mb-4 border bg-blue-300 
                         text-white rounded 
                        hover:bg-blue-600">戦歴を追加する
    </button>


    <div className="space-y-6">
      {Mymatch.map((m, matchIndex) => (
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
                    <span className="flex-1">{score.id} </span>
                    <span className="w-20 text-right">{score.name}点 </span>
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