"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerByUserId, ensurePlayerExists } from "../utils/playerUtils";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function PlayerPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [playerInfo, setPlayerInfo] = useState<Schema["Player"]["type"] | null>(null);
  const [userAttributes, setUserAttributes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ユーザー情報とプレイヤー情報の取得
  useEffect(() => {
    async function fetchUserAndPlayerInfo() {
      try {
        setLoading(true);
        
        // 現在のユーザー情報を取得
        const currentUser = await getCurrentUser();
        const userId = currentUser.userId;
        
        // ユーザー属性を取得
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes as Record<string, string>);
        
        // プレイヤー情報を取得または作成
        let player = await getPlayerByUserId(userId);
        if (!player) {
          console.log('プレイヤー情報が見つからないため、新規作成します...');
          const playerId = await ensurePlayerExists();
          if (playerId) {
            player = await getPlayerByUserId(userId);
          }
        }
        
        setPlayerInfo(player);
        if (player) {
          setEditName(player.name);
        }
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
        setErrorMessage("ユーザー情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchUserAndPlayerInfo();
    }
  }, [user]);

  // 名前を更新
  const updatePlayerName = async () => {
    if (!playerInfo || !editName.trim()) return;
    
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      const response = await client.models.Player.update({
        id: playerInfo.id,
        name: editName.trim(),
      });
      
      if (response.data) {
        setPlayerInfo(response.data);
        setEditing(false);
        setSuccessMessage("プレイヤー名を更新しました");
      } else {
        throw new Error("更新に失敗しました");
      }
    } catch (error) {
      console.error("プレイヤー名の更新に失敗しました:", error);
      setErrorMessage("プレイヤー名の更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditing(false);
    if (playerInfo) {
      setEditName(playerInfo.name);
    }
    setSuccessMessage("");
    setErrorMessage("");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>データを読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">プレイヤー情報</h1>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">プロフィール</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* 成功・エラーメッセージ */}
            {successMessage && (
              <div className="p-3 bg-green-100 text-green-700 rounded">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="p-3 bg-red-100 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            {/* ユーザーID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ユーザーID
              </label>
              <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                {user?.userId || "取得中..."}
              </div>
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                {userAttributes.email || "取得中..."}
              </div>
            </div>

            {/* プレイヤー名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                プレイヤー名
              </label>
              {editing ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="プレイヤー名を入力"
                    disabled={saving}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={updatePlayerName} 
                      disabled={saving || !editName.trim()}
                      size="sm"
                    >
                      {saving ? "保存中..." : "保存"}
                    </Button>
                    <Button 
                      onClick={cancelEdit} 
                      variant="outline" 
                      disabled={saving}
                      size="sm"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    {playerInfo?.name || "未設定"}
                  </span>
                  <Button 
                    onClick={() => setEditing(true)} 
                    variant="outline" 
                    size="sm"
                  >
                    編集
                  </Button>
                </div>
              )}
            </div>

            {/* ニックネーム（カスタム属性） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ニックネーム（Cognito）
              </label>
              <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                {userAttributes['custom:nickname'] || "未設定"}
              </div>
            </div>

            {/* 作成日 */}
            {playerInfo?.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  登録日
                </label>
                <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                  {new Date(playerInfo.createdAt).toLocaleDateString('ja-JP')}
                </div>
              </div>
                         )}
           </div>
         </div>
      </div>
    </main>
  );
} 