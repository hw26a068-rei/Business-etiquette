import React from 'react';
import { CategoryId, UserStats, CategoryInfo } from '../types';
import { CATEGORIES, QUESTIONS } from '../data/questions';
import { 
  Award, 
  BookOpen, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle, 
  Target, 
  ChevronRight, 
  GraduationCap, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  onStartQuiz: (mode: 'category' | 'random', categoryId?: CategoryId) => void;
  onResetStats: () => void;
  onInjectDemoData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onStartQuiz,
  onResetStats,
  onInjectDemoData
}) => {
  const overallAccuracy = stats.totalAnswered > 0 
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) 
    : 0;

  // Evaluate Title (称号)
  const getRankInfo = (accuracy: number, total: number) => {
    if (total === 0) {
      return {
        title: '研修中マナー初心者',
        description: 'マナークイズを解いて、プロフェッショナルな社会人を目指しましょう！',
        color: 'text-slate-500 bg-slate-50 border-slate-200'
      };
    }
    if (total < 10) {
      return {
        title: '若手ビジネスパーソン',
        description: 'まずは10問以上解答して、自分の強みと弱みを分析してみましょう。',
        color: 'text-blue-700 bg-blue-50 border-blue-200'
      };
    }
    if (accuracy >= 90) {
      return {
        title: '極めしマナーの達人',
        description: '素晴らしい！一流の役員やエグゼクティブとも完璧に渡り合えるビジネスマナーを有しています。',
        color: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    }
    if (accuracy >= 75) {
      return {
        title: '一流ビジネスパーソン',
        description: '一般的なビジネスマナーはバッチリです。自信を持って毎日の商談や接待に臨みましょう。',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    }
    if (accuracy >= 50) {
      return {
        title: '中堅ビジネスパーソン',
        description: '少し間違いやすいニッチなマナーが課題です。苦手なカテゴリーを重点的に復習しましょう。',
        color: 'text-sky-700 bg-sky-50 border-sky-200'
      };
    }
    return {
      title: 'マナー改善の余地あり',
      description: '少し勘違いしているマナーがあるようです。解説を読み込んで正しい知識をインプットしましょう。',
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    };
  };

  const rank = getRankInfo(overallAccuracy, stats.totalAnswered);

  // Group questions by category for showing total count
  const getCategoryCount = (catId: CategoryId) => {
    return QUESTIONS.filter(q => q.category === catId).length;
  };

  // Render SVG Ring Chart
  const renderDonutChart = () => {
    const size = 150;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (overallAccuracy / 100) * circumference;

    return (
      <div className="relative flex flex-col items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={overallAccuracy >= 75 ? '#0F766E' : overallAccuracy >= 50 ? '#0284C7' : '#B91C1C'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-800 font-mono tracking-tight">
            {overallAccuracy}%
          </span>
          <span className="text-[11px] font-medium text-slate-500 font-sans mt-0.5">総合正解率</span>
        </div>
      </div>
    );
  };

  // Render SVG History Line Chart
  const renderLineChart = () => {
    if (stats.history.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-4">
          <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500">学習履歴がまだありません</p>
          <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">
            クイズを最後まで解くと、日々の正解率の推移がここにグラフとして記録されます。
          </p>
          <button 
            id="inject_demo_data_btn"
            onClick={onInjectDemoData}
            className="mt-3 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            お試し用デモデータを読み込む
          </button>
        </div>
      );
    }

    const chartWidth = 500;
    const chartHeight = 150;
    const paddingLeft = 30;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const data = stats.history.slice(-7); // Last 7 sessions

    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    // Map scores to percentages
    const points = data.map((d, index) => {
      const x = paddingLeft + (index / (Math.max(1, data.length - 1))) * plotWidth;
      const rate = d.totalCount > 0 ? (d.correctCount / d.totalCount) * 100 : 0;
      const y = paddingTop + plotHeight - (rate / 100) * plotHeight;
      return { x, y, rate, date: d.date };
    });

    // Create SVG Path line
    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area path for gradient fill
    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`
      : '';

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 font-sans flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            最近の正解率の推移（直近最大7回）
          </span>
          <span className="text-[10px] text-slate-400">日付・スコア</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-2 shadow-xs">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((level) => {
              const y = paddingTop + plotHeight - (level / 100) * plotHeight;
              return (
                <g key={level}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-400 font-mono font-medium"
                  >
                    {level}%
                  </text>
                </g>
              );
            })}

            {/* Gradient background under line */}
            {points.length > 0 && (
              <>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F766E" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0F766E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={areaD} fill="url(#chartGrad)" />
                <path d={pathD} fill="none" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}

            {/* Dots and Tooltips */}
            {points.map((p, i) => (
              <g key={i} className="group">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill="#FFFFFF"
                  stroke="#0F766E"
                  strokeWidth="2.5"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="9"
                  fill="#0F766E"
                  fillOpacity="0"
                  className="hover:fill-opacity-10 cursor-pointer transition-all duration-150"
                />
                {/* Score tooltip above dot */}
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-slate-700 bg-white"
                >
                  {Math.round(p.rate)}%
                </text>
                {/* X Axis Label */}
                <text
                  x={p.x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-sans"
                >
                  {p.date.substring(5)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Welcome & Title Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-10 -mt-10 pointer-events-none opacity-50"></div>
        
        <div className="space-y-3 z-10 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <GraduationCap className="w-3.5 h-3.5" />
            社会人基本スキル向上
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            社会人マナー学習ゲーム
          </h2>
          
          <p className="text-slate-600 text-sm max-w-xl leading-relaxed">
            席次、名刺交換、敬語、テーブルマナー、訪問時の振る舞いまで、
            ビジネスシーンで問われる必須マナーをシチュエーション形式で実践的にトレーニングします。
          </p>

          {/* Current Rank Badge */}
          <div className={`mt-4 p-4 rounded-xl border flex gap-3 items-start max-w-lg transition-all ${rank.color}`}>
            <Award className="w-5.5 h-5.5 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">現在のマナー称号</div>
              <div className="text-base font-bold mt-0.5">{rank.title}</div>
              <div className="text-xs mt-1 text-slate-600 leading-normal">{rank.description}</div>
            </div>
          </div>
        </div>

        {/* Start Random Test Button */}
        <div className="shrink-0 flex flex-col gap-3 justify-center min-w-[200px] z-10">
          <button
            id="start_random_10_btn"
            onClick={() => onStartQuiz('random')}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            ランダム10問特訓
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            全ジャンルから実力テスト
          </div>
        </div>
      </div>

      {/* Progress & Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Overall Ring chart */}
        <div className="md:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-between shadow-xs">
          <div className="w-full text-left mb-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-slate-500" />
              総合進捗サマリー
            </h3>
          </div>
          
          {renderDonutChart()}

          <div className="w-full grid grid-cols-2 gap-4 mt-6 text-center border-t border-slate-100 pt-4">
            <div>
              <span className="block text-xs font-medium text-slate-400">総回答問題数</span>
              <span className="text-xl font-bold text-slate-800 font-mono">{stats.totalAnswered}問</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-400">通算正解数</span>
              <span className="text-xl font-bold text-emerald-700 font-mono">{stats.totalCorrect}問</span>
            </div>
          </div>
        </div>

        {/* Right: History chart */}
        <div className="md:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div className="w-full text-left mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              学習の継続傾向
            </h3>
            {stats.history.length > 0 && (
              <span className="text-[10px] text-slate-400 font-mono">
                計 {stats.totalSessions} 回のトレーニング
              </span>
            )}
          </div>

          {renderLineChart()}
        </div>
      </div>

      {/* Categories Focused Training Mode */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">カテゴリー別特訓</h3>
            <p className="text-xs text-slate-500">
              各ジャンル5問ずつのカード形式。苦手な領域をピンポイントで鍛え直しましょう。
            </p>
          </div>
          
          {stats.totalAnswered > 0 && (
            <button
              id="reset_stats_btn"
              onClick={onResetStats}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-100 hover:border-rose-100 bg-slate-50/50 hover:bg-rose-50/20 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              データをクリアする
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const catStat = stats.categoryStats[cat.id] || { answered: 0, correct: 0 };
            const catTotal = getCategoryCount(cat.id);
            const catAccuracy = catStat.answered > 0 
              ? Math.round((catStat.correct / catStat.answered) * 100) 
              : 0;

            return (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Category Header with color */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cat.colorClass}`}>
                      {cat.label}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      全{catTotal}問収録
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                    {cat.label.endsWith('作法') || cat.label.endsWith('マナー') ? cat.label : `${cat.label}の作法`}
                  </h4>
                  
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">
                    {cat.description}
                  </p>
                </div>

                {/* Progress bar and play button */}
                <div className="mt-5 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">回答状況</span>
                    <span className="font-mono font-bold text-slate-700">
                      {catStat.correct}/{catStat.answered} 正解 ({catAccuracy}%)
                    </span>
                  </div>

                  {/* Visual tracking mini bar */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        catAccuracy >= 75 ? 'bg-teal-600' : catAccuracy >= 50 ? 'bg-sky-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(3, catStat.answered > 0 ? catAccuracy : 0)}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => onStartQuiz('category', cat.id)}
                    className="w-full mt-2 text-xs font-bold text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-800 border border-slate-200 hover:border-slate-800 py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    このカテゴリーを特訓
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
