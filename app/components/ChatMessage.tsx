"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageSquare, Send, Trash2 } from "lucide-react";

const client = generateClient<Schema>();

type ChatMessageProps = {
  message: Schema["ChatMessage"]["type"];
  currentPlayerId: string;
  playerName?: string;
};

// ツールチップコンポーネント
function LikeTooltip({ 
  likedUsers, 
  children, 
  isVisible 
}: { 
  likedUsers: string[], 
  children: React.ReactNode,
  isVisible: boolean 
}) {
  if (!isVisible || likedUsers.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 min-w-48">
        <div className="max-w-md break-words">
          {likedUsers.length === 1 
            ? `${likedUsers[0]}がいいねしました`
            : `${likedUsers.slice(0, 10).join(', ')}${likedUsers.length > 10 ? ` 他${likedUsers.length - 10}人` : ''}がいいねしました`
          }
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}

export default function ChatMessageComponent({ message, currentPlayerId, playerName: propPlayerName }: ChatMessageProps) {
  const [playerName, setPlayerName] = useState<string>(propPlayerName || "読み込み中...");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<Schema["ChatReply"]["type"][]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);

  // プロップで渡されたプレイヤー名があれば使用、なければ取得
  useEffect(() => {
    if (propPlayerName && propPlayerName !== "読み込み中...") {
      setPlayerName(propPlayerName);
      return;
    }

    async function fetchPlayerName() {
      try {
        const playerResponse = await client.models.Player.get({
          id: message.playerId,
        });
        if (playerResponse && playerResponse.data) {
          setPlayerName(playerResponse.data.name);
        } else {
          setPlayerName("名前不明");
        }
      } catch (error) {
        console.error("プレイヤー情報の取得に失敗しました:", error);
        setPlayerName("名前取得エラー");
      }
    }

    fetchPlayerName();
  }, [message.playerId, propPlayerName]);

  // リプライとイイねの数を取得
  useEffect(() => {
    async function fetchRepliesAndLikes() {
      try {
        // リプライを取得
        const repliesResponse = await client.models.ChatReply.list({
          filter: {
            chatMessageId: {
              eq: message.id
            }
          }
        });
        
        // 日付順にソート
        const sortedReplies = [...repliesResponse.data].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setReplies(sortedReplies);

        // いいねの数を取得
        const likesResponse = await client.models.ChatLike.list({
          filter: {
            chatMessageId: {
              eq: message.id
            }
          }
        });
        setLikesCount(likesResponse.data.length);

        // 現在のユーザーがいいねしているか確認
        const userLike = likesResponse.data.find(like => like.playerId === currentPlayerId);
        setHasLiked(!!userLike);

        // いいねしたユーザーの名前を取得
        const userNames = await Promise.all(
          likesResponse.data.map(async (like) => {
            try {
              const playerResponse = await client.models.Player.get({
                id: like.playerId,
              });
              return playerResponse?.data?.name || "名前不明";
            } catch (error) {
              console.error("プレイヤー名の取得に失敗:", error);
              return "名前不明";
            }
          })
        );
        setLikedUsers(userNames);
      } catch (error) {
        console.error("リプライといいねの取得に失敗しました:", error);
      }
    }

    fetchRepliesAndLikes();

    // リアルタイム更新用のサブスクリプション
    const repliesSubscription = client.models.ChatReply.observeQuery({
      filter: {
        chatMessageId: {
          eq: message.id
        }
      }
    }).subscribe({
      next: ({ items }) => {
        // 日付順にソート
        const sortedItems = [...items].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setReplies(sortedItems);
      },
    });

    const likesSubscription = client.models.ChatLike.observeQuery({
      filter: {
        chatMessageId: {
          eq: message.id
        }
      }
    }).subscribe({
      next: async ({ items }) => {
        setLikesCount(items.length);
        const userLike = items.find(like => like.playerId === currentPlayerId);
        setHasLiked(!!userLike);

        // いいねしたユーザーの名前を取得
        const userNames = await Promise.all(
          items.map(async (like) => {
            try {
              const playerResponse = await client.models.Player.get({
                id: like.playerId,
              });
              return playerResponse?.data?.name || "名前不明";
            } catch (error) {
              console.error("プレイヤー名の取得に失敗:", error);
              return "名前不明";
            }
          })
        );
        setLikedUsers(userNames);
      },
    });

    return () => {
      repliesSubscription.unsubscribe();
      likesSubscription.unsubscribe();
    };
  }, [message.id, currentPlayerId]);

  // リプライを送信
  const sendReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await client.models.ChatReply.create({
        content: replyContent,
        chatMessageId: message.id,
        playerId: currentPlayerId,
        createdAt: new Date().toISOString(),
      });
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("リプライの送信に失敗しました:", error);
    }
  };

  // いいねを追加/削除
  const toggleLike = async () => {
    try {
      if (hasLiked) {
        // いいねを検索して削除
        const likesResponse = await client.models.ChatLike.list({
          filter: {
            and: [
              {
                chatMessageId: {
                  eq: message.id
                }
              },
              {
                playerId: {
                  eq: currentPlayerId
                }
              }
            ]
          }
        });
        
        if (likesResponse.data.length > 0) {
          await client.models.ChatLike.delete({
            id: likesResponse.data[0].id,
          });
        }
      } else {
        // いいねを追加
        await client.models.ChatLike.create({
          chatMessageId: message.id,
          chatReplyId: null,
          playerId: currentPlayerId,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("いいねの処理に失敗しました:", error);
    }
  };

  // メッセージを削除
  const deleteMessage = async () => {
    if (!confirm("このメッセージを削除しますか？")) return;
    
    try {
      await client.models.ChatMessage.delete({
        id: message.id,
      });
    } catch (error) {
      console.error("メッセージの削除に失敗しました:", error);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <div className="font-semibold">{playerName}</div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            {new Date(message.createdAt).toLocaleString()}
          </div>
          {message.playerId === currentPlayerId && (
            <button
              onClick={deleteMessage}
              className="text-red-500 hover:text-red-700 p-1"
              title="メッセージを削除"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="my-2">{message.content}</div>
      <div className="flex items-center space-x-4 mt-2">
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)} 
          className="flex items-center space-x-1 text-gray-500"
        >
          <MessageSquare size={16} />
          <span>{replies.length}</span>
        </button>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleLike}
            className={`flex items-center space-x-1 ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Heart size={16} className={hasLiked ? 'fill-red-500' : ''} />
            <span>{likesCount}</span>
          </button>
          {likedUsers.length > 0 && (
            <span className="text-xs text-gray-500 max-w-48 truncate">
              {likedUsers.length === 1 
                ? `${likedUsers[0]}がいいね`
                : `${likedUsers.join(', ')}がいいね`
              }
            </span>
          )}
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-3 flex space-x-2">
          <Input
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="リプライを入力..."
            className="flex-grow"
            onKeyDown={(e) => e.key === "Enter" && sendReply()}
          />
          <Button onClick={sendReply} size="sm">
            <Send size={16} />
          </Button>
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-4 space-y-3">
          <Separator />
          {replies.map((reply) => (
            <ReplyItem 
              key={reply.id} 
              reply={reply} 
              currentPlayerId={currentPlayerId} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// リプライコンポーネント
function ReplyItem({ reply, currentPlayerId }: { 
  reply: Schema["ChatReply"]["type"], 
  currentPlayerId: string 
}) {
  const [playerName, setPlayerName] = useState<string>("名前不明");
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);

  // プレイヤー名を取得
  useEffect(() => {
    async function fetchPlayerName() {
      try {
        const playerResponse = await client.models.Player.get({
          id: reply.playerId,
        });
        if (playerResponse && playerResponse.data) {
          setPlayerName(playerResponse.data.name);
        }
      } catch (error) {
        console.error("プレイヤー情報の取得に失敗しました:", error);
      }
    }

    fetchPlayerName();
  }, [reply.playerId]);

  // いいねの数を取得
  useEffect(() => {
    async function fetchLikes() {
      try {
        const likesResponse = await client.models.ChatLike.list({
          filter: {
            chatReplyId: {
              eq: reply.id
            }
          }
        });
        setLikesCount(likesResponse.data.length);

        // 現在のユーザーがいいねしているか確認
        const userLike = likesResponse.data.find(like => like.playerId === currentPlayerId);
        setHasLiked(!!userLike);

        // いいねしたユーザーの名前を取得
        const userNames = await Promise.all(
          likesResponse.data.map(async (like) => {
            try {
              const playerResponse = await client.models.Player.get({
                id: like.playerId,
              });
              return playerResponse?.data?.name || "名前不明";
            } catch (error) {
              console.error("プレイヤー名の取得に失敗:", error);
              return "名前不明";
            }
          })
        );
        setLikedUsers(userNames);
      } catch (error) {
        console.error("いいねの取得に失敗しました:", error);
      }
    }

    fetchLikes();

    // リアルタイム更新用のサブスクリプション
    const likesSubscription = client.models.ChatLike.observeQuery({
      filter: {
        chatReplyId: {
          eq: reply.id
        }
      }
    }).subscribe({
      next: async ({ items }) => {
        setLikesCount(items.length);
        const userLike = items.find(like => like.playerId === currentPlayerId);
        setHasLiked(!!userLike);

        // いいねしたユーザーの名前を取得
        const userNames = await Promise.all(
          items.map(async (like) => {
            try {
              const playerResponse = await client.models.Player.get({
                id: like.playerId,
              });
              return playerResponse?.data?.name || "名前不明";
            } catch (error) {
              console.error("プレイヤー名の取得に失敗:", error);
              return "名前不明";
            }
          })
        );
        setLikedUsers(userNames);
      },
    });

    return () => likesSubscription.unsubscribe();
  }, [reply.id, currentPlayerId]);

  // いいねを追加/削除
  const toggleLike = async () => {
    try {
      if (hasLiked) {
        // いいねを検索して削除
        const likesResponse = await client.models.ChatLike.list({
          filter: {
            and: [
              {
                chatReplyId: {
                  eq: reply.id
                }
              },
              {
                playerId: {
                  eq: currentPlayerId
                }
              }
            ]
          }
        });
        
        if (likesResponse.data.length > 0) {
          await client.models.ChatLike.delete({
            id: likesResponse.data[0].id,
          });
        }
      } else {
        // いいねを追加
        await client.models.ChatLike.create({
          chatMessageId: null,
          chatReplyId: reply.id,
          playerId: currentPlayerId,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("いいねの処理に失敗しました:", error);
    }
  };

  // 返信を削除
  const deleteReply = async () => {
    if (!confirm("この返信を削除しますか？")) return;
    
    try {
      await client.models.ChatReply.delete({
        id: reply.id,
      });
    } catch (error) {
      console.error("返信の削除に失敗しました:", error);
    }
  };

  return (
    <div className="ml-6 bg-gray-100 p-3 rounded">
      <div className="flex justify-between items-center">
        <div className="font-medium text-sm">{playerName}</div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            {new Date(reply.createdAt).toLocaleString()}
          </div>
          {reply.playerId === currentPlayerId && (
            <button
              onClick={deleteReply}
              className="text-red-500 hover:text-red-700 p-1"
              title="返信を削除"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="my-1 text-sm">{reply.content}</div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={toggleLike}
          className={`flex items-center space-x-1 text-xs ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}
        >
          <Heart size={14} className={hasLiked ? 'fill-red-500' : ''} />
          <span>{likesCount}</span>
        </button>
        {likedUsers.length > 0 && (
          <span className="text-xs text-gray-500 max-w-32 truncate">
            {likedUsers.length === 1 
              ? `${likedUsers[0]}がいいね`
              : `${likedUsers.join(', ')}がいいね`
            }
          </span>
        )}
      </div>
    </div>
  );
} 