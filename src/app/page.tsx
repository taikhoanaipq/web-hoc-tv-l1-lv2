// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import WordDisplay from '../components/WordDisplay';
import OptionBoard, { PartType } from '../components/OptionBoard';
import ResultArea from '../components/ResultArea';
import TeacherDashboard from '../components/TeacherDashboard';
import vocabulary from '../data/vocabulary.json';
import { WordData, StudentRecord, UserRole, ErrorCategory } from '../types';

// DÁN ĐƯỜNG DẪN GOOGLE SHEETS WEB APP URL CỦA BẠN VÀO GIỮA HAI DẤU NHÁY KÉP DƯỚI ĐÂY ĐỂ TỰ ĐỘNG LƯU TRÊN MỌI MÁY:
const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxvnkgayHTIMUrYfbuytUVTfofXP5aGsY6asKRr1yk/dev';

const ALL_INITIALS = [
  'b', 'c', 'ch', 'd', 'đ', 'g', 'gh', 'gi', 'h', 'k', 'kh',
  'l', 'm', 'n', 'ng', 'nh', 'p', 'ph', 'q', 'r', 's', 't', 'th', 'tr', 'v', 'x'
];
const ALL_RHYMES = [
  'a', 'o', 'e', 'ê', 'u', 'i', 'eo', 'ut', 'uc', 'ach', 'at',
  'ương', 'ươn', 'oa', 'im', 'in', 'ưa', 'ua', 'ô', 'âm', 'ăn', 'eng', 'en', 'ươc'
];
const ALL_TONES = ['ngang', 'sắc', 'huyền', 'hỏi', 'ngã', 'nặng'];

const shuffleArray = (array: string[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getRandomItems = (array: string[], count: number, exclude: string[]) => {
  const filtered = array.filter((item) => !exclude.includes(item));
  return shuffleArray(filtered).slice(0, count);
};

const createEmptyStudent = (name: string, className: string): StudentRecord => ({
  studentName: name,
  className,
  score: 0,
  maxStreak: 0,
  completedWords: 0,
  errorCounts: { 's/x': 0, 'ch/tr': 0, 'l/n': 0, 'd/gi/r': 0, 'vần': 0, 'thanh': 0 },
  wrongWordIds: [],
  history: [],
});

export default function Home() {
  const allWords = vocabulary as WordData[];

  const [role, setRole] = useState<UserRole>('student');
  const [studentName, setStudentName] = useState('Nguyễn Văn An');
  const [className, setClassName] = useState('Lớp 1A');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [records, setRecords] = useState<Record<string, StudentRecord>>({});
  const [sheetWebhookUrl, setSheetWebhookUrl] = useState(DEFAULT_GOOGLE_SHEET_URL);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const categories = ['Tất cả', ...Array.from(new Set(allWords.map((w) => w.category)))];
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [adaptiveMode, setAdaptiveMode] = useState(false);
  const [isAdaptiveWord, setIsAdaptiveWord] = useState(false);

  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [initialOptions, setInitialOptions] = useState<string[]>([]);
  const [rhymeOptions, setRhymeOptions] = useState<string[]>([]);
  const [toneOptions, setToneOptions] = useState<string[]>([]);

  const [selectedInitial, setSelectedInitial] = useState('');
  const [selectedRhyme, setSelectedRhyme] = useState('');
  const [selectedTone, setSelectedTone] = useState('');

  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const savedRecords = localStorage.getItem('viet_spelling_records_v2');
    const savedWebhook = localStorage.getItem('viet_spelling_webhook');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {
        // Bỏ qua nếu lỗi định dạng
      }
    }
    if (savedWebhook) {
      setSheetWebhookUrl(savedWebhook);
    } else if (DEFAULT_GOOGLE_SHEET_URL) {
      setSheetWebhookUrl(DEFAULT_GOOGLE_SHEET_URL);
    }
  }, []);

  const currentStudent = records[studentName] || createEmptyStudent(studentName, className);

  const saveStudentRecord = (updated: StudentRecord) => {
    const nextRecords = { ...records, [updated.studentName]: updated };
    setRecords(nextRecords);
    localStorage.setItem('viet_spelling_records_v2', JSON.stringify(nextRecords));
  };

  // Hàm tự động gửi kết quả của học sinh lên Google Sheets
  const syncToGoogleSheets = async (studentData: StudentRecord, lastAttemptText = '', silent = false) => {
    const targetUrl = sheetWebhookUrl || DEFAULT_GOOGLE_SHEET_URL;
    if (!targetUrl) {
      if (!silent) {
        alert('Vui lòng dán đường dẫn Google Sheets Web App URL vào mục Giáo viên trước!');
      }
      return;
    }

    try {
      setSyncStatus('☁️ Đang tự động lưu kết quả vào Google Sheets...');
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentData,
          lastAttempt: lastAttemptText,
        }),
      });
      setSyncStatus('✅ Đã tự động lưu kết quả vào Google Sheets');
      if (!silent) {
        alert(`Đã đồng bộ kết quả của học sinh ${studentData.studentName} lên Google Sheets!`);
      }
    } catch {
      setSyncStatus('⚠️ Chưa thể kết nối Google Sheets');
      if (!silent) {
        alert('Có lỗi khi kết nối Google Sheets. Vui lòng kiểm tra lại đường dẫn.');
      }
    }
  };

  const loadNewWord = useCallback(
    (categoryFilter = selectedCategory, forceAdaptive = adaptiveMode) => {
      const pool =
        categoryFilter === 'Tất cả'
          ? allWords
          : allWords.filter((w) => w.category === categoryFilter);

      let chosenWord: WordData | null = null;
      let adaptiveTriggered = false;

      if (forceAdaptive && currentStudent) {
        const wrongWords = pool.filter((w) => currentStudent.wrongWordIds.includes(w.id));
        if (wrongWords.length > 0 && Math.random() < 0.65) {
          chosenWord = wrongWords[Math.floor(Math.random() * wrongWords.length)];
          adaptiveTriggered = true;
        } else {
          const groups: ('s/x' | 'ch/tr' | 'l/n' | 'd/gi/r')[] = ['s/x', 'ch/tr', 'l/n', 'd/gi/r'];
          const topErrorGroup = groups.reduce((a, b) =>
            (currentStudent.errorCounts[a] || 0) >= (currentStudent.errorCounts[b] || 0) ? a : b
          );

          if ((currentStudent.errorCounts[topErrorGroup] || 0) > 0) {
            const groupWords = pool.filter((w) => w.confusionGroup === topErrorGroup);
            if (groupWords.length > 0) {
              chosenWord = groupWords[Math.floor(Math.random() * groupWords.length)];
              adaptiveTriggered = true;
            }
          }
        }
      }

      if (!chosenWord) {
        chosenWord = pool[Math.floor(Math.random() * pool.length)] || allWords[0];
        if (pool.length > 1 && currentWord && chosenWord.id === currentWord.id) {
          const others = pool.filter((w) => w.id !== currentWord.id);
          chosenWord = others[Math.floor(Math.random() * others.length)];
        }
      }

      const initialConfusions = chosenWord.confusions.filter((c) => ALL_INITIALS.includes(c));
      const rhymeConfusions = chosenWord.confusions.filter((c) => !ALL_INITIALS.includes(c));

      let initials = [chosenWord.initial, ...initialConfusions];
      if (initials.length < 3) {
        initials = [...initials, ...getRandomItems(ALL_INITIALS, 3 - initials.length, initials)];
      }

      let rhymes = [chosenWord.rhyme, ...rhymeConfusions];
      if (rhymes.length < 3) {
        rhymes = [...rhymes, ...getRandomItems(ALL_RHYMES, 3 - rhymes.length, rhymes)];
      }

      const tones = [chosenWord.tone, ...getRandomItems(ALL_TONES, 2, [chosenWord.tone])];

      setCurrentWord(chosenWord);
      setIsAdaptiveWord(adaptiveTriggered);
      setInitialOptions(shuffleArray(initials.slice(0, 3)));
      setRhymeOptions(shuffleArray(rhymes.slice(0, 3)));
      setToneOptions(shuffleArray(tones));

      setSelectedInitial('');
      setSelectedRhyme('');
      setSelectedTone('');
      setIsChecking(false);
      setIsCorrect(null);
    },
    [adaptiveMode, allWords, currentStudent, currentWord, selectedCategory]
  );

  useEffect(() => {
    if (!currentWord) {
      loadNewWord();
    }
  }, [currentWord, loadNewWord]);

  const handleDropPart = (partType: PartType, value: string) => {
    setIsChecking(false);
    if (partType === 'initial') setSelectedInitial(value);
    if (partType === 'rhyme') setSelectedRhyme(value);
    if (partType === 'tone') setSelectedTone(value);
  };

  // Kiểm tra đáp án và TỰ ĐỘNG lưu lên Google Sheets
  const handleCheck = () => {
    if (!selectedInitial || !selectedRhyme || !selectedTone) {
      alert('Con hãy chọn hoặc kéo thả đủ Phụ âm đầu, Vần và Dấu thanh nhé!');
      return;
    }
    if (!currentWord) return;

    const isInitOk = selectedInitial === currentWord.initial;
    const isRhymeOk = selectedRhyme === currentWord.rhyme;
    const isToneOk = selectedTone === currentWord.tone;
    const isAllCorrect = isInitOk && isRhymeOk && isToneOk;

    if (!isChecking) {
      const updated: StudentRecord = {
        ...currentStudent,
        studentName,
        className,
        errorCounts: { ...currentStudent.errorCounts },
      };

      const selectedFormula = `${selectedInitial} + ${selectedRhyme} + ${selectedTone}`;
      let attemptSummary = '';

      if (isAllCorrect) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        updated.score += 10;
        updated.completedWords += 1;
        updated.maxStreak = Math.max(updated.maxStreak, nextStreak);
        updated.wrongWordIds = updated.wrongWordIds.filter((id) => id !== currentWord.id);
        attemptSummary = `ĐÚNG: "${currentWord.word}" (${selectedFormula})`;
      } else {
        setStreak(0);
        const errorTypes: ErrorCategory[] = [];

        if (!isInitOk) {
          const group: ErrorCategory = currentWord.confusionGroup || 's/x';
          updated.errorCounts[group] = (updated.errorCounts[group] || 0) + 1;
          errorTypes.push(group);
        }
        if (!isRhymeOk) {
          updated.errorCounts['vần'] = (updated.errorCounts['vần'] || 0) + 1;
          errorTypes.push('vần');
        }
        if (!isToneOk) {
          updated.errorCounts['thanh'] = (updated.errorCounts['thanh'] || 0) + 1;
          errorTypes.push('thanh');
        }

        if (!updated.wrongWordIds.includes(currentWord.id)) {
          updated.wrongWordIds = [...updated.wrongWordIds, currentWord.id];
        }

        updated.history = [
          {
            timestamp: new Date().toLocaleTimeString('vi-VN'),
            studentName: updated.studentName,
            word: currentWord.word,
            selected: selectedFormula,
            errorTypes,
          },
          ...updated.history,
        ];
        attemptSummary = `SAI: "${currentWord.word}" - Chọn: ${selectedFormula} [Lỗi: ${errorTypes.join(', ')}]`;
      }

      // 1. Lưu vào trình duyệt
      saveStudentRecord(updated);

      // 2. Tự động gửi ngầm lên Google Sheets ngay lập tức
      syncToGoogleSheets(updated, attemptSummary, true);
    }

    setIsCorrect(isAllCorrect);
    setIsChecking(true);
  };

  if (!currentWord) return null;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-5 px-3 sm:px-6 font-sans">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 mb-5 shadow-sm flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Học sinh đang luyện tập</p>
            <p className="text-sm sm:text-base font-extrabold text-slate-800">
              {studentName} <span className="text-blue-600 font-semibold">({className})</span>
            </p>
            {syncStatus && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{syncStatus}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['student', 'teacher', 'parent'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                role === r
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'student' ? '👦 Học sinh' : r === 'teacher' ? '👩‍🏫 Giáo viên' : '👨‍👩‍👧 Phụ huynh'}
            </button>
          ))}
          {role === 'student' && isLoggedIn && (
            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
            >
              Đổi HS
            </button>
          )}
        </div>
      </div>

      {!isLoggedIn && role === 'student' && (
        <div className="w-full max-w-3xl bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Nhập họ và tên học sinh..."
            className="flex-1 w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
          />
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Lớp (VD: 1A)"
            className="w-full sm:w-28 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
          />
          <button
            onClick={() => {
              if (!records[studentName]) {
                saveStudentRecord(createEmptyStudent(studentName, className));
              }
              setIsLoggedIn(true);
            }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-sm whitespace-nowrap shadow-sm"
          >
            Bắt đầu học
          </button>
        </div>
      )}

      {role !== 'student' ? (
        <div className="w-full max-w-3xl">
          <TeacherDashboard
            role={role}
            records={records}
            sheetWebhookUrl={sheetWebhookUrl}
            onSaveWebhookUrl={(url) => {
              setSheetWebhookUrl(url);
              localStorage.setItem('viet_spelling_webhook', url);
            }}
            onSyncGoogleSheet={(st) => syncToGoogleSheets(st, 'Đồng bộ thủ công', false)}
          />
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 mb-1">
              Luyện ghép tiếng Việt Lớp 1
            </h1>
            <p className="text-slate-500 text-xs sm:text-base">
              Kéo thả hoặc chạm chọn đúng phụ âm đầu, vần và dấu thanh để tạo thành từ.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Điểm số</p>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-600">{currentStudent.score}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Chuỗi đúng</p>
              <p className="text-xl sm:text-2xl font-extrabold text-orange-500">🔥 {streak}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Huy hiệu</p>
              <p className="text-xs sm:text-base font-extrabold text-amber-500 mt-1">
                {currentStudent.score >= 100 || streak >= 10
                  ? '👑 Vua Tiếng Việt'
                  : currentStudent.score >= 50 || streak >= 5
                  ? '🏅 Ong Chăm Chỉ'
                  : '🌱 Sao Nhí'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    loadNewWord(cat, adaptiveMode);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const nextMode = !adaptiveMode;
                setAdaptiveMode(nextMode);
                loadNewWord(selectedCategory, nextMode);
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                adaptiveMode
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
              }`}
            >
              🎯 Luyện lỗi hay sai (Cá nhân hóa): {adaptiveMode ? 'BẬT' : 'TẮT'}
            </button>
          </div>

          <WordDisplay wordData={currentWord} isAdaptiveReview={isAdaptiveWord} />

          <OptionBoard
            initialOptions={initialOptions}
            rhymeOptions={rhymeOptions}
            toneOptions={toneOptions}
            selectedInitial={selectedInitial}
            selectedRhyme={selectedRhyme}
            selectedTone={selectedTone}
            onInitialSelect={(val) => {
              setSelectedInitial(val);
              setIsChecking(false);
            }}
            onRhymeSelect={(val) => {
              setSelectedRhyme(val);
              setIsChecking(false);
            }}
            onToneSelect={(val) => {
              setSelectedTone(val);
              setIsChecking(false);
            }}
          />

          <ResultArea
            currentWord={currentWord}
            selectedInitial={selectedInitial}
            selectedRhyme={selectedRhyme}
            selectedTone={selectedTone}
            isChecking={isChecking}
            isCorrect={isCorrect}
            onDropPart={handleDropPart}
            onCheck={handleCheck}
            onNext={() => loadNewWord(selectedCategory, adaptiveMode)}
          />
        </div>
      )}
    </main>
  );
}