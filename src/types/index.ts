// src/types/index.ts
export interface WordData {
  id: string;
  word: string;         // Từ hoàn chỉnh
  initial: string;      // Phụ âm đầu
  rhyme: string;        // Vần
  tone: string;         // Dấu thanh
  category: string;     // Chủ đề
  difficulty: number;   // Độ khó (1 - 3)
  confusions: string[]; // Các âm/vần dễ nhầm
  image: string;        // Hình minh họa trực quan (Emoji/Icon)
  errorGroup?: string;  // Nhóm lỗi chính tả (VD: "l/n", "s/x", "ch/tr", "d/gi/r", "vần")
}

export interface MistakeStat {
  initialErrors: number;     // Số lần sai phụ âm đầu
  rhymeErrors: number;       // Số lần sai vần
  toneErrors: number;        // Số lần sai dấu thanh
  groupCounts: Record<string, number>; // Thống kê theo nhóm lỗi: "s/x", "ch/tr", "l/n"...
  wrongWordIds: string[];    // Danh sách ID các từ học sinh đã làm sai để ôn tập cá nhân hóa
}

export interface PracticeHistory {
  timestamp: string;
  word: string;
  selected: string;
  isCorrect: boolean;
  errorDetail: string;
}

export interface StudentProfile {
  name: string;
  className: string;
  score: number;
  streak: number;
  maxStreak: number;
  badges: string[];
  mistakes: MistakeStat;
  history: PracticeHistory[];
}
// src/types/index.ts
export type ErrorCategory = 's/x' | 'ch/tr' | 'l/n' | 'd/gi/r' | 'vần' | 'thanh';

export interface WordData {
  id: string;
  word: string;               // Từ hoàn chỉnh
  initial: string;            // Phụ âm đầu
  rhyme: string;              // Vần
  tone: string;               // Dấu thanh
  category: string;           // Chủ đề
  difficulty: number;         // Độ khó (1 - 3)
  confusions: string[];       // Các âm/vần gây nhiễu
  confusionGroup?: 's/x' | 'ch/tr' | 'l/n' | 'd/gi/r'; // Nhóm lỗi phụ âm phổ biến
  image: string;              // Hình ảnh minh họa (Emoji trực quan)
}

export interface ErrorLogItem {
  timestamp: string;
  studentName: string;
  word: string;
  selected: string;
  errorTypes: ErrorCategory[];
}

export interface StudentRecord {
  studentName: string;
  className: string;
  score: number;
  maxStreak: number;
  completedWords: number;
  errorCounts: Record<ErrorCategory, number>;
  wrongWordIds: string[];
  history: ErrorLogItem[];
}

export type UserRole = 'student' | 'teacher' | 'parent';