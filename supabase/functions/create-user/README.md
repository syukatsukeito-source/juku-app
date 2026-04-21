# create-user Edge Function — デプロイ手順と使い方

このドキュメントは、`supabase/functions/create-user` にある Supabase Edge Function（Deno）をデプロイして、クライアントから安全にユーザー作成とプロフィール保存を行う手順をまとめたものです。

## 概要
- 目的: クライアント（Expo アプリ）から名前・電話などの追加メタデータを含むユーザー登録を安全に行う。
- 理由: Service Role キーは強力でクライアントに置けないため、Edge Function（サーバ側）で `auth.admin.createUser` と `profiles` の upsert を行うことで安全に初期データを保存する。

## 重要な注意
- Service Role キー（`service_role`）は絶対にクライアントに公開しないこと。
- 関数の環境変数にのみ設定し、公開リポジトリに含めないこと。

## 前提
- Supabase プロジェクトがあること。
- Supabase CLI をインストールしてログイン済みであること（下記参照）。

## ローカルでの動作確認（開発用）

1. 環境変数を設定（ローカルのみ。Service Role キーは安全な場所に保管してください）:

```bash
export SUPABASE_URL=https://<your-project-ref>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...   # service_role（ローカルのみ）
```

2. 関数をローカルで起動:

```bash
supabase functions serve create-user
```

3. ローカルで呼び出して確認（起動後、別ターミナルで）:

```bash
curl -X  https://uoujmziqxmzlpdopgkod.supabase.co/functions/v1/quick-handler\
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret","name":"太郎","phone":"090-xxxx-xxxx"}'
```

4. Supabase コンソールの `profiles` テーブルに行が追加されていることを確認してください。

## デプロイ（本番）手順

1. Supabase CLI にログイン:

```bash
npm install -g supabase # 未インストールなら
supabase login
```

2. プロジェクト参照をリンク（必要な場合）:

```bash
supabase link --project-ref <your-project-ref>
```

3. 関数をデプロイ:

```bash
supabase functions deploy create-user --project-ref <your-project-ref>
```

> 注意: 上のコマンドの `<your-project-ref>` は実際のプロジェクト ID に置き換えてください。角括弧や山括弧はそのまま実行しないでください。

4. 関数に environment secrets を設定（必須） — ダッシュボードまたは CLI:

- ダッシュボード: Supabase → Project → Functions → 対象関数 → Settings → Environment variables に以下を設定
  - `SUPABASE_SERVICE_ROLE_KEY` = (Service Role key)
  - `SUPABASE_URL` = https://<your-project-ref>.supabase.co

- CLI（代替）:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
supabase secrets set SUPABASE_URL=https://<your-project-ref>.supabase.co
```

5. デプロイ後、関数の公開 URL を取得（ダッシュボードか `supabase functions list`）。

## アプリ（Expo）側の設定

1. 取得した関数の公開 URL をアプリ側に渡す（公開 URL 自体は公開情報で構わない）:

```
EXPO_PUBLIC_CREATE_USER_URL=https://<functions-host>/create-user
```

2. Expo を再起動して環境変数を反映:

```bash
npx expo start --clear
```

3. アプリの登録画面から POST すれば関数がユーザーを作成し profiles を upsert します。

## なぜこの構成が必要か（簡潔）
- セキュリティ: クライアントに Service Role キーを置くと誰でも DB 操作やユーザー管理ができてしまう。サーバ側で管理することでキーを秘匿できる。
- RLS 対応: `profiles` に RLS を設定している場合、クライアントは自身の行しか操作できない。Edge Function は service role で RLS をバイパスして初期作成できる。
- メール確認との整合: メール確認フローで session が返らない場合でも、関数で先に profile を作っておけば整合性が取りやすい。

## 追加のセキュリティ案（推奨）
- 関数にリクエストの署名や簡易トークン（例: `X-FUNC-SECRET`）を要求して、悪意ある第三者からの乱用を抑える。
- reCAPTCHA / rate limiting をフロント側・関数側で検討する。

## デバッグとトラブルシュート
- ローカル serve が動かない場合：環境変数がセットされているかを確認。
- デプロイ後に 500 が返る場合：関数ログ（ダッシュボードの Functions → Logs）を確認し、Service Role Key が正しく設定されているか確認してください。

## スクリーンショットの挿入について
- このリポジトリに画像を追加して README に埋め込むこともできます。私の側で自動生成することはできませんが、ダッシュボードでキャプチャした画像を `supabase/functions/create-user/assets/` に置いていただければ、README に挿入する箇所の Markdown を追加します。

---
簡潔に言うと: クライアント→Edge Function→Supabase(Admin) の流れにすることで「追加メタデータ付きユーザー作成」を安全に実現します。

もしよければ、スクリーンショットをアップロードしていただければ README に埋め込み用の Markdown を追加します。また、`X-FUNC-SECRET` を使った簡易的な abuse 対策を関数に組み込むパッチも作成できます。どちらにしますか？
