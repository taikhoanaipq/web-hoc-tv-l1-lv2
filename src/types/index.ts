// src/types/index.ts
export interface WordData {
  id: string;
  word: string;         // Từ hoàn chỉnh (VD: "lá")
  initial: string;      // Phụ âm đầu (VD: "l")
  rhyme: string;        // Vần (VD: "a")
  tone: string;         // Dấu thanh (VD: "sắc")
  category: string;     // Chủ đề (VD: "nature")
  difficulty: number;   // Độ khó
  confusions: string[]; // Các lỗi học sinh dễ nhầm lẫn
}