// Shared Types for AI Coding Tutor

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export interface CodeAnalysisResult {
  explanation: string;
  performanceScore: number;
  maintainabilityScore: number;
  keyShortcomings: string[];
  optimizationsList: string;
  refactoredCode: string;
}

export interface Exercise {
  title: string;
  description: string;
  startingCode: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Facile' | 'Intermedio' | 'Difficile';
  category: 'React' | 'JavaScript' | 'HTML' | 'CSS' | 'Tailwind';
  requirements: string[];
}

export interface ExerciseReview {
  score: number;
  feedback: string;
  keyCorrections: string[];
  optimizedListing: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActive: string | null;
  solvedExercisesCount: number;
  masteredTopics: string[];
}
