# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用指令

```bash
npm install       # 安裝相依套件
npm run dev       # 啟動開發伺服器，網址為 http://localhost:3000
npm run build     # 建置正式版本，輸出至 build/ 目錄
```

本專案尚未設定測試執行器。

## 架構說明

Vite 6 + React 18 + TypeScript 的單頁應用程式，實作寶藏獵人遊戲，具備 Firebase 身分驗證與成績記錄功能。

### 核心資料流

```
main.tsx
  └── <AuthProvider>        # Firebase auth 狀態全域管理
        └── <App>           # 遊戲邏輯 + 條件式渲染
              ├── <AuthModal>       # 登入前強制顯示（currentUser 為 null 時）
              ├── <ScoreHistory>    # 個人成績（on-demand overlay）
              └── <Leaderboard>     # 排行榜（on-demand overlay）
```

**[src/App.tsx](src/App.tsx)** — 遊戲狀態（`boxes`、`score`、`gameEnded`）與主要 UI。遊戲結束時透過 `useEffect([gameEnded])` 自動呼叫 `saveGameResult`，訪客模式（`isGuest`）則跳過儲存。

**[src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)** — 封裝所有 Firebase 操作：`signIn`、`signUp`、`logout`、`playAsGuest`（匿名登入）、`saveGameResult`（寫入 Firestore + 更新 `users/{uid}.bestScore`）。透過 `useAuth()` hook 取用。

**[src/lib/firebase.ts](src/lib/firebase.ts)** — 初始化 Firebase app，匯出 `auth` 與 `db`。Config 從 `.env` 讀取（`VITE_FIREBASE_*`）。

### Firestore 資料結構

```
users/{userId}
  email: string
  bestScore: number
  gamesPlayed: number
  createdAt: Timestamp

gameResults/{resultId}
  userId: string
  userEmail: string
  score: number
  foundTreasure: boolean
  timestamp: Timestamp
```

**注意**：`ScoreHistory` 查詢故意不使用 `orderBy`（改為客戶端排序），以避免需要建立 Firestore 複合索引。

### UI 元件

**[src/components/ui/](src/components/ui/)** — 預先產生的 shadcn/ui 元件，通常不直接修改。匯入方式：`import { Button } from '@/components/ui/button'`。

**[src/components/AuthModal.tsx](src/components/AuthModal.tsx)** — 全螢幕 overlay，無法關閉，強制使用者選擇登入、註冊或訪客。

**[src/components/ScoreHistory.tsx](src/components/ScoreHistory.tsx)** — 個人歷史成績，從 Firestore 查詢後客戶端排序。

**[src/components/Leaderboard.tsx](src/components/Leaderboard.tsx)** — 全服 Top 10，查詢 `users` collection 依 `bestScore` 排序。

## 重要慣例

- 動畫使用 `motion/react`（Motion 函式庫）— 匯入方式為 `import { motion } from 'motion/react'`，**請勿**使用 `framer-motion`。
- 路徑別名 `@` 對應至 `src/`（已在 `vite.config.ts` 設定）。
- 建置輸出目錄為 `build/`（非 `dist/`）。
- 本專案無 TypeScript 設定檔，TypeScript 轉譯由 Vite 直接處理。
- Firebase config 存放於 `.env`（已在 `.gitignore` 中排除），不可硬編碼於原始碼。
- 訪客使用者（Firebase Anonymous Auth）的資料**不會**寫入 Firestore，以 `currentUser.isAnonymous` 判斷。
