import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

/**
 * 現在のユーザーのプレイヤー情報をチェックし、存在しない場合は作成する
 */
export async function ensurePlayerExists(): Promise<string | null> {
  try {
    // 現在のユーザー情報を取得
    const user = await getCurrentUser();
    const userId = user.userId;
    
    // カスタム属性からニックネームを取得
    const userAttributes = await fetchUserAttributes();
    const nickname = userAttributes['custom:nickname'] || 
                    user.signInDetails?.loginId || 
                    'プレイヤー';

    // 既存のプレイヤー情報をチェック
    const existingPlayers = await client.models.Player.list({
      filter: { userId: { eq: userId } }
    });

    if (existingPlayers.data && existingPlayers.data.length > 0) {
      // 既にプレイヤー情報が存在する場合
      return existingPlayers.data[0].id;
    }

    // プレイヤー情報が存在しない場合、新規作成
    const newPlayer = await client.models.Player.create({
      name: nickname,
      userId: userId,
    });

    if (newPlayer.data) {
      console.log('新しいプレイヤーを作成しました:', newPlayer.data);
      return newPlayer.data.id;
    }

    return null;
  } catch (error) {
    console.error('プレイヤー作成エラー:', error);
    return null;
  }
}

/**
 * 指定したユーザーIDのプレイヤー情報を取得
 */
export async function getPlayerByUserId(userId: string) {
  try {
    const players = await client.models.Player.list({
      filter: { userId: { eq: userId } }
    });

    return players.data?.[0] || null;
  } catch (error) {
    console.error('プレイヤー取得エラー:', error);
    return null;
  }
} 