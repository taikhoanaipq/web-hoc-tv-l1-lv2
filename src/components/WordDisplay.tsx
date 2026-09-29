// src/components/WordDisplay.tsx
import React, { useState } from 'react';
import { WordData } from '../types';

interface WordDisplayProps {
  wordData: WordData;
  isAdaptiveReview?: boolean;
}

export default function WordDisplay({ wordData, isAdaptiveReview }: WordDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Hàm phát âm chuẩn Tiếng Việt
  const playStandardVietnamese = (textToSpeak: string) => {
    if (isPlaying) return;
    setIsPlaying(true);

    const audio = new Audio(`/api/tts?text=${encodeURIComponent(textToSpeak)}`);
    audio.playbackRate = 0.9; // Đọc chậm rãi, rõ ràng cho học sinh lớp 1

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      // Dự phòng khi mất mạng: Ép trình duyệt chọn đúng giọng vi-VN nội bộ
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.85;

        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(
          (v) => v.lang.toLowerCase().includes('vi') || v.name.toLowerCase().includes('viet')
        );
        if (viVoice) utterance.voice = viVoice;

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlaying(false);
      }
    };

    audio.play().catch(() => {
      setIsPlaying(false);
    });
  };

  // Tạo câu đọc gợi ý đánh vần chuẩn Tiếng Việt
  const getSpellingHint = () => {
    const toneText = wordData.tone === 'ngang' ? '' : `, thanh ${wordData.tone}`;
    return `${wordData.initial}, ${wordData.rhyme}${toneText}, ${wordData.word}`;
  };

  return (
    <div className="bg-white border-2 border-blue-100 rounded-3xl p-5 md:p-8 text-center w-full shadow-sm mb-5 relative">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
          Chủ đề: {wordData.category}
        </span>
        {isAdaptiveReview && (
          <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            🎯 Bài luyện khắc phục lỗi hay sai
          </span>
        )}
        <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
          Độ khó: {'⭐'.repeat(wordData.difficulty)}
        </span>
      </div>

      <p className="text-slate-500 font-medium text-sm md:text-base mb-2">Từ cần ghép</p>

      <div className="text-5xl md:text-6xl mb-2 select-none">{wordData.image}</div>

      <div className="text-5xl md:text-7xl font-extrabold text-blue-600 mb-5 tracking-wide">
        {wordData.word}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => playStandardVietnamese(wordData.word)}
          type="button"
          disabled={isPlaying}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-5 rounded-full transition-transform active:scale-95 text-sm md:text-base shadow-md"
        >
          <span>🔊</span> {isPlaying ? 'Đang đọc...' : 'Nghe phát âm từ'}
        </button>

        <button
          onClick={() => playStandardVietnamese(getSpellingHint())}
          type="button"
          disabled={isPlaying}
          className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold py-2.5 px-5 rounded-full transition-transform active:scale-95 text-sm md:text-base shadow-sm"
        >
          <span>🗣️</span> Nghe gợi ý ghép âm
        </button>
      </div>
    </div>
  );
}