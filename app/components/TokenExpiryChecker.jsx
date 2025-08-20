"use client";

import { useEffect } from 'react';
import { startTokenExpiryCheck } from '../../lib/supabase';

export default function TokenExpiryChecker() {
  useEffect(() => {
    // 토큰 만료 체크 시작
    const interval = startTokenExpiryCheck();
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
