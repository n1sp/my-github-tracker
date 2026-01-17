import { Octokit } from 'octokit';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ローカル開発環境用: .env.local があれば読み込む
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '../src/data/config.json');
const OUTPUT_PATH = path.join(__dirname, '../src/data/github-data.json');

async function fetchData() {
  const config = JSON.parse(await fsPromises.readFile(CONFIG_PATH, 'utf-8'));
  const { username } = config;

  // GitHub Actionsでは GITHUB_TOKEN が環境変数から注入される
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  console.log(`Fetching data for ${username}...`);

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const yesterdayStr = oneDayAgo.toISOString().split('T')[0];

    // 1. コミット情報の取得 (Search APIを使用して詳細を取得)
    console.log(`Searching commits for ${username} since ${yesterdayStr}...`);
    const { data: searchResults } = await octokit.rest.search.commits({
      q: `author:${username} committer-date:>=${yesterdayStr}`,
      sort: 'committer-date',
      order: 'desc',
    });

    const yesterdayCommits = searchResults.items
      .filter(item => new Date(item.commit.committer.date) > oneDayAgo)
      .map(item => ({
        repo: item.repository.name,
        message: item.commit.message.split('\n')[0],
        time: new Date(item.commit.committer.date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      }));

    console.log(`Commits found in last 24h: ${yesterdayCommits.length}`);

    // 2. 言語統計 & 週間統計用のイベント取得
    const [{ data: repos }, { data: events }] = await Promise.all([
      octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        direction: 'desc',
        per_page: 20,
      }),
      octokit.request('GET /users/{username}/events', {
        username,
        per_page: 100,
      })
    ]);

    const langMap = {};
    for (const repo of repos) {
      const { data: langs } = await octokit.rest.repos.listLanguages({
        owner: username,
        repo: repo.name,
      });
      for (const [lang, bytes] of Object.entries(langs)) {
        langMap[lang] = (langMap[lang] || 0) + bytes;
      }
    }

    const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0);
    const allLanguages = Object.entries(langMap)
      .map(([name, bytes]) => ({
        name,
        percent: (bytes / totalBytes) * 100,
        color: getLanguageColor(name)
      }))
      .sort((a, b) => b.percent - a.percent);

    // 5%未満をOthersに集約
    const mainLangs = allLanguages.filter(l => l.percent >= 5);
    const otherLangs = allLanguages.filter(l => l.percent < 5);

    if (otherLangs.length > 0) {
      const otherPercent = otherLangs.reduce((acc, l) => acc + l.percent, 0);
      mainLangs.push({
        name: 'Others',
        percent: otherPercent,
        color: '#8b949e'
      });
    }

    // 四捨五入しつつ合計を100%に調整
    let roundedLanguages = mainLangs.map(l => ({
      ...l,
      percent: Math.round(l.percent)
    })).filter(l => l.percent > 0);

    const currentTotal = roundedLanguages.reduce((acc, l) => acc + l.percent, 0);
    const diff = 100 - currentTotal;

    if (diff !== 0 && roundedLanguages.length > 0) {
      // 差分を一番比率の高い言語に調整
      roundedLanguages.sort((a, b) => b.percent - a.percent);
      roundedLanguages[0].percent += diff;
    }

    const languages = roundedLanguages.sort((a, b) => b.percent - a.percent);

    // 3. 今週のコミット数 (Search APIでカウントのみ取得)
    console.log(`Counting commits for ${username} since ${oneWeekAgo.toISOString().split('T')[0]}...`);
    const { data: weeklyResults } = await octokit.rest.search.commits({
      q: `author:${username} committer-date:>=${oneWeekAgo.toISOString().split('T')[0]}`,
    });

    const weeklyCommits = weeklyResults.total_count;

    // 結果をまとめる
    const result = {
      lastUpdated: new Date().toISOString(),
      yesterday: {
        commitCount: yesterdayCommits.length,
        commits: yesterdayCommits.slice(0, 5) // 表示用に5件まで
      },
      languages,
      weeklyStats: {
        currentCommits: weeklyCommits
      }
    };

    await fsPromises.writeFile(OUTPUT_PATH, JSON.stringify(result, null, 2));
    console.log('Successfully updated github-data.json');

  } catch (error) {
    console.error('Error fetching data from GitHub:', error);
    process.exit(1);
  }
}

// 簡易的な色設定
function getLanguageColor(lang) {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219'
  };
  return colors[lang] || '#8b949e';
}

fetchData();
