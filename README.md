# GitHub Activity Tracker (MVP)

自分の開発の軌跡をひと目で確認し、モチベーションを維持するための自分専用ダッシュボード。

## 1. コンセプト

* **「わざわざ見に行く」を「つい見てしまう」に:** GitHubを開く手間を省き、自分が見たい情報だけを1ページに集約。
* **Jamstack構成による爆速表示:** GitHub Actionsでデータを事前取得し、ビルド時に埋め込むことで、API制限を気にせず高速に表示。

## 2. 技術スタック

| カテゴリ | 採択技術 | 理由 |
| --- | --- | --- |
| **Build Tool** | Vite 7 | 高速な開発環境。 |
| **Frontend** | React 19 | 最新のReact機能の活用。 |
| **Styling** | Tailwind CSS v4 | モダンで柔軟なスタイリング。 |
| **Data Fetch** | Octokit (GitHub API) | Node.jsスクリプトによる自動データ更新。 |
| **Hosting** | Cloudflare Pages | 高速なエッジ配信と簡単なデプロイ。 |

## 3. セットアップ手順

### ローカル開発
1. 依存関係のインストール
   ```bash
   npm install
   ```
2. 環境変数の設定
   `.env.local` を作成し、GitHubのPersonal Access Tokenを設定します。
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```
   ※トークンは **`repo`** 権限が必要です。
3. データの取得テスト
   ```bash
   node scripts/fetch-data.js
   ```
4. 開発サーバー起動
   ```bash
   npm run dev
   ```

### 自動更新の設定 (GitHub Actions)
1. **GitHubリポジトリの設定**
   GitHubリポジトリの `Settings > Secrets and variables > Actions` を開きます。
2. **Secretの作成**
   `New repository secret` をクリックし、以下を登録します。
   * **Name**: `MY_GITHUB_TOKEN`
   * **Value**: 取得したPersonal Access Token (`repo` 権限あり)
3. **ワークフロー権限の確認**
   `Settings > Actions > General` の `Workflow permissions` で **`Read and write permissions`** が選択されていることを確認してください（データをリポジトリに保存するために必要です）。
4. **自動実行**
   * 毎日午前3時(JST)に自動実行されます。
   * `Actions` タブから手動で `Update GitHub Data` を実行して即座にテストすることも可能です。

## 4. 設定のカスタマイズ (重要)
`src/data/config.json` を編集して、GitHub ユーザー名と目標値を設定してください。
**ここを書き換えないと、正しいデータが取得できません。**

```json
{
  "username": "ユーザー名",
  "goals": {
    "weeklyCommits": 20
  }
}
```

## 5. UI 仕様
* **Theme:** Dark Mode (Background: `#0d1117`)
* **Layout:** 中央寄せのレスポンシブ構成
* **Sections:** 週間目標進捗、言語別アクティブ、昨日のコミットログ、コントリビューショングラフ。
