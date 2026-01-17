import { GitHubCalendar } from 'react-github-calendar';
import config from './data/config.json';
import stats from './data/github-data.json';

function App() {
  const { username, goals } = config;
  const { yesterday, languages, weeklyStats, lastUpdated } = stats;

  const progress = Math.min(100, (weeklyStats.currentCommits / goals.weeklyCommits) * 100);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-4 md:p-8 font-sans">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2 tracking-tight text-white">{username}'s Trajectory</h1>
        <p className="text-[#8b949e]">GitHub Activity Dashboard</p>
        <p className="text-xs text-[#484f58] mt-2">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 左カラム: 目標 & 言語 */}
        <div className="flex flex-col gap-6">
          {/* 週間目標 */}
          <section className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
            <h2 className="text-sm font-medium text-[#8b949e] mb-4 uppercase tracking-wider">Weekly Goal</h2>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold text-white">{weeklyStats.currentCommits} <span className="text-sm font-normal text-[#8b949e]">/ {goals.weeklyCommits} commits</span></span>
              <span className="text-[#58a6ff] font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-[#30363d] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#238636] h-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </section>

          {/* 言語別アクティブ */}
          <section className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
            <h2 className="text-sm font-medium text-[#8b949e] mb-4 uppercase tracking-wider">Top Languages</h2>
            <div className="flex h-3 w-full rounded-full overflow-hidden mb-4">
              {languages.map((lang) => (
                <div
                  key={lang.name}
                  style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
                  title={`${lang.name}: ${lang.percent}%`}
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <div key={lang.name} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }}></span>
                  <span className="text-[#c9d1d9]">{lang.name}</span>
                  <span className="text-[#8b949e] text-xs">{lang.percent}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 右カラム (メイン): 草 & 昨日の成果 */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* コントリビューション */}
          <section className="bg-[#161b22] p-6 rounded-xl border border-[#30363d] overflow-x-auto">
            <h2 className="text-sm font-medium text-[#8b949e] mb-4 uppercase tracking-wider">Contribution Graph</h2>
            <GitHubCalendar
              username={username}
              colorScheme="dark"
              fontSize={14}
            />
          </section>

          {/* 昨日の成果 */}
          <section className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium text-[#8b949e] uppercase tracking-wider">Yesterday's Impact</h2>
              <span className="bg-[#238636]/20 text-[#238636] px-2 py-1 rounded text-xs font-bold border border-[#238636]/30">
                {yesterday.commitCount} Commits
              </span>
            </div>
            <div className="space-y-3">
              {yesterday.commits.map((commit, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0d1117] border border-[#30363d]/50">
                  <div className="mt-1">
                    <svg className="w-4 h-4 text-[#58a6ff]" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 7.75a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm1.43.75a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 1 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 1 1 0 1.5h-3.32Z"></path></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">{commit.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#58a6ff]">{commit.repo}</span>
                      <span className="text-[10px] text-[#484f58]">•</span>
                      <span className="text-xs text-[#484f58]">{commit.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;