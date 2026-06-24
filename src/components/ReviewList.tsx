import React from 'react';
import { Question } from '../types';
import { MannersDiagram } from './MannersDiagram';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  RefreshCw, 
  Home, 
  ChevronRight,
  BookOpenCheck
} from 'lucide-react';

interface ReviewListProps {
  questions: Question[];
  userAnswers: { questionId: string; selectedIndex: number; isCorrect: boolean; dragDropPlacement?: Record<string, string> }[];
  onRestart: () => void;
  onGoHome: () => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  questions,
  userAnswers,
  onRestart,
  onGoHome
}) => {
  const correctCount = userAnswers.filter(a => a.isCorrect).length;
  const totalCount = questions.length;
  const scorePercent = Math.round((correctCount / totalCount) * 100);

  // Evaluation feedback based on score
  const getFeedbackMessage = (percent: number) => {
    if (percent === 100) {
      return {
        title: '完璧なビジネスエリート！',
        subtitle: '全問正解！非の打ち所がない完璧なビジネスマナーを身につけています。周囲のお手本となる存在です。',
        color: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    }
    if (percent >= 80) {
      return {
        title: '大変素晴らしいマナーセンス！',
        subtitle: 'ほとんど正解です。自信を持って毎日のビジネスシーンを駆け抜けましょう！さらに上を目指すなら全問正解へ！',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    }
    if (percent >= 60) {
      return {
        title: 'あと一歩で一流社会人です',
        subtitle: '基本的なマナーは身についていますが、勘違いしやすいポイントがありました。解説をよく読んで復習しましょう。',
        color: 'text-sky-700 bg-sky-50 border-sky-200'
      };
    }
    return {
      title: 'マナー基礎知識を鍛え直しましょう',
      description: '少し間違いが多めでした。恥をかかないために、もう一度じっくりとカテゴリー別特訓でトレーニングを重ねましょう。',
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    };
  };

  const feedback = getFeedbackMessage(scorePercent);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Result score header card */}
      <div className={`border rounded-2xl p-6 text-center space-y-4 shadow-sm transition-all ${feedback.color}`}>
        <Award className="w-12 h-12 mx-auto" />
        
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-bold text-slate-400">マナートレーニング結果</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {feedback.title}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {feedback.subtitle}
          </p>
        </div>

        {/* Score count representation */}
        <div className="flex justify-center items-baseline gap-2 pt-2">
          <span className="text-sm text-slate-500 font-medium">正解数:</span>
          <span className="text-4xl font-extrabold font-mono tracking-tight text-slate-800">
            {correctCount}
          </span>
          <span className="text-xl text-slate-400 font-medium font-mono">/</span>
          <span className="text-xl text-slate-500 font-medium font-mono">
            {totalCount}
          </span>
          <span className="text-xs text-slate-400 ml-1 font-medium font-mono">
            (正解率 {scorePercent}%)
          </span>
        </div>

        {/* Navigation actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200/40">
          <button
            onClick={onRestart}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            もう一度挑戦する
          </button>
          
          <button
            onClick={onGoHome}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Home className="w-3.5 h-3.5" />
            ホームに戻る
          </button>
        </div>
      </div>

      {/* Review details header */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5 text-slate-500" />
          今回の問題の徹底振り返り・復習
        </h3>

        <div className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = userAnswers.find(a => a.questionId === question.id);
            const isCorrect = userAnswer?.isCorrect ?? false;
            const chosenIndex = userAnswer?.selectedIndex ?? -1;

            return (
              <div 
                key={question.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                {/* Review Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      第 {index + 1} 問
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      [{question.categoryLabel}]
                    </span>
                  </div>

                  {/* Correct/Incorrect badge */}
                  {isCorrect ? (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      正解
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      <XCircle className="w-3.5 h-3.5" />
                      不正解
                    </div>
                  )}
                </div>

                {/* Situation */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-800">
                    {question.title}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 font-medium">
                    {question.scenario}
                  </p>
                </div>

                {/* Seating diagram if has any */}
                {question.diagramType && (
                  <div className="my-2 max-w-md mx-auto scale-90 origin-top">
                    <MannersDiagram
                      type={question.diagramType}
                      selectedAnswerIndex={chosenIndex}
                      isAnswered={true}
                      correctAnswerIndex={question.correctAnswerIndex}
                      dragDropConfig={question.dragDropConfig}
                      placement={userAnswer?.dragDropPlacement}
                    />
                  </div>
                )}

                {/* Options and choices results - Only show for standard questions */}
                {!question.dragDropConfig && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">解答の記録</span>
                    <div className="grid grid-cols-1 gap-2">
                      {question.options.map((option, optIdx) => {
                        const isChosen = chosenIndex === optIdx;
                        const isCorrectAnswer = question.correctAnswerIndex === optIdx;

                        let optClass = "border-slate-100 text-slate-500 bg-slate-50/30 text-xs";
                        if (isCorrectAnswer) {
                          optClass = "border-emerald-300 bg-emerald-50/30 text-emerald-950 font-bold text-xs";
                        } else if (isChosen && !isCorrectAnswer) {
                          optClass = "border-rose-200 bg-rose-50/40 text-rose-950 text-xs";
                        }

                        return (
                          <div 
                            key={optIdx}
                            className={`p-3 rounded-lg border flex items-start gap-2 ${optClass}`}
                          >
                            <span className={`w-4 h-4 rounded-full border text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              isCorrectAnswer
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : isChosen && !isCorrectAnswer
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-slate-200 text-slate-500 border-slate-300'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-relaxed">{option}</span>
                            
                            {/* Visual badges for chosen and correct */}
                            {isChosen && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded self-center">
                                あなたの選択
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded self-center">
                                正解
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Explanation block */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    解説・マナー講義
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                    {question.explanation}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Final back action */}
      <div className="pt-6 border-t border-slate-200 flex justify-center">
        <button
          onClick={onGoHome}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          ホーム画面に戻る
        </button>
      </div>
    </div>
  );
};
