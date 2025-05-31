import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// DynamoDB クライアントの初期化
const client = new DynamoDBClient({ region: process.env.REGION || 'ap-northeast-1' });
const documentClient = DynamoDBDocumentClient.from(client);

/**
 * Cognitoポスト確認Lambda関数
 * ユーザーがメール確認後に呼び出され、プレイヤー情報をDynamoDBに保存します
 * 
 * @param {Object} event - Cognito Trigger イベント
 * @param {Object} context - Lambda コンテキスト
 * @returns {Object} - Cognito イベントオブジェクト
 */
export const handler = async (event: any, context: any) => {
  console.log('Post confirmation event:', JSON.stringify(event, null, 2));

  try {
    // ユーザー情報を取得
    const { userPoolId, userName } = event;
    const { nickname } = event.request.userAttributes;

    // テーブル名を取得（環境によって異なる可能性があります）
    // テーブル名の形式は「Player-環境識別子」となっていることが多いです
    // 完全なテーブル名が分からない場合は、環境変数から取得するか、ListTablesを使用して確認する方法もあります
    const tablePrefix = 'Player-';
    
    // DynamoDBにプレイヤー情報を保存
    const params = {
      TableName: `${tablePrefix}${process.env.API_ENV || 'dev'}`,
      Item: {
        // 重要: 実際のテーブル構造に合わせて調整してください
        id: userName, // Cognito User IDをプレイヤーIDとして使用
        name: nickname || 'デフォルトプレイヤー名', // ニックネームをプレイヤー名として使用
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __typename: 'Player', // GraphQLスキーマのタイプ名
      },
    };

    console.log('Saving player data:', JSON.stringify(params, null, 2));
    
    // DynamoDBにデータを保存
    await documentClient.send(new PutCommand(params));
    
    console.log('Successfully saved player data');
    
    // イベントを返す（変更なし）
    return event;
  } catch (error) {
    console.error('Error saving player data:', error);
    // エラーが発生しても認証プロセスは続行させる
    return event;
  }
}; 