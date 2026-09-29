// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import WordDisplay from '../components/WordDisplay';
import OptionBoard from '../components/OptionBoard';
import ResultArea from '../components/ResultArea';
import vocabulary from '../data/vocabulary.json';
import { WordData } from '../types';

// Danh sách các âm/vần/thanh cơ bản để làm đáp án nhiễu ngẫu nhiên
const ALL_INITIALS = ['b', 'c', 'ch', 'd', 'đ', 'g', 'gh', 'gi', 'h', 'k', 'kh', 'l', 'm', 'n', 'ng', 'nh', 'p', 'ph', 'q', 'r', 's', 't', 'th', 'tr', 'v', 'x'];
const ALL_RHYMES = ['a', 'o', 'e', 'u', 'i', 'eo', 'ut', 'uc', 'ach', 'at', 'ương', 'ươn', 'oa', 'im', 'in'];
const ALL_TONES = ['ngang', 'sắc', 'huyền', 'hỏi', 'ngã', 'nặng'];

// Hàm xáo trộn mảng ngẫu nhiên (để đáp án đúng không luôn nằm ở nút số 1)
const shuffleArray = (array: string[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Hàm lấy ngẫu nhiên n phần tử từ mảng (loại trừ các giá trị đã có)
const getRandomItems = (array: string[], count: number, exclude: string[]) => {
  const filtered = array.filter(item => !exclude.includes(item));
  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, count);
};

export default function Home() {
  const words = vocabulary as WordData[];

  // Trạng thái lưu từ hiện tại và các mảng lựa chọn
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [initialOptions, setInitialOptions] = useState<string[]>([]);
  const [rhymeOptions, setRhymeOptions] = useState<string[]>([]);
  const [toneOptions, setToneOptions] = useState<string[]>([]);

  // Trạng thái các lựa chọn của người dùng
  const [selectedInitial, setSelectedInitial] = useState('');
  const [selectedRhyme, setSelectedRhyme] = useState('');
  const [selectedTone, setSelectedTone] = useState('');

  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Thuật toán: Sinh từ mới và tạo các nút lựa chọn
  const loadNewWord = useCallback(() => {
    // 1. Chọn ngẫu nhiên 1 từ (đảm bảo không lặp lại từ vừa học)
    let randomWord = words[Math.floor(Math.random() * words.length)];
    if (words.length > 1 && currentWord) {
      while (randomWord.id === currentWord.id) {
        randomWord = words[Math.floor(Math.random() * words.length)];
      }
    }

    // 2. Phân loại các lỗi dễ nhầm (từ file JSON) thành Phụ âm hoặc Vần
    const initialConfusions = randomWord.confusions.filter(c => ALL_INITIALS.includes(c));
    const rhymeConfusions = randomWord.confusions.filter(c => !ALL_INITIALS.includes(c));

    // 3. Tạo 3 lựa chọn phụ âm (Đáp án đúng + Lỗi dễ nhầm + Ngẫu nhiên)
    let initials = [randomWord.initial, ...initialConfusions];
    if (initials.length < 3) {
      const randomInitials = getRandomItems(ALL_INITIALS, 3 - initials.length, initials);
      initials = [...initials, ...randomInitials];
    }

    // 4. Tạo 3 lựa chọn vần
    let rhymes = [randomWord.rhyme, ...rhymeConfusions];
    if (rhymes.length < 3) {
      const randomRhymes = getRandomItems(ALL_RHYMES, 3 - rhymes.length, rhymes);
      rhymes = [...rhymes, ...randomRhymes];
    }

    // 5. Tạo 3 lựa chọn dấu thanh
    let tones = [randomWord.tone];
    const randomTones = getRandomItems(ALL_TONES, 2, tones);
    tones = [...tones, ...randomTones];

    // 6. Xáo trộn và cập nhật hiển thị
    setCurrentWord(randomWord);
    setInitialOptions(shuffleArray(initials.slice(0, 3))); // Cắt lấy đúng 3 nút
    setRhymeOptions(shuffleArray(rhymes.slice(0, 3)));
    setToneOptions(shuffleArray(tones));

    // Đặt lại các lựa chọn của người dùng về trống
    setSelectedInitial('');
    setSelectedRhyme('');
    setSelectedTone('');
    setIsChecking(false);
    setIsCorrect(null);
  }, [currentWord, words]);

  // Gọi hàm loadNewWord lần đầu tiên khi trang web vừa chạy
  useEffect(() => {
    if (!currentWord) {
      loadNewWord();
    }
  }, [currentWord, loadNewWord]);

  // Xử lý khi bấm nút "Kiểm tra"
  const handleCheck = () => {
    if (!selectedInitial || !selectedRhyme || !selectedTone) {
      alert("Bạn cần chọn đủ phụ âm, vần và dấu thanh nhé!");
      return;
    }
    
    if (currentWord) {
      const isAnswerCorrect = 
        selectedInitial === currentWord.initial &&
        selectedRhyme === currentWord.rhyme &&
        selectedTone === currentWord.tone;

      setIsCorrect(isAnswerCorrect);
      setIsChecking(true);
    }
  };

  // Tránh lỗi hiển thị trắng trang trong chớp mắt lúc hệ thống đang load từ đầu tiên
  if (!currentWord) return null;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans">
      <div className="text-center mb-8">
        <p className="text-blue-500 font-bold text-sm uppercase tracking-wider mb-2">Lớp 1</p>
        <h1 className="text-4xl font-extrabold text-slate-800 mb-3">Luyện ghép tiếng Việt</h1>
        <p className="text-slate-500 text-lg">Chọn đúng phụ âm đầu, vần và dấu thanh để tạo thành từ.</p>
      </div>
      
      <div className="w-full max-w-2xl">
        <WordDisplay wordData={currentWord} />
        
        <OptionBoard
          initialOptions={initialOptions}
          rhymeOptions={rhymeOptions}
          toneOptions={toneOptions}
          selectedInitial={selectedInitial}
          selectedRhyme={selectedRhyme}
          selectedTone={selectedTone}
          onInitialSelect={(val) => { setSelectedInitial(val); setIsChecking(false); }}
          onRhymeSelect={(val) => { setSelectedRhyme(val); setIsChecking(false); }}
          onToneSelect={(val) => { setSelectedTone(val); setIsChecking(false); }}
        />

        <ResultArea
          selectedInitial={selectedInitial}
          selectedRhyme={selectedRhyme}
          selectedTone={selectedTone}
          isChecking={isChecking}
          isCorrect={isCorrect}
          onCheck={handleCheck}
          onNext={loadNewWord} /* Gắn hàm loadNewWord vào nút Từ tiếp theo */
        />
      </div>
    </main>
  );
}