// src/components/OptionBoard.tsx
import React from 'react';

export type PartType = 'initial' | 'rhyme' | 'tone';

interface OptionGroupProps {
  title: string;
  partType: PartType;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

function OptionGroup({ title, partType, options, selected, onSelect }: OptionGroupProps) {
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, value: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ partType, value }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 mb-3 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-slate-700 font-bold text-base md:text-lg">{title}</h3>
        <span className="text-xs text-slate-400">Kéo thả hoặc chạm để chọn</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {options.map((option, index) => (
          <button
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, option)}
            onClick={() => onSelect(option)}
            className={`
              min-w-[4.2rem] h-12 md:h-14 rounded-xl text-lg md:text-xl font-extrabold transition-all duration-150
              flex items-center justify-center px-4 cursor-grab active:cursor-grabbing select-none
              ${
                selected === option
                  ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-300'
                  : 'bg-slate-50 text-slate-700 border-2 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
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
        title="1. Phụ âm đầu"
        partType="initial"
        options={initialOptions}
        selected={selectedInitial}
        onSelect={onInitialSelect}
      />
      <OptionGroup
        title="2. Vần"
        partType="rhyme"
        options={rhymeOptions}
        selected={selectedRhyme}
        onSelect={onRhymeSelect}
      />
      <OptionGroup
        title="3. Dấu thanh"
        partType="tone"
        options={toneOptions}
        selected={selectedTone}
        onSelect={onToneSelect}
      />
    </div>
  );
}