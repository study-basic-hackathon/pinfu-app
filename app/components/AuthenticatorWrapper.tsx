"use client";

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { setupJapaneseTranslations } from '../utils/i18n';
import { authFormFields } from '../utils/auth';

// 日本語翻訳を設定
setupJapaneseTranslations();

export default function AuthenticatorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator
      signUpAttributes={['nickname']}
      loginMechanisms={['email']}
      formFields={authFormFields}
    >
      {children}
    </Authenticator>
  );
} 