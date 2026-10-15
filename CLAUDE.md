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
- **Tailwind CSS v4 は PostCSS ではなく Turbopack ローダー経由**（`next.config.ts` の `turbopack.rules` で `*.css` に `@tailwindcss/turbopack` を適用）。`postcss.config` や `tailwind.config` は存在しない。テーマ変数は `src/app/globals.css` の `:root` で値を定義し、`@theme inline` で Tailwind のユーティリティ（`bg-primary` など）に割り当てている（下記 shadcn/ui 参照）。
- **`LayoutProps<"/">` / `PageProps` などのルート型はグローバル型**（Next.js が `.next/types` に生成）で import 不要。
- フォントは `next/font/google` の Geist / Geist Mono を `src/app/layout.tsx` で CSS 変数として読み込んでいる。

## shadcn/ui

- 設定は `components.json`（スタイル `base-nova`、プリミティブは **Radix ではなく Base UI**（`@base-ui/react`）、アイコンは `lucide-react`、ベースカラー `neutral`）。Base UI と Radix は API が異なるので、ドキュメントや例を参照するときは Base UI 版を見ること。
- コンポーネントの追加は `npx shadcn@latest add <name>`。`src/components/ui/` に生成され、生成物はプロジェクトのコードとして直接編集してよい。アプリ固有のコンポーネント（`src/components/kanban/` など）は `ui/` に置かない。
- クラス名の結合は `@/lib/utils` の `cn()`（中身は shadcn 公式の `cn` パッケージ。clsx + tailwind-merge の代替）。
- 色は `bg-background` / `text-foreground` / `bg-primary` / `text-muted-foreground` / `border-border` / `text-destructive` などのテーマトークンを使い、固定の色（`bg-gray-100` など）を新たに書かない。トークンの値を変えるときは `globals.css` の `:root` とダーク用の値の両方を揃える。
- **ダークモードは `prefers-color-scheme`**。shadcn の既定（`.dark` クラス方式）から変更しており、`globals.css` の `@custom-variant dark` はメディアクエリ、ダーク用の値は `@media (prefers-color-scheme: dark) { :root { ... } }` にある。`shadcn init` や `--force` 付きの再実行、テーマ変更で `globals.css` が書き換わると `.dark` 方式と `--font-sans: var(--font-sans)`（自己参照で無効）に戻るので、実行後は差分を確認して直すこと。
- カンバン UI（`KanbanBoard` / `TaskCard` / `TaskForm` / `ConfirmDialog` / `page.tsx`）は shadcn のコンポーネントで組み換え済み。見た目を変えるときも、テストが使う role とアクセシブルネーム（列 = `region`、カード = `article`、フォーム = `form`、`ConfirmDialog` = `alertdialog`、ボタン名「追加」「編集」「削除」など）が変わらないことを既存テストで確認し、1 コンポーネントずつ行う。

### デザインルール

- **配色**: neutral 基調のモノトーン。アクセント色は足さず、強弱はトークンの濃淡で付ける（例: 列の状態ドットは `bg-muted-foreground/40`（未着手）→ `bg-chart-2`（進行中）→ `bg-primary`（完了））。新しい色が必要なら `globals.css` にトークンを追加し、ライト・ダーク両方の値を定義してから使う。
- **レイアウト**: `main` は `max-w-7xl px-4 sm:px-6 py-10`。`lg` 以上は `grid-cols-[18rem_1fr]` で左に追加フォーム（`lg:sticky lg:top-6`）、列は `md` 以上で 3 列、それ未満は縦積み。幅 390px で横スクロールが出ないこと。
- **面と枠線**: 面は `Card`（`rounded-xl` + `ring-1 ring-foreground/10`）。枠線は `border` より `ring` を使う（base-nova の流儀）。列は `rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/5`、タスクカードは `Card size="sm"` + `shadow-xs transition-shadow hover:shadow-md`。
- **部品の使い分け**:
  - ボタンは `Button`。主操作 = `default`、副操作（キャンセル）= `outline`、カード内の操作 = `ghost` + `size="icon-sm"`、破壊的操作 = `destructive`。
  - 入力は `Label` + `Input` / `Textarea` / `NativeSelect`（`className="w-full"`）。セレクトは Base UI の `Select` ではなく `NativeSelect` を使う（テストの `user.selectOptions` / `getByLabelText` が `<select>` 前提のため）。
  - エラーは `Alert variant="destructive"` + `CircleAlert` アイコン + `AlertTitle`。`Alert` が `role="alert"` を持つので自前で付けない。テストは `textContent` を完全一致で見るので、メッセージ以外のテキストを中に入れない。
  - 件数は `Badge variant="secondary"`（`tabular-nums`）。確認ダイアログは `ConfirmDialog`（`AlertDialog` を `open` 固定で条件付きレンダーし、閉じる操作は `onOpenChange(false)` → `onCancel`）。
- **アイコン**: `lucide-react`。装飾用は `aria-hidden="true"`。アイコンだけのボタンは `aria-label` と `title` を付ける（例: 編集 = `Pencil`、削除 = `Trash2`）。`Button` 内のアイコンはサイズ指定不要（自動で `size-4`）。
- **状態表示**: 処理中は `Loader2 className="animate-spin"` + 文言（「追加中…」などの文言はテストで使うので変えない）。空状態は `border border-dashed` の枠 + アイコン（`Inbox`）+ 文言。
- **文字**: ページ見出しは `font-heading text-2xl font-semibold tracking-tight`、列見出しは `text-sm font-semibold`、補足は `text-sm text-muted-foreground`。ユーザー入力の表示には `break-words`、説明文は `whitespace-pre-wrap` も付ける。
- **見た目の確認**: Playwright MCP でライト・ダーク（`browser_emulate_media`）と幅 1280px / 390px のスクリーンショットを撮る。`Button` などは `transition-all` のため、切り替え直後のスクリーンショットは途中の色になることがあるので少し待ってから撮る。スクリーンショットは `.playwright-mcp/` に保存される（コミットしない）。

## Supabase

- `@supabase/ssr` + `@supabase/supabase-js` を使用。Supabase プロジェクトは `task-kanban`（ref: `bwrljikjeswdlbhcuwfn`、リージョン ap-northeast-1）。プロジェクト情報・テーブル・キーは Supabase MCP で確認する。
- **環境変数**: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`（キー一覧は `.env.example`）。実際の値は `.env.local` にあり、git 管理外。キーは旧 anon key ではなく publishable key（`sb_publishable_...`）を使う。
- **クライアントの使い分け**:
  - Client Component → `@/lib/supabase/client` の `createClient()`（同期）
  - Server Component / Server Action / Route Handler → `@/lib/supabase/server` の `createClient()`（`cookies()` を使うため `async`、`await` が必要）。リクエストごとに生成し、モジュールスコープで使い回さない。
  - `cookies()` を読むため、`cacheComponents: true` 下ではサーバー側の Supabase 呼び出しは動的データになる。`<Suspense>` 境界や `"use cache"` との組み合わせは docs で確認すること。
- **起動時の接続チェック**: `src/instrumentation.ts` の `register()` がサーバー起動時に 1 回だけ `checkSupabaseConnection()`（`src/lib/supabase/checkConnection.ts`、`/auth/v1/health` へ fetch）を実行し、**失敗時のみ** `console.error` で `[Supabase] 接続失敗: <理由>` を出力する（成功時は何も出力しない）。`register()` は起動時にしか走らないため、変更を確認するには開発サーバーの再起動が必要。
- テストで Supabase への通信を扱う場合は `fetch` などの外部依存のみをモックする（例: `src/__tests__/checkConnection.test.ts` の `vi.stubGlobal("fetch", ...)`）。
- **DB スキーマ**: スキーマ変更は Supabase MCP の `apply_migration` で行い、変更後は `get_advisors`（security / performance）を確認する。ローカルにマイグレーションファイルは無い（履歴は `list_migrations`）。
  - `public.tasks`: `id` uuid / `title`（trim 後 1〜100 文字）/ `description`（〜1000 文字、既定 `''`）/ `status`（`todo` / `in_progress` / `done` の CHECK 制約）/ `created_at` / `updated_at`（トリガー `set_updated_at` で自動更新）。
  - **RLS は暫定**: 認証未実装のため anon / authenticated に全操作を許可するポリシーになっている。認証導入時に `user_id` 列を追加し、所有者のみ操作できるポリシーへ置き換えること。
- **型**: `src/lib/supabase/database.types.ts` は Supabase MCP の `generate_typescript_types` で生成したもの（手で編集しない）。スキーマを変えたら再生成し、`createClient<Database>` に反映される。
- 未実装: 認証（セッション更新用の `proxy.ts`）。

## タスク機能の構成

- `src/lib/tasks/types.ts`: `Task`（画面用、`createdAt` などキャメルケース）、`TASK_STATUSES`（値と表示ラベル）、`ActionResult<T>`（`{ ok: true, data }` / `{ ok: false, error }`）。
- `src/lib/tasks/validation.ts`: `validateTaskInput()`。DB の CHECK 制約と同じ条件をクライアント・サーバー両方で使う（文字数はコードポイント単位）。制約を変えるときは DB と両方を揃える。
- `src/lib/tasks/queries.ts`: `getTasks()`（サーバー専用）と、DB 行 → `Task` 変換の `toTask()`。
- `src/app/actions.ts`（`"use server"`）: `createTask` / `updateTask` / `deleteTask`。Server Action は誰でも呼べる入口なので必ずサーバー側でも検証する。例外は投げずに `ActionResult` を返し、DB のエラー内容は画面に出さない。
- `src/app/page.tsx`: 見出しは同期で描画し、`getTasks()` を呼ぶ async の `TaskBoardLoader` を `<Suspense>` 内に置く（`cacheComponents` の要件）。
- `src/components/kanban/`:
  - `KanbanBoard`（client。レイアウトのみ）→ `NewTaskPanel`（追加フォームの枠）+ 状態ごとの `KanbanColumn`（列見出し・件数・空状態）→ `TaskCard`（表示・編集切り替え・削除フロー）→ `TaskCardActions`（編集・削除ボタン）。
  - `useKanbanTasks`: `initialTasks` を `useState` で持ち、Server Action の戻り値で state を更新して即時反映するフック。`KanbanActions` 型もここで定義（`KanbanBoard` から re-export）。
  - 共通部品: `TaskForm`（追加・編集共通）/ `ConfirmDialog`（`role="alertdialog"`、Esc でキャンセル）/ `ErrorAlert`（エラー表示。`page.tsx` も使用）。
- **テスト方針**: Server Action は `KanbanBoard` に `actions` prop として渡しているので、UI テストでは `vi.fn()` を渡す（`src/__tests__/KanbanBoard.test.tsx`）。Server Action / `getTasks` のテストは `@/lib/supabase/server` のみを `vi.mock` し、クエリビルダーのフェイクで検証する（`src/__tests__/actions.test.ts`）。要素は role とアクセシブルネーム（列 = `region`、カード = `article`、フォーム = `form`）で取得する。
- **現状の仕様・制約**:
  - 並び順は `created_at` の昇順のみ（並び替え用の `position` 列は無い）。新規タスクは列の末尾に追加される。
  - `KanbanBoard` の state は初回の `initialTasks` から作るだけなので、別タブ・別ユーザーの変更はリロードするまで反映されない（`refresh()` / Realtime は未使用）。
  - ステータスの変更は編集フォームのセレクトボックスで行う（ドラッグ&ドロップは未実装）。

### よくある変更の手順

- **ステータス（列）を追加・変更する**: DB の `status` の CHECK 制約（`apply_migration`）と `TASK_STATUSES` を両方変える。`status` は `text` 型なので型の再生成は不要。
- **入力の制約（文字数など）を変える**: DB の CHECK 制約と `validation.ts` の `TITLE_MAX_LENGTH` / `DESCRIPTION_MAX_LENGTH` を揃える。
- **列やテーブルを追加する**: `apply_migration` → `get_advisors` → `generate_typescript_types` で `database.types.ts` を更新 → `queries.ts` の `TASK_COLUMNS` / `toTask()` と `Task` 型を更新 → 検証・アクション・UI の順に、それぞれテストを先に書いてから実装する。

## テスト

- Vitest 5 + React Testing Library + `@testing-library/user-event` + jsdom。設定は `vitest.config.mts`（パスエイリアスは Vite 標準の `resolve.tsconfigPaths: true` で解決しており、`vite-tsconfig-paths` プラグインは使わない）。
- テストは `src/__tests__/` に配置（コロケーションも可）。
- **`globals: true` ではないため RTL の自動 cleanup が効かない**。複数のテストで `render` するファイルでは `afterEach(() => cleanup())` を必ず書く（書かないと前のテストの DOM が残る）。
- 操作は `fireEvent` ではなく `const user = userEvent.setup()` を使う。
- Server Action やサーバー専用コードのテストはファイル先頭に `// @vitest-environment node` を書く。
- Vitest は `async` Server Components に非対応。`page.tsx` のように async の子を `<Suspense>` 内に置いているページは、`@/lib/supabase/server` を応答しない Promise でモックし、同期的に描画される部分（見出し・fallback）だけを検証する（`src/__tests__/page.test.tsx`）。async 部分は E2E でテストする。

## 動作確認

- 開発サーバーがすでに起動していることがある（`Another next dev server is already running` と出る）。その場合は既存のサーバー（http://localhost:3000）で確認し、ログは `.next/dev/logs/next-development.log` を見る。`instrumentation.ts` の変更は再起動するまで反映されない。
- 実際の DB に対する確認は、publishable key（anon ロール）を使うスクリプトを `npx tsx --env-file=.env.local <script>` で実行すると、RLS ポリシーも含めて確かめられる。確認で作ったデータは必ず削除し、Supabase MCP の `execute_sql` で件数を確認する。`.env.local` の中身は読まない・表示しない。

## コーディングルール
- 変更後は必ず`npm test`でテストが通ることを確認してください
- 変更は1つの関心事に絞り、小さい単位で行ってください
- 指示された範囲以外のコードを変更しないでください
- 機能追加はテストを先に書き、失敗を確認してから実装してください（テスト → 実装の単位でコミット）
- ブランチは `feat/...` / `chore/...` のように目的別に切ってください

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