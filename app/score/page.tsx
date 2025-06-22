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
import { ensurePlayerExists, getPlayerByUserId, getPlayerById } from "../utils/playerUtils";
import Link from "next/link";
Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [playerInfo, setPlayerInfo] = useState<Schema["Player"]["type"] | null>(null);
  const [players,setPlayers] = useState<Schema["Player"]["type"][]>([]);
  const [matchesWithScores, setMatchesWithScores] = useState<Array<{
    date: string;
    battletitle: string;
    score: Array<{
      id: string;
      name: string;
      score: number;
    }>;
  }>>([]);
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

  // 試合データの取得とプレイヤー名の解決を行う
  useEffect(() => {
    async function fetchMatchesWithPlayerNames() {
      try {
        const matches = await client.models.MahjongScore.list();
        const sortedmatches = matches.data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const scores = await client.models.MahjongScorePlayer.list();
        const Myscores = scores.data.filter((score) => score.playerId === user.userId);
        setscores(Myscores);

        // デバッグ情報を追加
        console.log("全ての試合:", sortedmatches);
        console.log("全てのスコア:", scores.data);
        console.log("マイスコア:", Myscores);

        console.log("=== スコアデータの詳細確認 ===");
        console.log("スコアデータ数:", scores.data.length);
        scores.data.forEach((score, index) => {
          console.log(`  スコア${index + 1}:`, {
            id: score.id,
            playerId: score.playerId,
            score: score.score,
            mahjongScoreId: score.mahjongScoreId
          });
        });
        console.log("=== スコアデータ確認終了 ===");

        // プレイヤー名を含む試合データを作成
        const matchesWithNames = await Promise.all(
          sortedmatches.map(async (match) => {
            const matchScores = scores.data.filter(score => score.mahjongScoreId === match.id);
            console.log(`試合 ${match.id} のスコア:`, matchScores);
            
            const scoresWithNames = await Promise.all(
              matchScores.map(async (score) => {
                console.log(`プレイヤーID ${score.playerId} を検索中...`);
                
                // Player.idで直接検索
                const player = await getPlayerById(score.playerId);
                console.log(`getPlayerById関数の結果:`, player);
                
                return {
                  id: score.playerId,
                  name: player?.name || 'Unknown Player',
                  score: score.score
                };
              })
            );
            return {
              date: match.date,
              battletitle: match.gameType,
              score: scoresWithNames
            };
          })
        );

        setMatchesWithScores(matchesWithNames);
      } catch (error) {
        console.error("試合記録の取得に失敗しました", error);
      }
    }

    if (user) {
      fetchMatchesWithPlayerNames();
    }

    async function fetchplayers(){
      try{
        const fetchplayerdata= await client.models.Player.list();
        const fetchplayers=fetchplayerdata.data;
        console.log("=== プレイヤーデータの詳細確認 ===");
        console.log("全てのプレイヤー数:", fetchplayers.length);
        console.log("各プレイヤーの詳細:");
        fetchplayers.forEach((player, index) => {
          console.log(`  プレイヤー${index + 1}:`, {
            id: player.id,
            name: player.name,
            userId: player.userId
          });
        });
        console.log("=== プレイヤーデータ確認終了 ===");
        setPlayers(fetchplayers);
      }catch (error) {
        console.error("プレイヤーの取得に失敗しました", error);
      }
    }
    fetchplayers();
  }, [user]);

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
                    <span className="flex-1">{score.name}</span>
                    <span className="w-20 text-right">{score.score}点</span>
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