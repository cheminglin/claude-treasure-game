# 部署到 GitHub Pages

將目前的 Vite + React 專案**全自動**部署到 GitHub Pages，包含自動建立 GitHub repo。

## 前置需求

- `gh` CLI 已安裝（`brew install gh`）且已登入（`gh auth login`）
- `git` 已安裝
- `node` / `npm` 已安裝

## 執行此指令時，請依序完成以下任務：

### 1. 取得部署資訊

詢問使用者：
- **GitHub username**（若已知可直接用 `gh api user --jq .login` 取得）
- **repo 名稱**（建議預設為當前資料夾名稱）
- **是否要設為 Private repo**（預設 Public）

也要確認：
- `vite.config.ts` 中 `build.outDir` 的值（預設 `build`，也可能是 `dist`）

### 2. 確認前置工具

```bash
which git || echo "請先安裝 git"
which node || echo "請先安裝 node"
gh auth status || echo "請先執行 gh auth login"
```

### 3. 初始化 Git（若尚未初始化）

```bash
git init
git add .
git commit -m "Initial commit"
```

若已有 git repo，跳過此步驟。

### 4. 安裝 gh-pages 套件（若尚未安裝）

```bash
npm install --save-dev gh-pages
```

### 5. 更新 vite.config.ts

在 `defineConfig({...})` 中加入：

```ts
base: '/{repo-name}/',
```

### 6. 更新 package.json 腳本

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

（`build` 請換成實際的 outDir）

### 7. 自動建立 GitHub repo（關鍵步驟）

```bash
gh repo create {repo-name} --public --source=. --remote=origin --push
```

這一行指令會：
- 在 GitHub 建立 public repo
- 將本地 git 設定 remote origin
- 推送 main branch

若 repo 已存在，改用：
```bash
git remote add origin https://github.com/{username}/{repo-name}.git
git push -u origin main
```

### 8. 部署到 gh-pages

```bash
npm run deploy
```

### 9. 確認 GitHub Pages 設定

```bash
gh api repos/{username}/{repo-name}/pages 2>/dev/null || \
gh api --method POST repos/{username}/{repo-name}/pages \
  --field source='{"branch":"gh-pages","path":"/"}' 2>/dev/null
```

### 10. 告知部署結果

部署完成後，顯示：
- 完整 URL：`https://{username}.github.io/{repo-name}/`
- 提醒 GitHub Pages 需要 1-3 分鐘才會生效

## 注意事項

- `.env` 檔案中的 Firebase 設定不會被上傳（已在 .gitignore 排除）
- 若使用 Firebase Auth，需在 Firebase Console → Authentication → Authorized domains 加入 `{username}.github.io`
- 部署後若頁面空白，通常是 `base` 路徑設定錯誤
