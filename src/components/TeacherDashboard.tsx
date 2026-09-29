// src/components/TeacherDashboard.tsx
import React, { useState } from 'react';
import { StudentRecord, UserRole } from '../types';

interface DashboardProps {
  role: UserRole;
  records: Record<string, StudentRecord>;
  sheetWebhookUrl: string;
  onSaveWebhookUrl: (url: string) => void;
  onSyncGoogleSheet: (student: StudentRecord) => Promise<void>;
}

export default function TeacherDashboard({
  role,
  records,
  sheetWebhookUrl,
  onSaveWebhookUrl,
  onSyncGoogleSheet,
}: DashboardProps) {
  const [urlInput, setUrlInput] = useState(sheetWebhookUrl);
  const [syncingStudent, setSyncingStudent] = useState<string | null>(null);
  const studentList = Object.values(records);

  const handleSync = async (student: StudentRecord) => {
    setSyncingStudent(student.studentName);
    await onSyncGoogleSheet(student);
    setSyncingStudent(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-sm mb-8">
      <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-2">
        {role === 'teacher' ? '👩‍🏫 Bảng Quản Lý Lớp Học (Giáo viên)' : '👨‍👩‍👧 Sổ Theo Dõi Học Tập (Phụ huynh)'}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Theo dõi tiến trình học tập, phân tích nhóm lỗi chính tả phổ biến và đồng bộ dữ liệu lên Google Sheets.
      </p>

      {/* Kết nối Google Sheets */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
        <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
          🔗 Đường dẫn Web App Google Sheets (Apps Script URL):
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              onSaveWebhookUrl(urlInput);
              alert('Đã lưu đường dẫn kết nối Google Sheets!');
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm"
          >
            Lưu kết nối
          </button>
        </div>
      </div>

      {/* Danh sách học sinh và thống kê nhóm lỗi */}
      {studentList.length === 0 ? (
        <p className="text-center text-slate-400 py-6">Chưa có dữ liệu luyện tập của học sinh.</p>
      ) : (
        <div className="space-y-6">
          {studentList.map((st) => (
            <div key={st.studentName} className="border border-slate-200 rounded-2xl p-4">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4 border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-blue-700">
                    👦 {st.studentName} <span className="text-sm font-normal text-slate-500">({st.className})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Điểm: <b>{st.score}</b> • Từ đã hoàn thành: <b>{st.completedWords}</b> • Chuỗi đúng cao nhất: <b>{st.maxStreak}</b>
                  </p>
                </div>
                <button
                  onClick={() => handleSync(st)}
                  disabled={syncingStudent === st.studentName}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-2 rounded-xl border border-blue-200"
                >
                  {syncingStudent === st.studentName ? 'Đang gửi...' : '📤 Gửi lên Google Sheets'}
                </button>
              </div>

              <p className="text-xs font-bold text-slate-600 uppercase mb-2">Thống kê theo nhóm lỗi chính tả:</p>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs mb-4">
                {(['s/x', 'ch/tr', 'l/n', 'd/gi/r', 'vần', 'thanh'] as const).map((group) => (
                  <div key={group} className="bg-red-50/70 border border-red-100 rounded-xl p-2">
                    <span className="block text-slate-500 font-medium">Lỗi {group}</span>
                    <span className="text-base font-extrabold text-red-600">
                      {st.errorCounts[group] || 0}
                    </span>
                  </div>
                ))}
              </div>

              {st.history.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-2">Lịch sử lỗi sai gần nhất:</p>
                  <div className="max-h-36 overflow-y-auto text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl">
                    {st.history.slice(0, 8).map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span>
                          Từ <b>&quot;{item.word}&quot;</b> — Đã chọn: <span className="text-red-600">{item.selected}</span>
                        </span>
                        <span className="text-slate-400">
                          [{item.errorTypes.join(', ')}] • {item.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}