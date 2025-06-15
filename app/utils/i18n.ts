import { I18n } from 'aws-amplify/utils';

/**
 * アプリケーションの日本語翻訳を設定します
 */
export const setupJapaneseTranslations = () => {
  I18n.putVocabularies({
    ja: {
      // 認証関連
      'Sign In': 'サインイン',
      'Sign Up': '新規登録',
      'Sign Out': 'サインアウト',
      'Email': 'メールアドレス',
      'Password': 'パスワード',
      'Confirm Password': 'パスワード（確認）',
      'Nickname': 'ニックネーム',
      'Enter your Email': 'メールアドレスを入力',
      'Enter your Password': 'パスワードを入力',
      'Please confirm your Password': 'パスワードを再入力',
      'Enter your Nickname': 'ニックネームを入力',
      'Forgot your password?': 'パスワードをお忘れですか？',
      'Reset Password': 'パスワードをリセット',
      'Confirm': '確認',
      'Back to Sign In': 'サインインに戻る',
      'Send Code': 'コードを送信',
      'Confirm Sign Up': '登録を確認',
      'Confirmation Code': '確認コード',
      'Enter your code': 'コードを入力してください',
      'Create Account': 'アカウント作成',
      'Have an account?': 'アカウントをお持ちですか？',
      'Forgot Password': 'パスワードをお忘れの方',
      'Reset your Password': 'パスワードをリセット',
      'No account?': 'アカウントをお持ちでない方',
      
      // エラーメッセージ
      'User does not exist': 'ユーザーが存在しません',
      'Incorrect username or password': 'メールアドレスまたはパスワードが正しくありません',
      'User is not confirmed': 'ユーザーが確認されていません',
      'User already exists': 'このメールアドレスは既に登録されています',
      'Invalid verification code provided': '無効な確認コードです',
      'Invalid password format': 'パスワード形式が無効です',
      
      // アプリケーション固有
      'Loading...': '読み込み中...',
      'Welcome': 'ようこそ',
      'Player Name': 'プレイヤー名',
      'Player Information': 'プレイヤー情報',
      'Create New Score': '新しいスコアを記録',
      'View Score History': 'スコア履歴を見る',
    }
  });
}; 