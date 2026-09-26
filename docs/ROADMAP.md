# ufodb-design-system ロードマップ

UFO Studio（Tauri）とUFO Playground（WASM）で同じUIを使うための、共有Reactコンポーネントとデザイントークンのライブラリ。

## 進め方の方針

- **最初は「共有の仕組み」だけを確かめる**: いきなり本物のコンポーネントを移すと、問題が出たときに「コンポーネントの作り」と「別リポジトリのパッケージを読み込む仕組み」のどちらが原因か切り分けにくい。まずテスト用のダミーコンポーネントを1つだけ置き、StudioとPlaygroundの両方で表示できるところまで通す
- **本物のコンポーネントは仕組みが通ってから移す**: 見た目だけの部品（`Header`など）から始め、状態を持つ部分（`Contents`）は最後にする

## Phase 0: プロジェクト初期化

- [x] Vite（library mode）+ React + TypeScriptでプロジェクトを作成し、`toy_ufdb`などと同様に独立したgitリポジトリとして管理する
- [x] `react`/`react-dom`を`peerDependencies`に入れ、ビルド時は`build.rolldownOptions.external`で外す（開発用に`devDependencies`にも入れる）。Vite 8からバンドラーがRolldownになったため、旧名の`rollupOptions`ではなく`rolldownOptions`を使う。JSXの変換先の`react/jsx-runtime`もexternalに含める
- [x] 型定義（`.d.ts`）を出力する。`tsconfig.build.json`（`tsconfig.app.json`を継承し、`emitDeclarationOnly`で型定義だけを`dist/`に出す）を用意し、`vite build`のあとに`tsc -p tsconfig.build.json`を実行する。`vite build`は最初に`dist/`を空にするため、順番を逆にすると型定義が消える
- [x] `package.json`の`exports`で、JS本体・型・`style.css`を利用側から参照できるようにする（例: `import "ufodb-design-system/style.css"`）
- [ ] コンポーネント確認用の開発サーバー（`pnpm dev`）で、ライブラリをビルドせずに表示を確認できるようにする

## Phase 1: ダミーコンポーネントで疎通確認

共有の仕組みで起こりがちな問題を一通り踏めるよう、ダミーコンポーネントには次の要素を意図的に入れる。

- **`useState`を使う**（例: ボタンを押すと数字が増えるカウンター）: 利用側とライブラリでReactが二重に読み込まれるとhooksがエラーになる。hooksを使わない部品では、この問題に気づけない
- **CSS Modulesでスタイルを当てる**: ビルド後の`style.css`を利用側で読み込まないと、スタイルが当たらないことを確認する
- **CSS変数（デザイントークン）を1つ参照する**: `:root`の変数がライブラリ側で定義され、利用側でも効くことを確認する
- **propsを1つ受け取る**（例: 表示するラベル）: 型定義が利用側のエディタで補完されることを確認する

作業:

- [ ] ダミーコンポーネントを作り、`src/index.ts`からexportする
- [ ] `pnpm build`で`dist/`にJS・`style.css`・型定義が出ることを確認する
- [ ] Studioから表示できることを確認する（手順はStudio側`docs/ROADMAP.md`の「UI共通化」）
- [ ] Playgroundから表示できることを確認する（手順はPlayground側`docs/ROADMAP.md`の「Phase 1」）
- [ ] 開発中の反映方法を決める: `dist/`を参照する形だと、変更のたびにビルドし直しが要る。`vite build --watch`を動かしておく運用で困らないかを試す
- [ ] 本物のコンポーネントを移し終えたら、ダミーコンポーネントは削除する

## Phase 2: 見た目だけのコンポーネントを移す

`invoke()`もWASMも呼ばず、propsだけで表示が決まる部品から移す。

- [ ] `Header`（Studioの`src/components/Headet.tsx`）: タイトル（`"UFDB GUI APP"`）とロゴ（`/app-icon.svg`）が固定で書かれているので、propsで受け取る形にする。`/app-icon.svg`は利用側アプリの`public/`を前提にしたパスなので、ライブラリ側に置いたままでは表示されない
- [ ] デザイントークンとグローバルなスタイル: Studioの`src/App.css`にある`panel`・`panel__title`・`groups__item`などのグローバルクラスを、トークンと一緒にこのリポジトリへ移すか、各コンポーネントのCSS Modulesに取り込むかを決める
- [ ] グループ一覧: 現在は`Contents.tsx`の中に直接書かれている。`groups: string[][]`を受け取って表示するだけのコンポーネントとして切り出す

## Phase 3: 操作フォームを移す

- [ ] `SidePanel`: 現在は`setKey`などの`Dispatch<SetStateAction<string>>`をpropsで受け取っている。共有コンポーネントとしては、`onChange(value)`のような普通のコールバックの方が利用側で扱いやすい。入力中の値を部品の中で持つか、利用側で持つかも合わせて決める
- [ ] 各操作（`onInsert`/`onMerge`など）はコールバックで受け取り、呼び出し先（`invoke()`かWASMか）は利用側に任せる
- [ ] Studio側ROADMAPのPhase 2で操作（SAME/SIZE/UNMERGE/SEED）が増えるので、フォームの共通の形（入力欄 + ボタン）を部品にするかを検討する

## Phase 4: 画面全体（状態管理）の扱いを決める

- [ ] `CLAUDE.md`の「未決定事項」にある状態管理の置き場所を決める。StudioとPlaygroundの両方で画面を組み立ててみて、重複している部分（操作のたびに`groups`を取り直す、など）がはっきりしてから判断する
  - 各アプリで書く
  - `UfdbBackend`インターフェース（`insert`/`merge`/`groups`など）+ `useUfdb(backend)`のようなhookをこのリポジトリ（または別パッケージ）に置く
- [ ] `Ctrl+B`でのサイドパネル開閉のようなキーボード操作を共有側に置くか決める

## 検討事項（未定）

- **配布方法**: ローカル開発では`link:`で参照する。CIでビルドする段階でgit依存かnpm公開に切り替える（詳細は`CLAUDE.md`の「未決定事項」）
- **コンポーネントカタログ**: Storybookなどを入れるかは、コンポーネントが増えてから考える。当面は`pnpm dev`の確認用ページで足りる想定
