import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  RotateCcw,
  Flame,
  ArrowRight
} from 'lucide-react';
import type { QuizQuestion, UserAccount } from '../types/ecosort.ts';
import { fetchQuizQuestions } from '../services/apiClient.ts';

interface SustainabilityQuizProps {
  currentUser: UserAccount;
  onRewardCredits: (credits: number) => void;
}

export const SustainabilityQuiz: React.FC<SustainabilityQuizProps> = ({
  currentUser,
  onRewardCredits
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [streakCount, setStreakCount] = useState(3);

  useEffect(() => {
    fetchQuizQuestions().then(setQuestions).catch(() => {});
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || hasSubmitted) return;
    setHasSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreakCount(prev => prev + 1);
      onRewardCredits(10);
    } else {
      setStreakCount(1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setScore(0);
    setIsQuizComplete(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-lime-400" />
              Gamified Circularity Training
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
              Sustainability & Sorting Quiz
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Test your knowledge of the 4 streams, contamination traps, and packaging recyclability to earn daily bonus eco-credits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Streak</div>
                <div className="text-base font-mono font-bold">{streakCount} Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isQuizComplete && currentQ ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="font-mono text-emerald-400">
              Current Score: {score}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="py-2">
            <span className="text-xs font-mono uppercase text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
              {currentQ.category} stream rule
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-3">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let style = 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-200';
              if (isSelected && !hasSubmitted) {
                style = 'border-emerald-500 bg-emerald-950/30 text-white';
              } else if (hasSubmitted) {
                if (isCorrect) {
                  style = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-semibold';
                } else if (isSelected && !isCorrect) {
                  style = 'border-red-500 bg-red-950/50 text-red-200';
                } else {
                  style = 'border-slate-800/50 bg-slate-950/40 text-slate-500 opacity-60';
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs text-slate-300 font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm">{opt}</span>
                  </div>

                  {hasSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {hasSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Box */}
          {hasSubmitted && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
              selectedOption === currentQ.correctIndex
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            }`}>
              <div className="font-mono uppercase font-bold flex items-center gap-1.5">
                {selectedOption === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Correct! +10 Eco-Credits Awarded
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-amber-400" />
                    Important Sorting Rule
                  </>
                )}
              </div>
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            {!hasSubmitted ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleConfirmAnswer}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Quiz'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Quiz Complete Screen */
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/60 p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-3xl font-display font-extrabold text-white">
              Quiz Completed!
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              You scored <span className="text-emerald-400 font-bold font-mono">{score}</span> out of {questions.length} questions correctly.
            </p>
          </div>

          <div className="p-4 max-w-sm mx-auto rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
            +{score * 10} Eco-Credits added to your wallet
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Challenge</span>
          </button>
        </div>
      )}

    </div>
  );
};
