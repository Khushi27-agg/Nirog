/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Apple, 
  Activity, 
  Droplets, 
  Sun, 
  Footprints, 
  Moon, 
  BookOpen, 
  Trophy, 
  User, 
  MessageCircle, 
  ChevronRight, 
  CheckCircle2, 
  Search, 
  Image as ImageIcon,
  Brain,
  Video,
  ArrowLeft,
  X,
  Send,
  Loader2,
  ExternalLink,
  Flame,
  ShieldCheck,
  Zap,
  XCircle
} from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

import { ArogyaMascot } from './components/ArogyaMascot';
import { geminiService } from './services/geminiService';
import { 
  HEALTH_MODULES, 
  HABITS, 
  QUIZZES, 
  SEASONAL_TIPS, 
  GOVT_SCHEMES 
} from './constants';
import { 
  Screen, 
  UserProgress, 
  HealthModule, 
  Quiz, 
  Question 
} from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Proceed after triggering
    }
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    xp: 0,
    level: 'Health Beginner',
    streak: 3,
    completedModules: [],
    quizScores: {},
    dailyHabits: {
      [format(new Date(), 'yyyy-MM-dd')]: []
    }
  });

  const [selectedModule, setSelectedModule] = useState<HealthModule | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ text: string, sources: string[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const [thinkingQuery, setThinkingQuery] = useState('');
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showDailyFact, setShowDailyFact] = useState(false);
  const [showModuleCelebration, setShowModuleCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ title: string, message: string } | null>(null);
  const [showQuizTip, setShowQuizTip] = useState(false);
  const [activeQuizTip, setActiveQuizTip] = useState('');
  const [pendingQuizModuleId, setPendingQuizModuleId] = useState<string | null>(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [quizStreak, setQuizStreak] = useState(0);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('dashboard');
        setShowDailyFact(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleHabitToggle = (habitId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentHabits = userProgress.dailyHabits[today] || [];
    
    let newHabits;
    if (currentHabits.includes(habitId)) {
      newHabits = currentHabits.filter(id => id !== habitId);
    } else {
      newHabits = [...currentHabits, habitId];
      triggerHaptic([15, 5, 15]); // Subtle double tap for completion
    }

    setUserProgress(prev => ({
      ...prev,
      dailyHabits: {
        ...prev.dailyHabits,
        [today]: newHabits
      }
    }));
  };

  const handleQuizStart = (moduleId: string) => {
    const quiz = QUIZZES.find(q => q.moduleId === moduleId);
    if (quiz) {
      const tips = [
        "Take your time! Read each question carefully. You've got this! 🐘",
        "Don't worry if you're unsure, just pick the best answer. Learning is the goal! 🎓",
        "Trust your instincts! You learned a lot in the module. 🌟",
        "Arogya is cheering for you! Let's see what you've learned! 🐘✨"
      ];
      setActiveQuizTip(tips[Math.floor(Math.random() * tips.length)]);
      setPendingQuizModuleId(moduleId);
      setShowQuizTip(true);
    }
  };

  const startQuizAfterTip = () => {
    if (pendingQuizModuleId) {
      const quiz = QUIZZES.find(q => q.moduleId === pendingQuizModuleId);
      if (quiz) {
        setActiveQuiz(quiz);
        setQuizStep(0);
        setQuizAnswers([]);
        setShowQuizResult(false);
        setCurrentScreen('quiz');
      }
    }
    setShowQuizTip(false);
  };

  const handleCompleteModule = (module: HealthModule) => {
    const messages: Record<string, string> = {
      nutrition: "Fantastic! You're on your way to becoming a nutrition expert. Remember, a colorful plate is a healthy plate! 🍎🥦",
      heart: "Great job! Your heart is cheering for you. Keep moving and stay active! ❤️🏃‍♂️",
      diabetes: "Excellent! Understanding blood sugar is the first step to a healthier life. Knowledge is power! 🩸💪",
      mental: "Wonderful! Taking care of your mind is just as important as your body. Stay mindful! 🧘‍♂️✨",
      sleep: "Sleep well, live well! You've mastered the art of rest. Sweet dreams! 😴🌙",
      hygiene: "Clean hands, healthy life! You're a pro at prevention now. Stay safe! 🧼✨"
    };

    setCelebrationData({
      title: module.title,
      message: messages[module.id] || "Amazing work! You've completed another step towards a healthier you! 🐘✨"
    });

    setUserProgress(prev => ({
      ...prev,
      completedModules: prev.completedModules.includes(module.id) 
        ? prev.completedModules 
        : [...prev.completedModules, module.id],
      xp: prev.xp + 50
    }));

    setShowModuleCelebration(true);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (isProcessingAnswer) return;
    setIsProcessingAnswer(true);
    setSelectedAnswerIndex(answerIndex);
    
    const isCorrect = answerIndex === activeQuiz?.questions[quizStep].correctAnswer;
    setIsAnswerCorrect(isCorrect);
    
    if (isCorrect) {
      triggerHaptic(20);
      setQuizStreak(prev => prev + 1);
    } else {
      setQuizStreak(0);
    }

    setTimeout(() => {
      const newAnswers = [...quizAnswers, answerIndex];
      setQuizAnswers(newAnswers);
      setSelectedAnswerIndex(null);
      setIsAnswerCorrect(null);
      setIsProcessingAnswer(false);

      if (quizStep < (activeQuiz?.questions.length || 0) - 1) {
        setQuizStep(prev => prev + 1);
      } else {
        // Calculate score
        const correctCount = newAnswers.reduce((acc, ans, idx) => {
          return acc + (ans === activeQuiz!.questions[idx].correctAnswer ? 1 : 0);
        }, 0);
        
        const score = Math.round((correctCount / activeQuiz!.questions.length) * 100);
        const xpGained = correctCount * 50;

        setUserProgress(prev => {
          const newXp = prev.xp + xpGained;
          let newLevel = prev.level;
          if (newXp > 1000) newLevel = 'Nirog Master';
          else if (newXp > 500) newLevel = 'Wellness Champion';
          else if (newXp > 200) newLevel = 'Health Explorer';

          return {
            ...prev,
            xp: newXp,
            level: newLevel,
            quizScores: { ...prev.quizScores, [activeQuiz!.id]: score }
          };
        });

        setShowQuizResult(true);
      }
    }, 1200);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await geminiService.chat(userMsg, chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] })));
      setChatMessages(prev => [...prev, { role: 'model', text: response || 'I am sorry, I could not process that.' }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await geminiService.searchHealthInfo(searchQuery);
      setSearchResults(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setGeneratedVideo(null);
    try {
      const img = await geminiService.generateHealthImage(imagePrompt);
      setGeneratedImage(img);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedImage) return;
    setIsGeneratingVideo(true);
    try {
      const base64 = generatedImage.split(',')[1];
      const videoUri = await geminiService.generateHealthVideo(base64, imagePrompt);
      setGeneratedVideo(videoUri || null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleThinking = async () => {
    if (!thinkingQuery.trim()) return;
    setIsThinking(true);
    try {
      const result = await geminiService.complexHealthReasoning(thinkingQuery);
      setThinkingResult(result || null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
    }
  };

  const renderSplashScreen = () => (
    <div className="fixed inset-0 bg-teal-500 flex flex-col items-center justify-center text-white p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <ArogyaMascot size="xl" expression="waving" className="mb-8" />
        <h1 className="text-6xl font-bold tracking-tighter mb-2">Nirog</h1>
        <p className="text-teal-100 text-lg font-medium">Build healthy habits, one step at a time.</p>
      </motion.div>
    </div>
  );

  const renderDashboard = () => (
    <div className="pb-24">
      <header className="bg-white p-6 rounded-b-3xl shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Namaste, Khushi!</h2>
            <p className="text-slate-500">Ready for your wellness journey?</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-bold text-orange-700">{userProgress.streak} Day Streak</span>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6">
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setCurrentScreen('learn')}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2 hover:bg-teal-50 transition-colors"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-700 text-sm">Learn Module</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('routine')}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2 hover:bg-teal-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-700 text-sm">Today's Routine</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('seasonal')}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2 hover:bg-teal-50 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <Sun className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-700 text-sm">Seasonal Tips</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('schemes')}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2 hover:bg-teal-50 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <Heart className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-700 text-sm">Govt Schemes</span>
            </button>
          </div>
        </section>

        <section className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">AI Health Assistant</h3>
            <p className="text-slate-400 text-sm mb-4">Ask Arogya anything about your health or generate wellness visuals.</p>
            <button 
              onClick={() => setCurrentScreen('chat')}
              className="bg-teal-500 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-teal-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Start Chatting
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <ArogyaMascot size="lg" />
          </div>
        </section>
      </main>
    </div>
  );

  const renderLearn = () => (
    <div className="pb-24">
      <header className="p-6 flex items-center gap-4">
        <button onClick={() => setCurrentScreen('dashboard')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Learn Modules</h2>
      </header>

      <main className="px-6 space-y-4">
        {selectedModule ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => setSelectedModule(null)} className="text-teal-600 font-bold text-sm mb-4 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Modules
            </button>
            <div className={cn("p-6 rounded-3xl text-white mb-6", selectedModule.color)}>
              <h3 className="text-2xl font-bold mb-2">{selectedModule.title}</h3>
              <p className="opacity-90">{selectedModule.description}</p>
            </div>
            
            <div className="space-y-6">
              {selectedModule.lessons.map((lesson, idx) => (
                <div key={lesson.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-800">{lesson.title}</h4>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{lesson.content}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 mt-8">
              {!userProgress.completedModules.includes(selectedModule.id) && (
                <button 
                  onClick={() => handleCompleteModule(selectedModule)}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Mark Module as Completed
                </button>
              )}
              
              <button 
                onClick={() => handleQuizStart(selectedModule.id)}
                className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Take Module Quiz
              </button>
            </div>
          </motion.div>
        ) : (
          HEALTH_MODULES.map(module => (
            <button 
              key={module.id}
              onClick={() => setSelectedModule(module)}
              className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-teal-200 transition-all text-left"
            >
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white", module.color)}>
                {module.id === 'nutrition' && <Apple className="w-7 h-7" />}
                {module.id === 'heart' && <Heart className="w-7 h-7" />}
                {module.id === 'diabetes' && <Activity className="w-7 h-7" />}
                {module.id === 'mental' && <Brain className="w-7 h-7" />}
                {module.id === 'sleep' && <Moon className="w-7 h-7" />}
                {module.id === 'hygiene' && <ShieldCheck className="w-7 h-7" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{module.title}</h3>
                <p className="text-xs text-slate-500">{module.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          ))
        )}
      </main>
    </div>
  );

  const renderQuiz = () => {
    if (!activeQuiz) return null;
    const currentQuestion = activeQuiz.questions[quizStep];

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="p-6 flex items-center justify-between">
          <button onClick={() => {
            setCurrentScreen('learn');
            setQuizStreak(0);
          }} className="p-2 hover:bg-slate-200 rounded-full">
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${((quizStep + 1) / activeQuiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {quizStreak > 1 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-bold"
              >
                <Zap className="w-3 h-3 fill-current" />
                {quizStreak}
              </motion.div>
            )}
            <span className="font-bold text-slate-500">{quizStep + 1}/{activeQuiz.questions.length}</span>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col">
          {!showQuizResult ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={quizStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-8 text-center">
                  <ArogyaMascot 
                    size="md" 
                    expression={
                      isAnswerCorrect === true ? 'celebrating' : 
                      isAnswerCorrect === false ? 'thinking' : 
                      'thinking'
                    } 
                    className="mb-4 mx-auto" 
                  />
                  {isAnswerCorrect !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "text-lg font-black mb-2 uppercase tracking-widest",
                        isAnswerCorrect ? "text-emerald-500" : "text-rose-500"
                      )}
                    >
                      {isAnswerCorrect ? "Correct! ✨" : "Not quite! 🐘"}
                    </motion.div>
                  )}
                  <h3 className="text-xl font-bold text-slate-800">{currentQuestion.text}</h3>
                </div>

                <div className="space-y-3 mt-auto">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswerIndex === idx;
                    const isCorrectOption = idx === currentQuestion.correctAnswer;
                    
                    let buttonClass = "w-full p-4 bg-white border-2 rounded-2xl font-medium text-slate-700 transition-all text-left flex items-center justify-between";
                    
                    if (isAnswerCorrect !== null) {
                      if (isCorrectOption) {
                        buttonClass += " border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100";
                      } else if (isSelected && !isAnswerCorrect) {
                        buttonClass += " border-rose-500 bg-rose-50 text-rose-700";
                      } else {
                        buttonClass += " border-slate-100 opacity-50";
                      }
                    } else {
                      buttonClass += " border-slate-200 hover:border-teal-500 hover:bg-teal-50";
                    }

                    return (
                      <button 
                        key={idx}
                        disabled={isProcessingAnswer}
                        onClick={() => handleQuizAnswer(idx)}
                        className={buttonClass}
                      >
                        <span>{option}</span>
                        {isAnswerCorrect !== null && isCorrectOption && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        {isAnswerCorrect === false && isSelected && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <ArogyaMascot size="lg" expression="celebrating" className="mb-6" />
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
              <p className="text-slate-500 mb-8">You've earned 100 XP and improved your health knowledge.</p>
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 w-full max-w-xs mb-8">
                <div className="text-4xl font-black text-teal-500 mb-1">+{userProgress.xp}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total XP</div>
              </div>

              <button 
                onClick={() => setCurrentScreen('learn')}
                className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-colors"
              >
                Continue Learning
              </button>
            </motion.div>
          )}
        </main>
      </div>
    );
  };

  const renderRoutine = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const completedHabits = userProgress.dailyHabits[today] || [];

    return (
      <div className="pb-24">
        <header className="p-6 flex items-center gap-4">
          <button onClick={() => setCurrentScreen('dashboard')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Daily Routine</h2>
        </header>

        <main className="px-6 space-y-6">
          <div className="bg-blue-500 p-6 rounded-3xl text-white">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold">Dinacharya</h3>
                <p className="text-blue-100 text-sm">Track your daily wellness habits.</p>
              </div>
              <div className="text-3xl font-black">{Math.round((completedHabits.length / HABITS.length) * 100)}%</div>
            </div>
            <div className="h-2 bg-blue-400/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${(completedHabits.length / HABITS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {HABITS.map(habit => {
              const isCompleted = completedHabits.includes(habit.id);
              return (
                <button 
                  key={habit.id}
                  onClick={() => handleHabitToggle(habit.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left",
                    isCompleted ? "bg-teal-50 border-teal-200" : "bg-white border-slate-100"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isCompleted ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {habit.id === 'water' && <Droplets className="w-6 h-6" />}
                    {habit.id === 'sunlight' && <Sun className="w-6 h-6" />}
                    {habit.id === 'walk' && <Footprints className="w-6 h-6" />}
                    {habit.id === 'sleep' && <Moon className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn("font-bold", isCompleted ? "text-teal-900" : "text-slate-800")}>{habit.name}</h4>
                    <p className="text-xs text-slate-500">{habit.description}</p>
                  </div>
                  {isCompleted && <CheckCircle2 className="w-6 h-6 text-teal-500" />}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  };

  const renderSeasonal = () => (
    <div className="pb-24">
      <header className="p-6 flex items-center gap-4 sticky top-0 bg-slate-50 z-10">
        <button onClick={() => setCurrentScreen('dashboard')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Ritucharya</h2>
      </header>

      <main className="px-6 space-y-8">
        <div className="bg-teal-50 p-6 rounded-3xl border border-teal-100">
          <div className="flex items-center gap-4 mb-2">
            <ArogyaMascot size="sm" expression="happy" />
            <h3 className="font-bold text-teal-900">Seasonal Wisdom</h3>
          </div>
          <p className="text-teal-800 text-sm leading-relaxed">
            Ritucharya is the Ayurvedic practice of seasonal living. By aligning our diet and lifestyle with the rhythms of nature, we maintain balance and prevent disease.
          </p>
        </div>
        
        {SEASONAL_TIPS.map((item, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                {item.icon === 'SunMedium' && <Sun className="w-6 h-6" />}
                {item.icon === 'CloudRain' && <Activity className="w-6 h-6" />}
                {item.icon === 'Snowflake' && <Moon className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-xl">{item.season}</h3>
                <p className="text-xs text-slate-500 font-medium">{item.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {item.chapters.map((chapter, cIdx) => (
                <div key={cIdx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group">
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={chapter.image} 
                      alt={chapter.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <h4 className="text-white font-bold">{chapter.title}</h4>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {chapter.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );

  const renderSchemes = () => (
    <div className="pb-24">
      <header className="p-6 flex items-center gap-4">
        <button onClick={() => setCurrentScreen('dashboard')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Govt Health Schemes</h2>
      </header>

      <main className="px-6 space-y-4">
        {GOVT_SCHEMES.map((scheme, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">{scheme.name}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{scheme.description}</p>
            <a 
              href={scheme.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-600 font-bold text-sm flex items-center gap-1 hover:underline"
            >
              Learn More <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </main>
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
        <button onClick={() => setCurrentScreen('dashboard')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-teal-100 rounded-full overflow-hidden">
            <ArogyaMascot size="sm" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Arogya AI</h2>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-12">
            <ArogyaMascot size="lg" expression="happy" className="mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Namaste!</h3>
            <p className="text-slate-500 text-sm max-w-[240px] mx-auto">
              I'm Arogya, your health guide. Ask me anything about nutrition, exercise, or wellness!
            </p>
            
            <div className="mt-8 grid grid-cols-1 gap-2">
              <button 
                onClick={() => setChatInput("What are some healthy breakfast options?")}
                className="bg-white p-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-teal-300"
              >
                "Healthy breakfast options?"
              </button>
              <button 
                onClick={() => setChatInput("Explain Ayushman Bharat scheme")}
                className="bg-white p-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-teal-300"
              >
                "Explain Ayushman Bharat"
              </button>
            </div>
          </div>
        )}

        {chatMessages.map((msg, idx) => (
          <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm",
              msg.role === 'user' ? "bg-teal-500 text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm"
            )}>
              <Markdown>{msg.text}</Markdown>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* AI Tools Bar */}
      <div className="px-4 py-2 bg-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => {
            setSearchQuery(chatInput || 'Latest health news India');
            handleSearch();
          }}
          className="flex-shrink-0 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1.5 hover:bg-teal-50"
        >
          <Search className="w-3.5 h-3.5" /> Search Info
        </button>
        <button 
          onClick={() => {
            setImagePrompt(chatInput || 'A happy person eating a healthy salad');
            handleGenerateImage();
          }}
          className="flex-shrink-0 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1.5 hover:bg-teal-50"
        >
          <ImageIcon className="w-3.5 h-3.5" /> Generate Image
        </button>
        <button 
          onClick={() => {
            setThinkingQuery(chatInput || 'Deep analysis of diabetes risk factors in India');
            handleThinking();
          }}
          className="flex-shrink-0 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1.5 hover:bg-teal-50"
        >
          <Brain className="w-3.5 h-3.5" /> Deep Thinking
        </button>
      </div>

      {/* AI Results Overlay */}
      <AnimatePresence>
        {(searchResults || generatedImage || thinkingResult) && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-20 bg-white border-t border-slate-200 shadow-2xl z-20 max-h-[70vh] overflow-y-auto rounded-t-3xl"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {searchResults && <><Search className="w-4 h-4" /> Search Results</>}
                {generatedImage && <><ImageIcon className="w-4 h-4" /> Generated Visual</>}
                {thinkingResult && <><Brain className="w-4 h-4" /> Deep Analysis</>}
              </h3>
              <button 
                onClick={() => {
                  setSearchResults(null);
                  setGeneratedImage(null);
                  setThinkingResult(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {searchResults && (
                <div className="space-y-4">
                  <div className="prose prose-sm text-slate-600">
                    <Markdown>{searchResults.text}</Markdown>
                  </div>
                  {searchResults.sources.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {searchResults.sources.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline truncate max-w-[200px]">
                            {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {generatedImage && (
                <div className="space-y-4 flex flex-col items-center">
                  <img src={generatedImage} alt="AI Generated" className="w-full rounded-2xl shadow-lg" />
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                      Animate with Veo
                    </button>
                  </div>
                  {generatedVideo && (
                    <div className="w-full mt-4">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Animated Video</p>
                      <video src={generatedVideo} controls className="w-full rounded-2xl shadow-lg" />
                    </div>
                  )}
                </div>
              )}

              {thinkingResult && (
                <div className="prose prose-sm text-slate-600">
                  <Markdown>{thinkingResult}</Markdown>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask Arogya anything..."
          className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500"
        />
        <button 
          onClick={handleSendMessage}
          disabled={isChatLoading || !chatInput.trim()}
          className="w-12 h-12 bg-teal-500 text-white rounded-2xl flex items-center justify-center hover:bg-teal-600 transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="pb-24">
      <header className="bg-white p-8 rounded-b-3xl shadow-sm mb-6 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-teal-100 rounded-full mb-4 overflow-hidden border-4 border-white shadow-md">
          <ArogyaMascot size="md" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Khushi Aggarwal</h2>
        <p className="text-teal-600 font-bold">{userProgress.level}</p>
        
        <div className="mt-6 w-full max-w-xs">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-1">
            <span>Progress to next level</span>
            <span>{userProgress.xp} / 1000 XP</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${(userProgress.xp / 1000) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
            <div className="text-2xl font-black text-orange-500">{userProgress.streak}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Day Streak</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
            <div className="text-2xl font-black text-teal-500">{userProgress.xp}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Total XP</div>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Achievements</h3>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Early Bird</h4>
                <p className="text-xs text-slate-500">Completed 3 daily routines in a row.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 opacity-50 grayscale">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Health Master</h4>
                <p className="text-xs text-slate-500">Complete all learning modules.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-teal-50 p-6 rounded-3xl border border-teal-100 flex items-center gap-4">
          <ArogyaMascot size="sm" bubbleText="You're doing great! Keep it up!" />
          <p className="text-sm text-teal-800 font-medium">
            "Every small step counts towards a healthier you. I'm proud of your progress!"
          </p>
        </div>
      </main>
    </div>
  );

  const renderNavigation = () => {
    if (['splash', 'quiz', 'chat'].includes(currentScreen)) return null;
    
    return (
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-30">
        <button 
          onClick={() => setCurrentScreen('dashboard')}
          className={cn("p-2 rounded-xl transition-colors", currentScreen === 'dashboard' ? "text-teal-500 bg-teal-50" : "text-slate-400")}
        >
          <Activity className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrentScreen('learn')}
          className={cn("p-2 rounded-xl transition-colors", currentScreen === 'learn' ? "text-teal-500 bg-teal-50" : "text-slate-400")}
        >
          <BookOpen className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrentScreen('chat')}
          className="w-14 h-14 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 -mt-10 border-4 border-white"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
        <button 
          onClick={() => setCurrentScreen('routine')}
          className={cn("p-2 rounded-xl transition-colors", currentScreen === 'routine' ? "text-teal-500 bg-teal-50" : "text-slate-400")}
        >
          <CheckCircle2 className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrentScreen('profile')}
          className={cn("p-2 rounded-xl transition-colors", currentScreen === 'profile' ? "text-teal-500 bg-teal-50" : "text-slate-400")}
        >
          <User className="w-6 h-6" />
        </button>
      </nav>
    );
  };

  if (!hasApiKey) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <ArogyaMascot size="lg" expression="thinking" className="mb-8" />
        <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
        <p className="text-slate-400 mb-8 max-w-xs">
          To use advanced AI features like high-quality image and video generation, you need to select a paid Gemini API key.
        </p>
        <button 
          onClick={handleOpenKeyDialog}
          className="bg-teal-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-all"
        >
          Select API Key
        </button>
        <p className="mt-6 text-xs text-slate-500">
          Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">billing and API keys</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100">
      <AnimatePresence mode="wait">
        {currentScreen === 'splash' && (
          <motion.div key="splash" exit={{ opacity: 0 }}>
            {renderSplashScreen()}
          </motion.div>
        )}
        
        {currentScreen === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {renderDashboard()}
          </motion.div>
        )}

        {currentScreen === 'learn' && (
          <motion.div key="learn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {renderLearn()}
          </motion.div>
        )}

        {currentScreen === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {renderQuiz()}
          </motion.div>
        )}

        {currentScreen === 'routine' && (
          <motion.div key="routine" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {renderRoutine()}
          </motion.div>
        )}

        {currentScreen === 'seasonal' && (
          <motion.div key="seasonal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {renderSeasonal()}
          </motion.div>
        )}

        {currentScreen === 'schemes' && (
          <motion.div key="schemes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {renderSchemes()}
          </motion.div>
        )}

        {currentScreen === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {renderProfile()}
          </motion.div>
        )}

        {currentScreen === 'chat' && (
          <motion.div key="chat" initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}>
            {renderChat()}
          </motion.div>
        )}
      </AnimatePresence>

      {renderNavigation()}

      {/* Daily Fact Mail Overlay */}
      <AnimatePresence>
        {showDailyFact && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FFFDF5] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border-8 border-white relative"
            >
              {/* Mail Header/Stamp */}
              <div className="absolute top-4 right-4 w-12 h-12 border-2 border-teal-200 rounded-lg flex items-center justify-center rotate-12 opacity-50">
                <div className="text-[8px] font-bold text-teal-800 text-center leading-none">NIROG<br/>HEALTH<br/>POST</div>
              </div>

              <div className="p-8 pt-12 flex flex-col items-center text-center">
                <div className="mb-6">
                  <ArogyaMascot size="md" expression="happy" />
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Daily Wellness Mail
                  </div>
                  <h3 className="text-2xl font-serif italic text-slate-800">Did you know?</h3>
                  <div className="h-px w-12 bg-teal-200 mx-auto" />
                  <p className="text-slate-600 leading-relaxed font-medium">
                    "Walking 30 minutes daily can significantly reduce heart disease risk and improve mental well-being."
                  </p>
                </div>

                <button 
                  onClick={() => setShowDailyFact(false)}
                  className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
              
              {/* Mail Texture/Lines */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-white to-orange-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module Completion Celebration Overlay */}
      <AnimatePresence>
        {showModuleCelebration && celebrationData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
              
              <div className="mb-6 relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ArogyaMascot size="lg" expression="celebrating" />
                </motion.div>
                {/* Confetti simulation */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i % 4],
                      left: '50%',
                      top: '50%'
                    }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200,
                      opacity: [1, 0],
                      scale: [1, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() }}
                  />
                ))}
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-2">Module Completed!</h2>
              <div className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-4">{celebrationData.title}</div>
              
              <p className="text-slate-600 mb-8 leading-relaxed">
                {celebrationData.message}
              </p>

              <div className="bg-emerald-50 p-4 rounded-2xl mb-8 flex items-center justify-center gap-3">
                <Trophy className="w-6 h-6 text-emerald-500" />
                <span className="font-bold text-emerald-700">+50 XP Earned</span>
              </div>

              <button 
                onClick={() => setShowModuleCelebration(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Start Tip Overlay */}
      <AnimatePresence>
        {showQuizTip && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <ArogyaMascot size="md" expression="waving" className="mb-6" />
                
                <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 mb-8 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Arogya's Tip
                  </div>
                  <p className="text-teal-900 font-medium leading-relaxed italic">
                    "{activeQuizTip}"
                  </p>
                </div>

                <button 
                  onClick={startQuizAfterTip}
                  className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
                >
                  Start Quiz
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
