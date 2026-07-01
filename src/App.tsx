import { useState, useEffect } from 'react';
import { UserStats, CategoryId, Question } from './types';
import { CATEGORIES, QUESTIONS } from './data/questions';
import { Dashboard } from './components/Dashboard';
import { QuizRunner } from './components/QuizRunner';
import { ReviewList } from './components/ReviewList';
import { 
  Briefcase, 
  GraduationCap, 
  Layers, 
  Sparkles,
  Info,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'manner_game_stats_v1';

const playClickSound = () => {
  const audio = new Audio('/クリック.wav');
  audio.play().catch(err => console.error('Failed to play sound:', err));
};

const defaultStats: UserStats = {
  totalSessions: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  categoryStats: {
    seating: { answered: 0, correct: 0 },
    card: { answered: 0, correct: 0 },
    table_manner: { answered: 0, correct: 0 },
    language: { answered: 0, correct: 0 },
    visit: { answered: 0, correct: 0 }
  },
  history: []
};

// Simple array shuffler
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [view, setView] = useState<'dashboard' | 'quiz' | 'review'>('dashboard');
  const [currentQuiz, setCurrentQuiz] = useState<{
    mode: 'category' | 'random';
    questions: Question[];
    categoryLabel?: string;
  } | null>(null);
  const [userAnswers, setUserAnswers] = useState<{
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
    dragDropPlacement?: Record<string, string>;
  }[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load stats from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean fallback validation to ensure shape safety
        if (parsed && typeof parsed.totalSessions === 'number') {
          setStats(parsed);
        } else {
          setStats(defaultStats);
        }
      } else {
        setStats(defaultStats);
      }
    } catch (e) {
      console.error('Error loading stats', e);
      setStats(defaultStats);
    }
  }, []);

  // Handler to start a quiz
  const handleStartQuiz = (mode: 'category' | 'random', categoryId?: CategoryId) => {
    playClickSound();
    let quizQuestions: Question[] = [];
    let label = '';

    if (mode === 'category' && categoryId) {
      // Filter questions by selected category
      quizQuestions = QUESTIONS.filter(q => q.category === categoryId);
      const catInfo = CATEGORIES.find(c => c.id === categoryId);
      label = catInfo ? catInfo.label : '';
    } else {
      // Random training: Shuffle everything and take 10
      const shuffled = shuffleArray(QUESTIONS);
      quizQuestions = shuffled.slice(0, 10);
      label = 'ランダム実力テスト';
    }

    setCurrentQuiz({
      mode,
      questions: quizQuestions,
      categoryLabel: label
    });
    setUserAnswers([]);
    setView('quiz');
  };

  // Handler when quiz completes
  const handleFinishQuiz = (answers: { questionId: string; selectedIndex: number; isCorrect: boolean; dragDropPlacement?: Record<string, string> }[]) => {
    if (!currentQuiz) return;

    setUserAnswers(answers);
    
    // Calculate new stats
    const updatedStats = { ...stats };
    updatedStats.totalSessions += 1;
    
    let sessionCorrect = 0;
    
    answers.forEach(ans => {
      const q = currentQuiz.questions.find(item => item.id === ans.questionId);
      if (!q) return;

      updatedStats.totalAnswered += 1;
      if (ans.isCorrect) {
        updatedStats.totalCorrect += 1;
        sessionCorrect += 1;
      }

      // Update category-specific stats
      const catId = q.category;
      if (!updatedStats.categoryStats[catId]) {
        updatedStats.categoryStats[catId] = { answered: 0, correct: 0 };
      }
      updatedStats.categoryStats[catId].answered += 1;
      if (ans.isCorrect) {
        updatedStats.categoryStats[catId].correct += 1;
      }
    });

    // Add to history
    const todayStr = new Date().toISOString().split('T')[0];
    const newHistoryItem = {
      date: todayStr,
      correctCount: sessionCorrect,
      totalCount: answers.length,
      sessionMode: currentQuiz.mode
    };
    
    updatedStats.history = [...updatedStats.history, newHistoryItem];

    // Keep history clean to maximum of last 30 entries to save storage space
    if (updatedStats.history.length > 30) {
      updatedStats.history.shift();
    }

    setStats(updatedStats);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedStats));
    } catch (e) {
      console.error('Error saving stats to localStorage', e);
    }

    setView('review');
  };

  // Reset statistics handler
  const handleResetStats = () => {
    playClickSound();
    setShowResetConfirm(true);
  };

  // Safe execution of stats and state reset (start from beginning)
  const executeResetStats = () => {
    playClickSound();
    setStats(defaultStats);
    setView('dashboard');
    setCurrentQuiz(null);
    setUserAnswers([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
    setShowResetConfirm(false);
  };

  // Inject beautiful practice data so that user can instantly see graphs
  const handleInjectDemoData = () => {
    playClickSound();
    const today = new Date();
    const getPastDateStr = (daysAgo: number) => {
      const d = new Date();
      d.setDate(today.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const demoStats: UserStats = {
      totalSessions: 6,
      totalAnswered: 45,
      totalCorrect: 36,
      categoryStats: {
        seating: { answered: 10, correct: 8 },
        card: { answered: 10, correct: 9 },
        table_manner: { answered: 10, correct: 7 },
        language: { answered: 10, correct: 8 },
        visit: { answered: 5, correct: 4 }
      },
      history: [
        { date: getPastDateStr(5), correctCount: 5, totalCount: 10, sessionMode: 'random' },
        { date: getPastDateStr(4), correctCount: 4, totalCount: 5, sessionMode: 'category' },
        { date: getPastDateStr(3), correctCount: 8, totalCount: 10, sessionMode: 'random' },
        { date: getPastDateStr(2), correctCount: 5, totalCount: 5, sessionMode: 'category' },
        { date: getPastDateStr(1), correctCount: 9, totalCount: 10, sessionMode: 'random' },
        { date: getPastDateStr(0), correctCount: 5, totalCount: 5, sessionMode: 'category' }
      ]
    };

    setStats(demoStats);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoStats));
    } catch (e) {
      console.error('Error saving demo stats to localStorage', e);
    }
  };

  const handleRestartQuiz = () => {
    playClickSound();
    if (!currentQuiz) return;
    
    // Re-shuffle if it was random mode
    let quizQuestions = [...currentQuiz.questions];
    if (currentQuiz.mode === 'random') {
      const shuffled = shuffleArray(QUESTIONS);
      quizQuestions = shuffled.slice(0, 10);
    }

    setCurrentQuiz({
      ...currentQuiz,
      questions: quizQuestions
    });
    setUserAnswers([]);
    setView('quiz');
  };

  const handleGoHome = () => {
    playClickSound();
    setCurrentQuiz(null);
    setUserAnswers([]);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Premium Business-Style Navigation Header */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-amber-400 shadow-sm">
              <Briefcase className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-extrabold tracking-tight flex items-center gap-1.5 font-sans">
                社会人マナー学習ゲーム
                <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded font-extrabold uppercase">
                  PRO
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden md:block">
                信頼されるプロフェッショナルになるための、シチュエーション式マナートレーニング
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-medium">
              オフィスカジュアル・スタイル
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-8">
        {view === 'dashboard' && (
          <Dashboard
            stats={stats}
            onStartQuiz={handleStartQuiz}
            onResetStats={handleResetStats}
            onInjectDemoData={handleInjectDemoData}
          />
        )}

        {view === 'quiz' && currentQuiz && (
          <QuizRunner
            mode={currentQuiz.mode}
            categoryLabel={currentQuiz.categoryLabel}
            questions={currentQuiz.questions}
            onFinishQuiz={handleFinishQuiz}
            onQuit={handleGoHome}
          />
        )}

        {view === 'review' && currentQuiz && (
          <ReviewList
            questions={currentQuiz.questions}
            userAnswers={userAnswers}
            onRestart={handleRestartQuiz}
            onGoHome={handleGoHome}
          />
        )}
      </main>

      {/* Trustworthy Business Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 shrink-0">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <div className="flex justify-center items-center gap-4 text-slate-500 font-medium">
            <span>名刺交換</span>
            <span>•</span>
            <span>席次（タクシー・飲み会）</span>
            <span>•</span>
            <span>敬語と言葉遣い</span>
            <span>•</span>
            <span>テーブルマナー</span>
            <span>•</span>
            <span>訪問対応</span>
          </div>
          <p>© 2026 社会人マナー学習ゲーム PRO. 全ての実践に裏付けられたビジネススキルを。</p>
        </div>
      </footer>

      {/* Custom Confirmation Modal for resetting stats and starting from beginning */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 relative z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-900 font-sans">学習データの初期化</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">
                  これまでの学習データ（総合進捗サマリー、学習継続傾向、各ジャンルの正答率・回答履歴など）がすべて完全に削除され、最初からスタートになります。
                </p>
                <div className="text-xs font-bold text-rose-600 bg-rose-50/50 p-3 rounded-lg border border-rose-100/50">
                  ※この操作は取り消せません。本当に初期化しますか？
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                id="cancel_reset_btn"
                onClick={() => {
                  playClickSound();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="button"
                id="confirm_reset_btn"
                onClick={executeResetStats}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" style={{ animationDuration: '3s' }} />
                完全に初期化する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
