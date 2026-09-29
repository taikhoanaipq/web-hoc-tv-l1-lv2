// src/components/ResultArea.tsx
import React from 'react';

interface ResultAreaProps {
  selectedInitial: string;
  selectedRhyme: string;
  selectedTone: string;
  isChecking: boolean;       // Biến trạng thái để biết người dùng đã bấm Kiểm tra chưa
  isCorrect: boolean | null; // null: chưa kiểm tra, true: đúng, false: sai
  onCheck: () => void;       // Hàm xử lý khi bấm nút "Kiểm tra"
  onNext: () => void;        // Hàm xử lý khi bấm nút "Từ tiếp theo"
}

export default function ResultArea({
  selectedInitial,
  selectedRhyme,
  selectedTone,
  isChecking,
  isCorrect,
  onCheck,
  onNext,
}: ResultAreaProps) {
  
  // Khối nhỏ hiển thị một thành phần đang được chọn (ô vuông nhỏ)
  const SelectedBox = ({ value }: { value: string }) => (
    <div className="min-w-[3.5rem] h-12 flex items-center justify-center bg-white border-2 border-slate-200 rounded-xl text-xl font-bold text-slate-800 px-3 shadow-sm">
      {value || '?'}
    </div>
  );

  return (
    <div className="w-full mt-2">
      {/* 1. Khu vực hiển thị công thức đang chọn (VD: m + a + sắc) */}
      <div className="bg-blue-50/50 border border-blue-200/60 rounded-2xl p-6 mb-6 shadow-sm border-dashed">
        <h3 className="text-blue-800 font-semibold mb-4">Đáp án đang chọn</h3>
        <div className="flex items-center gap-3">
          <SelectedBox value={selectedInitial} />
          <span className="text-xl font-bold text-slate-400">+</span>
          <SelectedBox value={selectedRhyme} />
          <span className="text-xl font-bold text-slate-400">+</span>
          <SelectedBox value={selectedTone} />
        </div>
      </div>

      {/* 2. Nhóm nút thao tác */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={onCheck}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-bold text-lg transition-colors shadow-md active:scale-95"
        >
          Kiểm tra
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 h-14 rounded-xl font-bold text-lg transition-colors shadow-sm active:scale-95"
        >
          Từ tiếp theo
        </button>
      </div>

      {/* 3. Khu vực thông báo kết quả (Chỉ hiển thị khi đã bấm Kiểm tra) */}
      {isChecking && (
        <div
          className={`h-16 flex items-center justify-center rounded-xl font-bold text-xl mb-10 transition-all duration-300 ${
            isCorrect
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}
        >
          {isCorrect ? 'Đúng rồi!' : 'Chưa đúng.'}
        </div>
      )}
    </div>
  );
}