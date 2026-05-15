# 部署到 GitHub Pages

將目前的 Vite + React 專案部署到 GitHub Pages。

## 使用方式

執行 `/deploy_github_page` 指令，Claude 會引導你完成整個部署流程。

## 部署步驟

1. **確認前置條件**
   - 確認 git 已安裝
   - 確認 Node.js 與 npm 已安裝
   - 詢問 GitHub username 與 repo 名稱

2. **初始化 Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **安裝 gh-pages 套件**
   ```bash
   npm install --save-dev gh-pages
   ```

4. **更新 vite.config.ts**
   - 加入 `base: '/{repo-name}/'` 讓靜態資源路徑正確

5. **更新 package.json 腳本**
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```

6. **建置並部署**
   ```bash
   npm run deploy
   ```

7. **設定 GitHub Pages**
   - 確認 GitHub repo 已設定為從 `gh-pages` branch 提供服務
   - Settings → Pages → Branch: gh-pages

## 注意事項

- `.env` 檔案中的 Firebase 設定**不會**被上傳（已在 .gitignore 中）
- 如果 Firebase Auth 需要正確的授權網域，需在 Firebase Console 加入 GitHub Pages 的網域
- 部署完成後網址格式為：`https://{username}.github.io/{repo-name}/`

## 執行此指令時，請依序完成以下任務：

1. 詢問使用者的 GitHub username 與目標 repo 名稱
2. 檢查並初始化 git repo
3. 安裝 gh-pages 套件
4. 修改 vite.config.ts 加入正確的 base 路徑
5. 修改 package.json 加入 predeploy 與 deploy 腳本
6. 請使用者在 GitHub 建立對應的 repo
7. 設定 git remote origin
8. 執行 `npm run deploy` 部署到 gh-pages branch
9. 告知使用者完整的部署 URL
