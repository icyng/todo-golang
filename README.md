# go todo app [勉強]

Go + Gin API, Vite + React + TypeScript + Tailwind UI

### 環境
- Go 1.21+
- Node.js 18+
- air (Makefile経由)

### エンドポイント
- App : `/ui/`
- API : `/api/v1/todos/`

### 実装機能
- タスクの作成 / 更新 / 削除
- ステータス管理（Open / Done）
- ドラッグ&ドロップでステータス変更
- 優先度（5段階）
- 期日の設定（未設定も可）
- 並び替え（優先度 / タイトル / 期日 / 更新日、昇順・降順）
- タスク詳細モーダルで編集（タイトル / 優先度 / 期日 / ステータス）
- 一括選択（解除 / 完了 / 削除）

### 今後の予定
- calendar連携
- サブタスク化
- 別タスクとの紐付け(?)

### めも

```cmd
// ビルド
make ui-build

// 開発
make dev

// air 直起動
make dev-fast
```
