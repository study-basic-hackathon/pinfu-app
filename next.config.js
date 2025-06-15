/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tailwind CSSをビルドに含めるための設定
  webpack: (config) => {
    // デフォルト設定を保持
    return config;
  },
  // その他の設定
  reactStrictMode: true,
  // 本番用に設定したい場合は以下を追加
  // swcMinify: true,
}

module.exports = nextConfig
