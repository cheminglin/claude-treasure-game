# 部署到 Vercel

將本地專案部署到 Vercel，並回傳部署後的 URL。

## 執行步驟

### 1. 確認 Vercel CLI 已安裝

```bash
which vercel || npm install -g vercel
```

### 2. 確認已登入 Vercel

```bash
vercel whoami
```

若未登入，請執行 `vercel login` 並完成瀏覽器驗證。

### 3. 讀取 .env 的環境變數

從 `.env` 讀取所有 `VITE_FIREBASE_*` 變數的值，在部署時透過 `--env` 旗標傳入。

### 4. 先建置確認無誤

```bash
npm run build
```

### 5. 執行正式部署

```bash
vercel --prod --yes \
  --env VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
  --env VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
  --env VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
  --env VITE_FIREBASE_STORAGE_BUCKET="$VITE_FIREBASE_STORAGE_BUCKET" \
  --env VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
  --env VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
  --env VITE_FIREBASE_MEASUREMENT_ID="$VITE_FIREBASE_MEASUREMENT_ID"
```

> **注意**：`--yes` 會自動接受所有提示。若是全新專案（未曾連結 Vercel），Vercel 會自動建立新專案。

### 6. 回傳結果

部署完成後，從輸出中擷取以 `https://` 開頭的 Production URL，告知使用者。

## 重要提醒

- `.env` 不可提交到 Git，但環境變數**必須**在 Vercel 端設定，否則 Firebase 無法連線。
- `vite.config.ts` 的建置輸出目錄為 `build/`，Vercel 會自動偵測。
- 若 Firebase 的 Auth Domain 有限制來源，記得將 Vercel 的 production domain 加入 Firebase Console 的授權網域清單。
