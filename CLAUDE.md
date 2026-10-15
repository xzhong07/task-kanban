# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 重要: Next.js 16 を使用

このプロジェクトは Next.js 16.4 / React 19.3 で、学習データ上の Next.js とは API・規約が異なる可能性がある。コードを書く前に `node_modules/next/dist/docs/`（`01-app/` が App Router）の該当ガイドを読み、非推奨の警告に従うこと。`AGENTS.md` は `next dev` が自動で再生成するファイルなので編集しない。

## コマンド

```bash
npm run dev                                  # 開発サーバー (http://localhost:3000)
npm run build                                # 本番ビルド
npm run lint                                 # ESLint (flat config)
npm test                                     # Vitest (watch モード)
npx vitest run                               # 全テストを1回だけ実行
npx vitest run src/__tests__/page.test.tsx   # 単一ファイルを実行
npx vitest run -t "テスト名"                  # テスト名で絞り込み
npx tsc --noEmit                             # 型チェック
```

## 構成と注意点

- **App Router のみ**。ソースは `src/` 配下（`src/app/`）、パスエイリアスは `@/*` → `./src/*`。
- **`next.config.ts` の実験的設定**: `cacheComponents: true` と `partialPrefetching: true` が有効。データ取得・キャッシュ・動的レンダリングを実装する際はこれらの挙動を前提にし、docs で確認すること。
- **Tailwind CSS v4 は PostCSS ではなく Turbopack ローダー経由**（`next.config.ts` の `turbopack.rules` で `*.css` に `@tailwindcss/turbopack` を適用）。`postcss.config` や `tailwind.config` は存在しない。テーマ変数は `src/app/globals.css` の `@theme inline` で定義（ダークモードは `prefers-color-scheme`）。
- **`LayoutProps<"/">` / `PageProps` などのルート型はグローバル型**（Next.js が `.next/types` に生成）で import 不要。
- フォントは `next/font/google` の Geist / Geist Mono を `src/app/layout.tsx` で CSS 変数として読み込んでいる。

## テスト

- Vitest 5 + React Testing Library + jsdom。設定は `vitest.config.mts`（パスエイリアスは Vite 標準の `resolve.tsconfigPaths: true` で解決しており、`vite-tsconfig-paths` プラグインは使わない）。
- テストは `src/__tests__/` に配置（コロケーションも可）。
- Vitest は `async` Server Components に非対応。それらは単体テストではなく E2E でテストする。

## コーディングルール
- 変更後は必ず`npm test`でテストが通ることを確認してください
- 変更は1つの関心事に絞り、小さい単位で行ってください
- 指示された範囲以外のコードを変更しないでください

## コーディング規約
- コンポーネントは関数コンポーネントで記述してください
- 変数名・関数名はキャメルケースで書いてください
- コミットメッセージは日本語で書いてください

## テストルール
- 網羅性：正常系・異常系・境界値を検討してください
- 可読性：テスト名に条件と期待する結果を明示してください
- 保守性：実装の内部構造ではなく、ユーザーから見たふるまいをテストしてください
- 独立性：テスト間で状態を共有しないでください
- 状態遷移：画面遷移の順方向・逆方向を検討してください
- モック方針：外部依存のみモック化してください

## 禁止事項
- console.logを本番コードに残さないでください
- 既存のテストを削除しないでください
- any型を使用しないでください

## MCP活用ルール
- Next.js・Supabase・Vitestなどの最新仕様はContext7 MCPを使って公式ドキュメントを確認してください