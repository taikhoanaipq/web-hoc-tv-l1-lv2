// src/components/WordDisplay.tsx
import React from 'react';
import { WordData } from '../types';

interface WordDisplayProps {
  wordData: WordData;
}

export default function WordDisplay({ wordData }: WordDisplayProps) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 text-center w-full shadow-sm mb-6">
      <h2 className="text-gray-600 font-medium mb-4 text-lg">Từ cần ghép</h2>
      <div className="text-7xl font-extrabold text-blue-600 mb-6 tracking-wide">
        {wordData.word}
      </div>
      <p className="text-gray-400 text-sm">
        Chủ đề: {wordData.category} • Độ khó: {wordData.difficulty}
      </p>
    </div>
  );
}