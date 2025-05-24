'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface ScoreFormData {
  playerCount: '3' | '4';
  player1: string;
  player2: string;
  player3: string;
  player4: string;
  score1: number;
  score2: number;
  score3: number;
  score4: number;
}

export default function CreateScorePage() {
  const [formData, setFormData] = useState<ScoreFormData>({
    playerCount: '4',
    player1: '',
    player2: '',
    player3: '',
    player4: '',
    score1: 0,
    score2: 0,
    score3: 0,
    score4: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: スコアの保存処理を実装
    console.log(formData);
  };

  const playerCount = parseInt(formData.playerCount);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">麻雀スコア入力</h1>
          <p className="text-gray-600">プレイヤー数とスコアを入力してください</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: playerCount }, (_, i) => i + 1).map((playerNum) => (
              <div key={playerNum} className="bg-white border rounded-md p-4 shadow">
                <div className="mb-3">
                  <Label htmlFor={`player${playerNum}`} className="block mb-1">
                    プレイヤー{playerNum}の名前
                  </Label>
                  <Input
                    id={`player${playerNum}`}
                    type="text"
                    value={formData[`player${playerNum}` as keyof ScoreFormData] as string}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        [`player${playerNum}`]: e.target.value,
                      })
                    }
                    placeholder={`プレイヤー${playerNum}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`score${playerNum}`} className="block mb-1">
                    スコア
                  </Label>
                  <Input
                    id={`score${playerNum}`}
                    type="number"
                    value={formData[`score${playerNum}` as keyof ScoreFormData] as number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        [`score${playerNum}`]: parseInt(e.target.value) || 0,
                      })
                    }
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
            >
              スコアを保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
