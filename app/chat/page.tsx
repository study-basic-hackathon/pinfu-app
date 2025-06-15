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
  const [sending, setSending] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    create: false,
    update: false,
    delete: false
  });

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
    
    // より確実なリアルタイム更新のための複数のSubscription
    const createSubscription = client.models.ChatMessage.onCreate().subscribe({
      next: async (newMessage) => {
        setSubscriptionStatus(prev => ({ ...prev, create: true }));
        
        // 新しいメッセージを既存のリストに追加（重複チェック）
        setMessages(prev => {
          // 既に存在するメッセージかチェック
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            return prev;
          }
          
          const updatedMessages = [newMessage, ...prev];
          return updatedMessages.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      },
      error: (error) => {
        console.error('onCreate subscription error:', error);
        setSubscriptionStatus(prev => ({ ...prev, create: false }));
      }
    });

    const updateSubscription = client.models.ChatMessage.onUpdate().subscribe({
      next: (updatedMessage) => {
        setSubscriptionStatus(prev => ({ ...prev, update: true }));
        setMessages(prev => 
          prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ).sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      },
      error: (error) => {
        console.error('onUpdate subscription error:', error);
        setSubscriptionStatus(prev => ({ ...prev, update: false }));
      }
    });

    const deleteSubscription = client.models.ChatMessage.onDelete().subscribe({
      next: (deletedMessage) => {
        setSubscriptionStatus(prev => ({ ...prev, delete: true }));
        setMessages(prev => 
          prev.filter(msg => msg.id !== deletedMessage.id)
        );
      },
      error: (error) => {
        console.error('onDelete subscription error:', error);
        setSubscriptionStatus(prev => ({ ...prev, delete: false }));
      }
    });

    // フォールバックとして定期的な更新も追加
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 30000); // 30秒ごとに更新

    return () => {
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  // メッセージリストを手動で更新（同期処理）
  const refreshMessages = async () => {
    try {
      const messagesResponse = await client.models.ChatMessage.list();
      const sortedMessages = messagesResponse.data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error("メッセージの再取得に失敗しました:", error);
    }
  };

  // メッセージを送信
  const sendMessage = async () => {
    if (!messageContent.trim() || !playerInfo || sending) {
      return;
    }

    setSending(true);
    
    // 送信するメッセージ内容を保存（クリア前に）
    const messageToSend = messageContent.trim();
    
    // 即座に入力フィールドをクリア（重複送信防止）
    setMessageContent("");
    
    try {
      await client.models.ChatMessage.create({
        content: messageToSend,
        playerId: playerInfo.id,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("メッセージの送信に失敗しました:", error);
      // 送信失敗時はメッセージを復元
      setMessageContent(messageToSend);
    } finally {
      setSending(false);
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
            <div className="flex flex-col h-[calc(100vh-300px)]">
              <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                {messages.map((message) => (
                  <ChatMessageComponent 
                    key={message.id} 
                    message={message} 
                    currentPlayerId={playerInfo.id}
                    playerName={message.playerId === playerInfo.id ? playerInfo.name : undefined}
                  />
                ))}
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault(); // フォーム送信を無効化
                }}
                className="flex space-x-2"
              >
                <Input
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="flex-grow"
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }}
                />
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    sendMessage();
                  }} 
                  disabled={sending || !messageContent.trim()}
                >
                  {sending ? "送信中..." : "送信"}
                </Button>
              </form>
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