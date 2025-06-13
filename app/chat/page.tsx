"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import ChatMessageComponent from "@/app/components/ChatMessage";
import { ensurePlayerExists, getPlayerByUserId } from "../utils/playerUtils";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function ChatPage() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [playerInfo, setPlayerInfo] = useState<Schema["Player"]["type"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<Schema["ChatMessage"]["type"][]>([]);

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

  // メッセージを取得
  useEffect(() => {
    async function fetchMessages() {
      try {
        const messagesResponse = await client.models.ChatMessage.list();
        // クライアントサイドでソート（最新順）
        const sortedMessages = messagesResponse.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setMessages(sortedMessages);
      } catch (error) {
        console.error("メッセージの取得に失敗しました:", error);
      }
    }

    fetchMessages();
    
    // リアルタイム更新用のサブスクリプション
    const subscription = client.models.ChatMessage.observeQuery().subscribe({
      next: ({ items }) => {
        // リアルタイムデータもクライアントサイドでソート
        const sortedItems = items.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setMessages(sortedItems);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  // メッセージを送信
  const sendMessage = async () => {
    if (!messageContent.trim() || !playerInfo) return;

    try {
      await client.models.ChatMessage.create({
        content: messageContent,
        playerId: playerInfo.id,
        createdAt: new Date().toISOString(),
      });
      setMessageContent("");
    } catch (error) {
      console.error("メッセージの送信に失敗しました:", error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">チャット</h1>
        <div className="flex space-x-4">
          <Link href="/">
            <Button variant="outline">ホームに戻る</Button>
          </Link>
          <Button onClick={signOut} variant="outline">ログアウト</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {playerInfo ? (
            <div className="flex flex-col h-[calc(100vh-250px)]">
              <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                {messages.map((message) => (
                  <ChatMessageComponent 
                    key={message.id} 
                    message={message} 
                    currentPlayerId={playerInfo.id} 
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="flex-grow"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage}>送信</Button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <p>プレイヤー情報の作成中です。しばらくお待ちください...</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
} 