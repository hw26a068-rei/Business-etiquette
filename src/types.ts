export type CategoryId = 'card' | 'seating' | 'language' | 'table_manner' | 'visit';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  description: string;
  iconName: string;
  colorClass: string;
}

export type DiagramType = 'taxi' | 'meeting_room' | 'round_table' | 'elevator' | 'card_exchange';

export interface DragDropItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  colorClass: string;
}

export interface DragDropSlot {
  id: string;
  name: string;
  rankLabel: string;
  correctItemId: string; // If empty string, it means this slot should stay empty
}

export interface DragDropConfig {
  items: DragDropItem[];
  slots: DragDropSlot[];
  backgroundType: DiagramType;
}

export interface Question {
  id: string;
  category: CategoryId;
  categoryLabel: string;
  title: string;
  scenario: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  diagramType?: DiagramType;
  dragDropConfig?: DragDropConfig;
}

export interface QuizSession {
  mode: 'category' | 'random';
  categoryId?: CategoryId;
  questions: Question[];
  currentIndex: number;
  userAnswers: { questionId: string; selectedIndex: number; isCorrect: boolean; dragDropPlacement?: Record<string, string> }[];
  startTime: number;
}

export interface UserStats {
  totalSessions: number;
  totalAnswered: number;
  totalCorrect: number;
  categoryStats: Record<CategoryId, { answered: number; correct: number }>;
  history: {
    date: string; // YYYY-MM-DD
    correctCount: number;
    totalCount: number;
    sessionMode: string;
  }[];
}
