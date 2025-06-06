import { defineFunction } from '@aws-amplify/backend';

// Amplify Gen2方式でポスト確認Lambda関数を定義
export const postConfirmationFunction = defineFunction({
  name: 'postConfirmation',
  entry: './handler.ts',
});

// デフォルトエクスポートとしても提供（両方のインポート方法をサポート）
export default postConfirmationFunction; 