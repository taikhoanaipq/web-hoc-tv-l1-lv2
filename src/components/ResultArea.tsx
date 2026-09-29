// src/components/ResultArea.tsx
import React, { useState } from 'react';
import { WordData } from '../types';
import { PartType } from './OptionBoard';

interface ResultAreaProps {
  currentWord: WordData;
  selectedInitial: string;
  selectedRhyme: string;
  selectedTone: string;
  isChecking: boolean;
  isCorrect: boolean | null;
  onDropPart: (partType: PartType, value: string) => void;
  onCheck: () => void;
  onNext: () => void;
}

export default function ResultArea({
  currentWord,
  selectedInitial,
  selectedRhyme,
  selectedTone,
  isChecking,
  isCorrect,
  onDropPart,
  onCheck,
  onNext,
}: ResultAreaProps) {
  const [dragOverBox, setDragOverBox] = useState<PartType | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, expectedType: PartType) => {
    e.preventDefault();
    setDragOverBox(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.partType === expectedType) {
        onDropPart(expectedType, data.value);
      } else {
        alert('Con hãy thả đúng vào ô tương ứng nhé!');
      }
    } catch {
      // Bỏ qua nếu dữ liệu kéo thả không hợp lệ
    }
  };

  const getBoxStyle = (partType: PartType, selectedValue: string, correctValue: string) => {
    if (dragOverBox === partType) {
      return 'bg-blue-100 border-blue-500 scale-105';
    }
    if (!isChecking) {
      return selectedValue
        ? 'bg-white border-blue-400 text-blue-700'
        : 'bg-white/80 border-slate-300 text-slate-400 border-dashed';
    }
    return selectedValue === correctValue
      ? 'bg-green-50 border-green-500 text-green-700'
      : 'bg-red-50 border-red-500 text-red-700';
  };

  const getDetailedErrorMessage = () => {
    const errors: string[] = [];
    if (selectedInitial !== currentWord.initial) errors.push(`phụ âm đầu (${currentWord.confusionGroup || 'âm đầu'})`);
    if (selectedRhyme !== currentWord.rhyme) errors.push('vần');
    if (selectedTone !== currentWord.tone) errors.push('dấu thanh');
    return `Chưa đúng! Con đang nhầm ở phần: ${errors.join(', ')}.`;
  };

  return (
    <div className="w-full mt-2">
      <div className="bg-blue-50/70 border-2 border-blue-200 border-dashed rounded-2xl p-4 md:p-6 mb-5 shadow-sm">
        <h3 className="text-blue-900 font-bold text-sm md:text-base mb-3">
          📥 Kéo thả hoặc bấm chọn vào ô đáp án:
        </h3>
        <div className="flex items-center justify-center sm:justify-start gap-2 md:gap-4 flex-wrap">
          {/* Ô thả Phụ âm đầu */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOverBox('initial'); }}
            onDragLeave={() => setDragOverBox(null)}
            onDrop={(e) => handleDrop(e, 'initial')}
            className={`min-w-[5.5rem] h-14 flex flex-col items-center justify-center border-2 rounded-xl px-3 transition-all ${getBoxStyle('initial', selectedInitial, currentWord.initial)}`}
          >
            <span className="text-[10px] uppercase font-semibold text-slate-400">Âm đầu</span>
            <span className="text-lg md:text-xl font-extrabold">{selectedInitial || '?'}</span>
          </div>

          <span className="text-xl font-bold text-slate-400">+</span>

          {/* Ô thả Vần */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOverBox('rhyme'); }}
            onDragLeave={() => setDragOverBox(null)}
            onDrop={(e) => handleDrop(e, 'rhyme')}
            className={`min-w-[5.5rem] h-14 flex flex-col items-center justify-center border-2 rounded-xl px-3 transition-all ${getBoxStyle('rhyme', selectedRhyme, currentWord.rhyme)}`}
          >
            <span className="text-[10px] uppercase font-semibold text-slate-400">Vần</span>
            <span className="text-lg md:text-xl font-extrabold">{selectedRhyme || '?'}</span>
          </div>

          <span className="text-xl font-bold text-slate-400">+</span>

          {/* Ô thả Dấu thanh */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOverBox('tone'); }}
            onDragLeave={() => setDragOverBox(null)}
            onDrop={(e) => handleDrop(e, 'tone')}
            className={`min-w-[5.5rem] h-14 flex flex-col items-center justify-center border-2 rounded-xl px-3 transition-all ${getBoxStyle('tone', selectedTone, currentWord.tone)}`}
          >
            <span className="text-[10px] uppercase font-semibold text-slate-400">Dấu thanh</span>
            <span className="text-lg md:text-xl font-extrabold">{selectedTone || '?'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 md:gap-4 mb-5">
        <button
          onClick={onCheck}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 md:h-14 rounded-xl font-bold text-base md:text-lg transition-colors shadow-md active:scale-95"
        >
          Kiểm tra đáp án
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-700 h-12 md:h-14 rounded-xl font-bold text-base md:text-lg transition-colors shadow-sm active:scale-95"
        >
          Từ tiếp theo ➡️
        </button>
      </div>

      {isChecking && (
        <div
          className={`p-4 rounded-xl font-bold text-base md:text-lg mb-6 text-center transition-all ${
            isCorrect
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {isCorrect ? '🎉 Chính xác! Con ghép từ giỏi lắm!' : getDetailedErrorMessage()}
        </div>
      )}
    </div>
  );
}