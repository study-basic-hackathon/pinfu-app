"use client";

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { setupJapaneseTranslations } from '../utils/i18n';
import { authFormFields } from '../utils/auth';
import { ensurePlayerExists } from '../utils/playerUtils';
import { useEffect, useState } from 'react';
import { Hub } from 'aws-amplify/utils';

// 日本語翻訳を設定
setupJapaneseTranslations();

export default function AuthenticatorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPlayerSetup, setIsPlayerSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 認証イベントを監視
    const unsubscribe = Hub.listen('auth', async ({ payload }) => {
      if (payload.event === 'signedIn') {
        setIsLoading(true);
        try {
          // プレイヤー情報を作成または確認
          const playerId = await ensurePlayerExists();
          if (playerId) {
            setIsPlayerSetup(true);
            console.log('プレイヤー設定完了:', playerId);
          }
        } catch (error) {
          console.error('プレイヤー設定エラー:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (payload.event === 'signedOut') {
        setIsPlayerSetup(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Authenticator
      signUpAttributes={['nickname']}
      loginMechanisms={['email']}
      formFields={authFormFields}
    >
      {({ signOut, user }) => (
        <>
          {isLoading && (
            <div className="flex justify-center items-center p-4">
              <div className="text-lg">プレイヤー情報を設定中...</div>
            </div>
          )}
          {!isLoading && children}
        </>
      )}
    </Authenticator>
  );
} 