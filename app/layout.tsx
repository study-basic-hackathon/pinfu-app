import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthenticatorWrapper from "./components/AuthenticatorWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "麻雀スコア管理アプリ",
  description: "麻雀のスコアを簡単に記録・管理できるアプリです",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-screen`}>
        <AuthenticatorWrapper>
          {children}
        </AuthenticatorWrapper>
      </body>
    </html>
  );
}
