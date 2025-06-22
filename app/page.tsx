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
import { ensurePlayerExists, getPlayerByUserId } from "./utils/playerUtils";
import Image from "next/image";

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
        
        // まず既存のプレイヤー情報を取得を試行
        let player = await getPlayerByUserId(userId);
        
        // プレイヤー情報が存在しない場合は作成
        if (!player) {
          console.log('プレイヤー情報が見つからないため、新規作成します...');
          const playerId = await ensurePlayerExists();
          if (playerId) {
            // 作成後に再度取得
            player = await getPlayerByUserId(userId);
          }
        }
        
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* ロゴとブランディング */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <Image
              src="/app_logo.svg"
              alt="平和ロゴ"
              width={400}
              height={500}
              className="w-auto h-64 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem]"
              priority
            />
          </div>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto rounded-full"></div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                ようこそ！
              </h2>
              
              {playerInfo ? (
                <div className="mb-8 text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
                    <p className="mb-2 text-lg">
                      <span className="font-medium text-gray-700">プレイヤー名:</span> 
                      <span className="ml-2 text-green-700 font-semibold">{playerInfo.name}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Player ID:</span> {playerInfo.id}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-center">
                    <p>プレイヤー情報の作成中です。しばらくお待ちください...</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/score/create" className="group">
                  <Button 
                    className="w-full h-16 text-lg font-medium bg-green-600 hover:bg-green-700 transition-all duration-200 group-hover:scale-105 shadow-md" 
                    disabled={!playerInfo}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📊</div>
                      <div>スコアを記録</div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/score" className="group">
                  <Button 
                    variant="outline" 
                    className="w-full h-16 text-lg font-medium border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group-hover:scale-105 shadow-md" 
                    disabled={!playerInfo}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📈</div>
                      <div>スコア履歴を見る</div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/chat" className="group">
                  <Button 
                    variant="outline" 
                    className="w-full h-16 text-lg font-medium border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group-hover:scale-105 shadow-md" 
                    disabled={!playerInfo}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">💬</div>
                      <div>チャットルーム</div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/player" className="group">
                  <Button 
                    variant="outline" 
                    className="w-full h-16 text-lg font-medium border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group-hover:scale-105 shadow-md" 
                    disabled={!playerInfo}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">👤</div>
                      <div>プレイヤー情報</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
