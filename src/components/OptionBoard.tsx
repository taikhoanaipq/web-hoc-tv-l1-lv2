// src/components/OptionBoard.tsx
import React from 'react';

// Định nghĩa kiểu dữ liệu cho một nhóm lựa chọn (ví dụ: nhóm phụ âm đầu)
interface OptionGroupProps {
  title: string;       // Tiêu đề của nhóm (VD: "Phụ âm đầu")
  options: string[];   // Danh sách các lựa chọn hiển thị (VD: ["b", "l", "m"])
  selected: string;    // Giá trị đang được người dùng chọn
  onSelect: (value: string) => void; // Hàm xử lý khi người dùng click vào một nút
}

// Khối chức năng vẽ ra một nhóm lựa chọn
function OptionGroup({ title, options, selected, onSelect }: OptionGroupProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm">
      <h3 className="text-gray-700 font-semibold mb-4 text-lg">{title}</h3>
      <div className="flex flex-wrap gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option)}
            className={`
              min-w-[4rem] h-14 rounded-xl text-xl font-bold transition-all duration-200
              flex items-center justify-center px-4
              ${
                selected === option
                  ? 'bg-blue-600 text-white shadow-md scale-105' // Trạng thái khi được chọn
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100' // Trạng thái bình thường
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// Khối chức năng chính chứa cả 3 nhóm: Phụ âm đầu, Vần, Dấu thanh
interface OptionBoardProps {
  initialOptions: string[];
  rhymeOptions: string[];
  toneOptions: string[];
  selectedInitial: string;
  selectedRhyme: string;
  selectedTone: string;
  onInitialSelect: (value: string) => void;
  onRhymeSelect: (value: string) => void;
  onToneSelect: (value: string) => void;
}

export default function OptionBoard({
  initialOptions,
  rhymeOptions,
  toneOptions,
  selectedInitial,
  selectedRhyme,
  selectedTone,
  onInitialSelect,
  onRhymeSelect,
  onToneSelect,
}: OptionBoardProps) {
  return (
    <div className="w-full">
      <OptionGroup 
        title="Phụ âm đầu" 
        options={initialOptions} 
        selected={selectedInitial} 
        onSelect={onInitialSelect} 
      />
      <OptionGroup 
        title="Vần" 
        options={rhymeOptions} 
        selected={selectedRhyme} 
        onSelect={onRhymeSelect} 
      />
      <OptionGroup 
        title="Dấu thanh" 
        options={toneOptions} 
        selected={selectedTone} 
        onSelect={onToneSelect} 
      />
    </div>
  );
}