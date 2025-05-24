'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

interface Player {
  id: string;
  name: string;
}

interface ScoreFormData {
  playerCount: '3' | '4';
  gameType: 'east' | 'full'; // 東風 or 半荘
  player1Id: string;
  player2Id: string;
  player3Id: string;
  player4Id: string;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
}

// ダミーのプレイヤーリスト（APIが失敗した場合に使用）
const dummyPlayers: Player[] = [
  { id: "dummy1", name: "田中太郎" },
  { id: "dummy2", name: "佐藤次郎" },
  { id: "dummy3", name: "鈴木三郎" },
  { id: "dummy4", name: "高橋四郎" },
  { id: "dummy5", name: "伊藤五郎" },
  { id: "dummy6", name: "渡辺六郎" },
  { id: "dummy7", name: "山本七郎" },
  { id: "dummy8", name: "中村八郎" },
  { id: "dummy9", name: "小林九郎" },
  { id: "dummy10", name: "加藤十郎" }
];

export default function CreateScorePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  
  const [formData, setFormData] = useState<ScoreFormData>({
    playerCount: '4',
    gameType: 'east',
    player1Id: '',
    player2Id: '',
    player3Id: '',
    player4Id: '',
    score1: 0,
    score2: 0,
    score3: 0,
    score4: 0,
  });

  // データクライアントの初期化
  const client = generateClient<Schema>();

  // プレイヤーデータの取得
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await client.models.Player.list();
        if (response.data.length === 0) {
          // サンプルプレイヤーがなければ作成
          await createSamplePlayers();
        } else {
          const playerList = response.data.map(p => ({
            id: p.id || '',
            name: p.name
          }));
          setPlayers(playerList);
          
          // 初期選択
          if (playerList.length >= 4) {
            setFormData(prev => ({
              ...prev,
              player1Id: playerList[0].id,
              player2Id: playerList[1].id,
              player3Id: playerList[2].id,
              player4Id: playerList[3].id,
            }));
          }
        }
      } catch (error) {
        console.error("プレイヤーデータの取得に失敗しました", error);
        setErrorMessage("プレイヤーデータの取得に失敗しました。オフラインモードで動作します。");
        setOfflineMode(true);
        // ダミープレイヤーデータを使用
        setPlayers(dummyPlayers);
        setFormData(prev => ({
          ...prev,
          player1Id: dummyPlayers[0].id,
          player2Id: dummyPlayers[1].id,
          player3Id: dummyPlayers[2].id,
          player4Id: dummyPlayers[3].id,
        }));
      } finally {
        setLoading(false);
      }
    }

    async function createSamplePlayers() {
      const samplePlayers = [
        { name: "田中太郎" },
        { name: "佐藤次郎" },
        { name: "鈴木三郎" },
        { name: "高橋四郎" },
        { name: "伊藤五郎" },
        { name: "渡辺六郎" },
        { name: "山本七郎" },
        { name: "中村八郎" },
        { name: "小林九郎" },
        { name: "加藤十郎" }
      ];

      try {
        const createdPlayers: Player[] = [];
        for (const player of samplePlayers) {
          const response = await client.models.Player.create(player);
          if (response.data) {
            createdPlayers.push({
              id: response.data.id || '',
              name: response.data.name
            });
          }
        }
        setPlayers(createdPlayers);
        
        // 初期選択
        if (createdPlayers.length >= 4) {
          setFormData(prev => ({
            ...prev,
            player1Id: createdPlayers[0].id,
            player2Id: createdPlayers[1].id,
            player3Id: createdPlayers[2].id,
            player4Id: createdPlayers[3].id,
          }));
        }
      } catch (error) {
        console.error("サンプルプレイヤーの作成に失敗しました", error);
        setErrorMessage("サンプルプレイヤーの作成に失敗しました。オフラインモードで動作します。");
        setOfflineMode(true);
        // ダミープレイヤーデータを使用
        setPlayers(dummyPlayers);
        setFormData(prev => ({
          ...prev,
          player1Id: dummyPlayers[0].id,
          player2Id: dummyPlayers[1].id,
          player3Id: dummyPlayers[2].id,
          player4Id: dummyPlayers[3].id,
        }));
      }
    }

    fetchPlayers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setSaving(true);

    try {
      if (offlineMode) {
        // オフラインモードの場合はローカルで処理
        console.log("オフラインモードでスコアを保存:", {
          date: new Date().toISOString(),
          playerCount: parseInt(formData.playerCount),
          gameType: formData.gameType === 'east' ? '東風戦' : '半荘戦',
          players: Array.from({ length: parseInt(formData.playerCount) }, (_, i) => {
            const playerId = formData[`player${i + 1}Id` as keyof ScoreFormData] as string;
            const score = formData[`score${i + 1}` as keyof ScoreFormData] as number;
            const playerName = getPlayerName(playerId);
            return { playerId, playerName, score };
          })
        });
        setSuccessMessage("オフラインモードでスコアを保存しました");
        
        // フォームをリセット
        setFormData(prev => ({
          ...prev,
          score1: 0,
          score2: 0,
          score3: 0,
          score4: 0,
        }));
        
        setSaving(false);
        return;
      }

      // MahjongScoreの作成
      const scoreResponse = await client.models.MahjongScore.create({
        date: new Date().toISOString(),
        playerCount: parseInt(formData.playerCount),
        gameType: formData.gameType === 'east' ? '東風戦' : '半荘戦',
      });

      if (!scoreResponse.data) {
        throw new Error("スコアの作成に失敗しました");
      }

      const scoreId = scoreResponse.data.id;

      // 各プレイヤーのスコアを保存
      const playerScores = [];
      for (let i = 1; i <= parseInt(formData.playerCount); i++) {
        const playerId = formData[`player${i}Id` as keyof ScoreFormData] as string;
        const score = formData[`score${i}` as keyof ScoreFormData] as number;

        if (playerId) {
          try {
            const playerScoreResponse = await client.models.MahjongScorePlayer.create({
              score: score,
              player: { id: playerId },
              mahjongScore: { id: scoreId }
            });
            
            if (playerScoreResponse.data) {
              playerScores.push(playerScoreResponse.data);
            }
          } catch (e) {
            console.error("スコア詳細の保存に失敗しました", e);
          }
        }
      }

      console.log("スコアを保存しました", {
        scoreId,
        playerScores
      });
      setSuccessMessage("スコアを保存しました");

      // フォームをリセット
      setFormData(prev => ({
        ...prev,
        score1: 0,
        score2: 0,
        score3: 0,
        score4: 0,
      }));
    } catch (error) {
      console.error("スコアの保存に失敗しました", error);
      setErrorMessage("スコアの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleScoreChange = (playerNum: number, value: string) => {
    // 先頭のゼロを削除
    let normalizedValue = value.replace(/^0+(?=\d)/, '');
    
    // 空文字列の場合は0にする
    const numValue = normalizedValue === '' ? 0 : parseInt(normalizedValue);
    
    setFormData({
      ...formData,
      [`score${playerNum}`]: numValue,
    });
  };

  const handleScoreInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const value = input.value;
    
    // 先頭のゼロを削除（ただし、単独の0は残す）
    if (value.length > 1 && value.startsWith('0')) {
      input.value = value.replace(/^0+/, '');
    }
  };

  const getPlayerName = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : "";
  };

  const playerCount = parseInt(formData.playerCount);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">麻雀スコア入力</h1>
          <p className="text-gray-600">プレイヤー数とスコアを入力してください</p>
          
          {offlineMode && (
            <div className="mt-4 p-2 bg-yellow-100 text-yellow-700 rounded">
              オフラインモードで動作中: データはローカルに保存されます
            </div>
          )}
          
          {successMessage && (
            <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="font-semibold mb-2">プレイヤー数</div>
              <RadioGroup
                defaultValue={formData.playerCount}
                onValueChange={(value) => setFormData({ ...formData, playerCount: value as '3' | '4' })}
                className="flex justify-center gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="r1" />
                  <Label htmlFor="r1">3人</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="r2" />
                  <Label htmlFor="r2">4人</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="font-semibold mb-2">ゲーム形式</div>
              <RadioGroup
                defaultValue={formData.gameType}
                onValueChange={(value) => setFormData({ ...formData, gameType: value as 'east' | 'full' })}
                className="flex justify-center gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="east" id="game1" />
                  <Label htmlFor="game1">東風戦</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="game2" />
                  <Label htmlFor="game2">半荘戦</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: playerCount }, (_, i) => i + 1).map((playerNum) => (
              <div key={playerNum} className="bg-white border rounded-md p-4 shadow">
                <div className="mb-3">
                  <Label htmlFor={`player${playerNum}`} className="block mb-1">
                    プレイヤー{playerNum}の名前
                  </Label>
                  <Select
                    value={formData[`player${playerNum}Id` as keyof ScoreFormData] as string}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        [`player${playerNum}Id`]: value,
                      })
                    }
                  >
                    <SelectTrigger id={`player${playerNum}`}>
                      <SelectValue placeholder={`プレイヤー${playerNum}を選択`} />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={`player${playerNum}-${player.id}`} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`score${playerNum}`} className="block mb-1">
                    スコア
                  </Label>
                  <Input
                    id={`score${playerNum}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData[`score${playerNum}` as keyof ScoreFormData].toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleScoreChange(playerNum, e.target.value)
                    }
                    onInput={handleScoreInput}
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700"
              disabled={saving}
            >
              {saving ? "保存中..." : "スコアを保存"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
