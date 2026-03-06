export interface HealthModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  illustration?: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetCount: number;
  unit: string;
}

export interface UserProgress {
  xp: number;
  level: string;
  streak: number;
  completedModules: string[];
  quizScores: Record<string, number>;
  dailyHabits: Record<string, string[]>; // date string -> habit id list
}

export interface SeasonalTip {
  season: string;
  description: string;
  icon: string;
  chapters: SeasonalChapter[];
}

export interface SeasonalChapter {
  title: string;
  content: string;
  image: string;
}

export type Screen = 'splash' | 'dashboard' | 'learn' | 'quiz' | 'routine' | 'seasonal' | 'schemes' | 'profile' | 'chat';
