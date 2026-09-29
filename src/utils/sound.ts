// src/utils/sound.ts

// Hàm đọc phát âm tiếng Việt
export const speakVietnamese = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // Dừng âm thanh đang đọc dở
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.85; // Đọc chậm rãi, rõ ràng cho học sinh lớp 1
  utterance.pitch = 1.1;

  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
  if (viVoice) {
    utterance.voice = viVoice;
  }

  window.speechSynthesis.speak(utterance);
};

// Hàm phát hiệu ứng âm thanh Đúng (Ting!) hoặc Sai (Bíp nhẹ)
export const playSoundEffect = (type: 'correct' | 'wrong') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // Đô (C5)
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // Mi (E5)
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // Sol (G5)
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Bỏ qua nếu trình duyệt chặn tự động phát âm thanh
  }
};