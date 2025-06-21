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
    console.log(`getPlayerByUserId: 検索開始 - userId: ${userId}`);
    
    // フィルター検索
    const players = await client.models.Player.list({
      filter: { userId: { eq: userId } }
    });

    console.log(`getPlayerByUserId: フィルター結果 - 件数: ${players.data?.length || 0}`);
    console.log(`getPlayerByUserId: 取得データ:`, players.data);

    // 全プレイヤー取得して手動検索（デバッグ用）
    const allPlayers = await client.models.Player.list();
    console.log(`getPlayerByUserId: 全プレイヤー数: ${allPlayers.data?.length || 0}`);
    const manualFind = allPlayers.data?.find(p => p.userId === userId);
    console.log(`getPlayerByUserId: 手動検索結果:`, manualFind);

    const result = players.data?.[0] || null;
    console.log(`getPlayerByUserId: 最終結果:`, result);

    return result;
  } catch (error) {
    console.error('プレイヤー取得エラー:', error);
    return null;
  }
}

/**
 * 指定したユーザーIDのプレイヤー情報を取得（存在しない場合は作成）
 */
export async function getOrCreatePlayerByUserId(userId: string) {
  try {
    console.log(`getOrCreatePlayerByUserId: 検索開始 - userId: ${userId}`);
    
    // まず既存のプレイヤーを検索
    let player = await getPlayerByUserId(userId);
    
    if (player) {
      console.log(`getOrCreatePlayerByUserId: 既存プレイヤー見つかりました:`, player);
      return player;
    }
    
    // 存在しない場合は新規作成
    console.log(`getOrCreatePlayerByUserId: プレイヤーが見つからないため新規作成します - userId: ${userId}`);
    
    const newPlayer = await client.models.Player.create({
      name: `プレイヤー (${userId.substring(0, 8)})`, // userIdの最初の8文字を使用
      userId: userId,
    });

    if (newPlayer.data) {
      console.log('新しいプレイヤーを作成しました:', newPlayer.data);
      return newPlayer.data;
    }

    console.log('プレイヤーの作成に失敗しました');
    return null;
  } catch (error) {
    console.error('プレイヤー取得/作成エラー:', error);
    return null;
  }
}

/**
 * 指定したプレイヤーIDのプレイヤー情報を取得
 */
export async function getPlayerById(playerId: string) {
  try {
    console.log(`getPlayerById: 検索開始 - playerId: ${playerId}`);
    
    const player = await client.models.Player.get({ id: playerId });
    
    console.log(`getPlayerById: 取得結果:`, player.data);
    
    return player.data || null;
  } catch (error) {
    console.error('プレイヤー取得エラー (by ID):', error);
    return null;
  }
} 