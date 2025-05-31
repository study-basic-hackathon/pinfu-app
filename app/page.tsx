"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function Home() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [playerInfo, setPlayerInfo] = useState<Schema["Player"]["type"] | null>(null);
  const [loading, setLoading] = useState(true);

  // ユーザー情報の取得
  useEffect(() => {
    async function fetchCurrentPlayer() {
      try {
        setLoading(true);
        // 現在のユーザーIDを取得
        const currentUser = await getCurrentUser();
        const userId = currentUser.userId;
        
        // ユーザーIDを使ってプレイヤー情報を取得
        const response = await client.models.Player.get({
          id: userId
        });
        
        if (response) {
          // responseがnullでない場合にのみ設定
          setPlayerInfo(response.data);
        }
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">麻雀スコア管理アプリ</h1>
        <Button onClick={signOut} variant="outline">ログアウト</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">ようこそ！</h2>
          
          {playerInfo ? (
            <div className="mb-6">
              <p className="mb-2">
                <span className="font-medium">プレイヤー名:</span> {playerInfo.name}
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <p>プレイヤー情報が見つかりませんでした。</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Link href="/score/create">
              <Button className="w-full">新しいスコアを記録</Button>
            </Link>
            <Link href="/score">
              <Button variant="outline" className="w-full">スコア履歴を見る</Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
