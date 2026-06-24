import React, { useState } from 'react';
import { Question, CategoryId } from '../types';
import { MannersDiagram } from './MannersDiagram';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  Award,
  AlertCircle
} from 'lucide-react';

interface QuizRunnerProps {
  mode: 'category' | 'random';
  categoryLabel?: string;
  questions: Question[];
  onFinishQuiz: (answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[]) => void;
  onQuit: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  mode,
  categoryLabel,
  questions,
  onFinishQuiz,
  onQuit
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; selectedIndex: number; isCorrect: boolean; dragDropPlacement?: Record<string, string> }[]>([]);

  // Drag and drop local state
  const [dragDropPlacement, setDragDropPlacement] = useState<Record<string, string>>({});
  const [isPlacementComplete, setIsPlacementComplete] = useState(false);

  // Reset placement on index change
  React.useEffect(() => {
    setDragDropPlacement({});
    setIsPlacementComplete(false);
  }, [currentIndex]);

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">問題がありません</h3>
        <p className="text-sm text-slate-500 mt-2">
          選択されたカテゴリーに登録されている問題が見つかりませんでした。
        </p>
        <button 
          onClick={onQuit}
          className="mt-6 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors cursor-pointer"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleOptionClick = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handlePlacementChange = (newPlacement: Record<string, string>, isComplete: boolean) => {
    if (isAnswered) return;
    setDragDropPlacement(newPlacement);
    setIsPlacementComplete(isComplete);
  };

  const handleConfirmAnswer = () => {
    if (isAnswered) return;

    let isCorrect = false;
    let finalSelectedIndex = -1;

    if (currentQuestion.dragDropConfig) {
      // Evaluate drag and drop correctness
      isCorrect = currentQuestion.dragDropConfig.slots.every(slot => {
        const placedItemId = dragDropPlacement[slot.id] || '';
        return placedItemId === slot.correctItemId;
      });
      finalSelectedIndex = isCorrect ? 0 : -1;
      setSelectedOption(finalSelectedIndex);
    } else {
      if (selectedOption === null) return;
      isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
      finalSelectedIndex = selectedOption;
    }

    setIsAnswered(true);

    const newAnswer = {
      questionId: currentQuestion.id,
      selectedIndex: finalSelectedIndex,
      isCorrect,
      dragDropPlacement: currentQuestion.dragDropConfig ? dragDropPlacement : undefined
    };

    setUserAnswers(prev => [...prev, newAnswer]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished all questions
      const finalAnswers = [...userAnswers];
      // Just in case check
      if (finalAnswers.length < questions.length) {
        let isCorrect = false;
        let finalSelectedIndex = -1;
        if (currentQuestion.dragDropConfig) {
          isCorrect = currentQuestion.dragDropConfig.slots.every(slot => {
            const placedItemId = dragDropPlacement[slot.id] || '';
            return placedItemId === slot.correctItemId;
          });
          finalSelectedIndex = isCorrect ? 0 : -1;
        } else if (selectedOption !== null) {
          isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
          finalSelectedIndex = selectedOption;
        }
        finalAnswers.push({
          questionId: currentQuestion.id,
          selectedIndex: finalSelectedIndex,
          isCorrect,
          dragDropPlacement: currentQuestion.dragDropConfig ? dragDropPlacement : undefined
        });
      }
      onFinishQuiz(finalAnswers);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onQuit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          中断して戻る
        </button>

        <div className="text-xs text-slate-500 font-semibold font-sans">
          トレーニングモード: <span className="text-slate-800">{mode === 'random' ? 'ランダム10問特訓' : `${categoryLabel || 'カテゴリー別'}特訓`}</span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">
            進行度: 第 {currentIndex + 1} / {questions.length} 問
          </span>
          <span className="font-bold text-slate-700 font-mono">
            {progressPercent}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-slate-700 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Main Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Category Label and Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            {currentQuestion.categoryLabel}
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 leading-snug">
            {currentQuestion.title}
          </h3>
        </div>

        {/* Scenario/Situation Description */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
          <p className="text-sm text-slate-700 leading-relaxed font-sans font-medium whitespace-pre-wrap">
            {currentQuestion.scenario}
          </p>
        </div>

        {/* Render Interactive Diagram if exists */}
        {currentQuestion.diagramType && (
          <div className="py-0">
            <MannersDiagram
              type={currentQuestion.diagramType}
              selectedAnswerIndex={selectedOption}
              isAnswered={isAnswered}
              correctAnswerIndex={currentQuestion.correctAnswerIndex}
              dragDropConfig={currentQuestion.dragDropConfig}
              placement={dragDropPlacement}
              onPlacementChange={handlePlacementChange}
            />
          </div>
        )}

        {/* Options List - Only shown for standard questions */}
        {!currentQuestion.dragDropConfig && (
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">選択肢</span>
            
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrectAnswer = currentQuestion.correctAnswerIndex === index;

              let optionStyle = "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer";
              if (isSelected) {
                optionStyle = "border-slate-800 bg-slate-50 text-slate-900 font-medium";
              }

              if (isAnswered) {
                optionStyle = "border-slate-200 opacity-60 bg-white text-slate-500 cursor-not-allowed";
                if (isCorrectAnswer) {
                  optionStyle = "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold shadow-2xs";
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = "border-rose-500 bg-rose-50/50 text-rose-950 font-semibold";
                }
              }

              return (
                <button
                  key={index}
                  disabled={isAnswered}
                  onClick={() => handleOptionClick(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 text-sm leading-relaxed ${optionStyle}`}
                >
                  {/* Visual choice indicator */}
                  <span className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isAnswered && isCorrectAnswer
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isAnswered && isSelected && !isCorrectAnswer
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : isSelected
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + index)} {/* A, B, C... */}
                  </span>
                  
                  <span className="flex-1">{option}</span>

                  {/* Status icon helper */}
                  {isAnswered && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Button: Confirm or Next */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          {!isAnswered ? (
            <button
              id="confirm_answer_btn"
              disabled={currentQuestion.dragDropConfig ? !isPlacementComplete : selectedOption === null}
              onClick={handleConfirmAnswer}
              className={`font-bold py-3 px-6 rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                (currentQuestion.dragDropConfig ? isPlacementComplete : selectedOption !== null)
                  ? 'bg-slate-800 hover:bg-slate-900 text-white hover:shadow-md'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              回答を確定する
            </button>
          ) : (
            <button
              id="next_question_btn"
              onClick={handleNextQuestion}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs group"
            >
              {currentIndex + 1 < questions.length ? '次の問題へ' : '結果を見る'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Answer Explanation Box (Revealed upon answered) */}
      {isAnswered && (() => {
        const isUserCorrect = currentQuestion.dragDropConfig 
          ? (selectedOption === 0) 
          : (selectedOption === currentQuestion.correctAnswerIndex);

        return (
          <div className={`rounded-2xl border p-5 md:p-6 shadow-sm transition-all duration-300 ${
            isUserCorrect
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/30 border-rose-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-2.5 mb-3 border-b border-slate-200/50 pb-2.5">
              <BookOpen className={`w-5 h-5 ${
                isUserCorrect ? 'text-emerald-700' : 'text-slate-500'
              }`} />
              <h4 className="text-base font-bold font-sans">
                {isUserCorrect ? '正解です！解説・マナー解説' : '不正解です…解説・マナー解説'}
              </h4>
            </div>
            
            <div className="space-y-3 text-sm leading-relaxed text-slate-700 font-sans font-medium">
              <p className="whitespace-pre-wrap">{currentQuestion.explanation}</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
