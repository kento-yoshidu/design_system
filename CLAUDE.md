# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`ufodb-design-system`（リポジトリ: `ufodb_design_system`）: `ufodb_v0`（Union-Find DB）のGUIクライアントで共通して使うReactコンポーネントとデザイントークンのライブラリ。

利用側は次の2つ。どちらも同じ見た目・同じ操作感にするため、UIはこのリポジトリに集約する。

- **UFO Studio**（`ufodb_studio`）: Tauri製のデスクトップアプリ。Rust側で`ufodb_v0`を直接呼ぶ
- **UFO Playground**（`ufodb_playground`）: ブラウザだけで動くWebアプリ。`ufodb_v0`をWASMにして呼ぶ

実装計画・進捗のフェーズ分けは`docs/ROADMAP.md`を参照。最初はテスト用のダミーコンポーネントで、StudioとPlaygroundから読み込めるかを確認するところから始める。

## 設計方針

- **バックエンドに依存しない**: このリポジトリのコンポーネントは、Tauriの`invoke()`もWASMも直接呼ばない。データはprops、操作はコールバック（`onInsert`、`onMerge`など）で受け渡す。Tauri/WASMの呼び出しは利用側アプリの責務
- **表示は外から変えられるようにする**: アプリ名やロゴなど、StudioとPlaygroundで変わりうるものはハードコードせずpropsで受け取る
- **`react`/`react-dom`は`peerDependencies`**: 利用側とReactが二重に読み込まれるとhooksが壊れるため、`dependencies`には入れない
- **スタイル**: CSS Modules + `:root`のCSS変数（デザイントークン）。ビルド後のCSSは利用側で`import "ufodb-design-system/style.css"`のように読み込んでもらう
- 当初のコンポーネントとトークンはStudioの`src/components/`・`src/App.css`から切り出したもの。切り出し後はStudioを正とせず、このリポジトリを正とする

## 配布方法

- **ビルド済みの`dist/`をコミットし、利用側はgit依存で参照する**（リポジトリはpublicなので認証不要）。インストール時に`prepare`でビルドさせる方式は、pnpmの挙動確認やインストールの重さが気になるため採らない。npm公開は、バージョン管理の手間に見合うようになったら検討する。GitHub Packagesはpublicなパッケージでもインストールに認証が必要なため避ける
- **`src/`を変更したら、`pnpm build`してから`dist/`と一緒にコミットする**。ビルドし忘れると、利用側には古い`dist/`が届く
- 利用側は`"ufodb-design-system": "github:kento-yoshidu/ufodb_design_system"`のように`#<タグ/コミット>`なしで参照してよい。インストール時のコミットが利用側の`pnpm-lock.yaml`に記録されて固定され、`pnpm update ufodb-design-system`で最新に更新する
- ローカル開発中は、利用側から`link:`で参照してもよい

## 未決定事項

- **状態管理ロジックの置き場所**: Studioの`Contents.tsx`にあるような状態管理（groupsの再取得など）を、各アプリで書くか、`UfdbBackend`インターフェース + `useUfdb(backend)`のようなhookとしてこのリポジトリ（または別パッケージ）に置くか

## コマンド

<!-- リポジトリ作成後に実際のscriptsに合わせて更新する -->

- `pnpm install`
- `pnpm dev` — コンポーネント確認用の開発サーバー
- `pnpm build` — 型チェック → Viteのlibrary modeでビルド（`dist/`にJSとCSSを出力）→ `tsc -p tsconfig.build.json`で型定義を`dist/`に出力

## 関連リポジトリ

- `toy_ufdb`（`ufodb_v0`本体）: Union-Find DBのコア。このリポジトリからは参照しない
- `ufodb_studio`（UFO Studio）: 利用側。`invoke()`でRustを呼ぶ
- `ufodb_playground`（UFO Playground）: 利用側。WASMを呼ぶ

コンポーネントのpropsを変更すると、Studio・Playgroundの両方に影響する。破壊的変更をするときは、両方の追従が必要になることを明記する。

## 作業の進め方

このリポジトリの実装コードは基本的にユーザー自身が書く。ユーザーから明示的に依頼されない限り、実装コードを直接編集・作成しない。Claude Codeの役割は:

- 設計上の相談（コンポーネントの分割、propsの設計、CSSの扱いなど）に応答する。コードを渡すのではなく、考え方を説明する
- ユーザーが書いたコードのレビュー・指摘
- ドキュメント（`README.md` / `docs/ROADMAP.md` / `CLAUDE.md`）の作成・更新
- `pnpm build`などによるビルド・動作確認
