"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getCurrentSession, restoreSessionFromUrl, signOut } from '../../lib/supabase';

function PricePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 사용자 세션 확인
  const checkUser = async () => {
    try {
      setLoading(true);
      
      // URL에서 토큰이 있는지 확인하고 세션 복원 시도
      const restoredSession = await restoreSessionFromUrl();
      if (restoredSession) {
        setUser(restoredSession.user);
        setLoading(false);
        return;
      }
      
      // 기존 세션 확인
      const session = await getCurrentSession();
      setUser(session?.user || null);
      setLoading(false);
    } catch (error) {
      console.error('Error checking user session:', error);
      setUser(null);
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    checkUser();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="login-loading">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <header className="main-header">
        <div className="container">
          <div className="header-left">
            <a href="/" className="logo">
              <img src="/dys_logo.webp" alt="데연소 로고" />
              데연소
            </a>
            <nav>
              <a href="/#problem">공감</a>
              <a href="/#preview">미리보기</a>
              <a href="/#science">과학적 분석</a>
              <a href="/#features">핵심 기능</a>
              <a href="/price" className="active">가격</a>
            </nav>
          </div>
          <div className="header-right" suppressHydrationWarning>
            {isClient && user ? (
              <div className="user-dropdown" ref={dropdownRef}>
                <div 
                  className={`user-dropdown-toggle ${isDropdownOpen ? 'open' : ''}`}
                  role="button"
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                  aria-controls="user-menu"
                  onClick={() => setIsDropdownOpen(o => !o)}
                >
                  <img 
                    src={user.user_metadata?.avatar_url || 'https://placehold.co/32x32/e0e8ff/7d7d7d?text=U'} 
                    alt="프로필" 
                    className="user-avatar"
                  />
                  <span className="user-name">{user.user_metadata?.full_name || user.email}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>
                <div id="user-menu" className={`user-dropdown-menu ${isDropdownOpen ? 'open' : ''}`} role="menu">
                  <a href="/persona" className="user-dropdown-item" role="menuitem">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    시작하기
                  </a>
                  <button onClick={handleLogout} className="user-dropdown-item logout" role="menuitem">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16,17 21,12 16,7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <a href="/login" className="btn btn-login">로그인</a>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="pricing-section">
          <div className="container">
            <div className="section-title">
              <h1>성장을 위한 당신의 플랜</h1>
              <p>실패의 두려움을 자신감의 초석으로 바꿔보세요. '데연소'가 당신의 잠재된 매력을 찾아드릴게요.</p>
            </div>

            <div className="pricing-grid">
              <div className="plan-card">
                <h2>Free</h2>
                <div className="price">₩0<small>/ 월</small></div>
                <p className="description">'데연소'의 핵심 기능을 체험하고 싶으신 분들을 위한 플랜입니다.</p>
                <ul className="feature-list">
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                    <span>기본 AI 페르소나 1종 제공</span>
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                    <span>월 5회 대화 가능</span>
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                    <span>기본 분석 리포트 (종합 점수)</span>
                  </li>
                </ul>
                <a href="#" className="btn-cta">무료로 시작하기</a>
              </div>

              <div className="plan-card premium">
                <div className="plan-badge">추천 플랜</div>
                <h2>Premium</h2>
                <div className="price">₩9,900<small>/ 월 (예상)</small></div>
                <p className="description">모든 기능을 제한 없이 이용하여 당신의 성장을 극대화하세요.</p>
                <ul className="feature-list">
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                    <span><b>모든 AI 페르소나</b> 및 시나리오 무제한 이용</span>
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                    <span><b>상세 분석</b>이 포함된 전체 리포트 제공</span>
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                    <span><b>장기 성장 그래프</b> 및 데이터 관리</span>
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                    <span>모든 도전 모드 시나리오 이용 가능</span>
                  </li>
                </ul>
                <a href="#" className="btn-cta">프리미엄 구독하기</a>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container">
            <h2>자주 묻는 질문</h2>
            <div className="faq-container">
              <details className="faq-item">
                <summary>무료 플랜의 5회 대화는 언제 초기화되나요?</summary>
                <p>무료 대화 횟수는 매월 1일에 자동으로 초기화됩니다. 새로운 달이 시작되면 다시 5번의 대화 연습을 하실 수 있습니다.</p>
              </details>
              <details className="faq-item">
                <summary>유료 구독은 언제든지 취소할 수 있나요?</summary>
                <p>네, 물론입니다. 구독은 약정 없이 언제든지 취소하실 수 있습니다. 구독을 취소하더라도 현재 결제된 이용 기간이 끝날 때까지는 프리미엄 기능을 계속 사용하실 수 있습니다.</p>
              </details>
              <details className="faq-item">
                <summary>제 영상과 음성 데이터는 안전하게 관리되나요?</summary>
                <p>그럼요. 저희는 사용자의 개인정보를 최우선으로 생각합니다. 모든 데이터는 전송 및 저장 과정에서 암호화되며, AI 학습에 사용될 경우 개인을 식별할 수 없도록 완벽하게 비식별화 처리됩니다. 사용자는 언제든 자신의 데이터 삭제를 요청할 수 있습니다.</p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>&copy; 2025 데연소. All rights reserved.</p>
      </footer>
    </>
  );
}

export default PricePage;
