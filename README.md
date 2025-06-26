# DokodaPepper Frontend

https://dokodapepper.onrender.com -サーバーのプラン上読み込みに時間がかかることがあります。 -都道府県が選択できない時はページをリロードしてください。

位置情報を活用した投稿共有アプリ「DokodaPepper」のフロントエンドリポジトリです。React（TypeScript）で構築され、バックエンドは [DokodaPepper_api](https://github.com/RaitaKondo/DokodaPepper_api) によって提供される REST API と連携します。

## 🔧 主な機能

- ユーザー登録・ログイン（セッション認証）
- 投稿作成・編集・削除（画像付き）
- 投稿に「見つけた！」・「通報」リアクション
- 投稿へのコメント機能
- 都道府県・市区町村による投稿フィルタ（Google Geocoding API による自動登録）
- セッションストレージによる投稿データの効率的管理
- レスポンシブデザイン対応
- AWS S3 を利用した画像ストレージ
- Google Maps API による位置情報処理

## 💠 技術スタック

- Frontend: React, TypeScript, Axios, Bootstrap
- Backend: Spring Boot, PostgreSQL
- その他: AWS S3, Google Geocoding API, Render.com (デプロイ)

## 🚀 開発環境での起動方法

```bash
# 1. リポジトリをクローン
git clone -b forDeploy https://github.com/RaitaKondo/DokodaPepper_front_type.git
cd DokodaPepper_front_type

# 2. パッケージインストール
npm install

# 3. 環境変数ファイルを作成
# 必要なAPIエンドポイントやキーを.envに記述

# 4. 開発サーバー起動
npm run dev
```

## 🌐 本番環境

アプリケーションは Render.com 上にデプロイされています。

- フロントエンド: [https://dokodapepper.onrender.com](https://dokodapepper.onrender.com)
- バックエンド: [DokodaPepper_api](https://github.com/RaitaKondo/DokodaPepper_api)

## 📁 ディレクトリ構成（要約版）

```
DokodaPepper_front_type/
├── public/
├── src/
│   ├── components/
│   └── api/
├── .env
├── .gitignore
├── tsconfig.json
├── package-lock.json
├── package.json
└── README.md
```

## ✏️ 今後の改善予定

- 投稿の地図表示機能
- ユーザープロフィール画面
- 多言語対応（i18n）

## 📋 ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。
