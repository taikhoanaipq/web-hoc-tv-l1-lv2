// src/app/api/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get('text');
  if (!text) {
    return new NextResponse('Thiếu từ cần đọc', { status: 400 });
  }

  try {
    // Lấy âm thanh giọng đọc Tiếng Việt chuẩn (tl=vi) từ Google
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=vi&client=tw-ob`;

    const response = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!response.ok) {
      throw new Error('Không tải được âm thanh');
    }

    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('Lỗi tạo giọng đọc', { status: 500 });
  }
}