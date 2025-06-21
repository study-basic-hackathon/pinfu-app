/**
 * 認証フォームフィールドの設定
 * サインアップフォームでのフィールドの順序や表示をカスタマイズします
 */
export const authFormFields = {
  signUp: {
    nickname: {
      order: 1,
      label: 'プレイヤー名',
      placeholder: 'プレイヤー名を入力してください',
    },
    email: {
      order: 2,
    },
    password: {
      order: 3,
    },
    confirm_password: {
      order: 4,
      label: 'パスワード（確認）',
      placeholder: 'パスワードを再入力してください',
    },
  },
}; 