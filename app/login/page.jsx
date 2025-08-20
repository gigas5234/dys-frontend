"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, getCurrentSession, restoreSessionFromUrl, signOut } from '../../lib/supabase';

function LoginPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

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
      const dropdown = event.target.closest('.user-dropdown');
      if (!dropdown) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 비밀번호 표시/숨김 토글
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // 이메일/비밀번호 로그인 처리
  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setIsLoginLoading(true);

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('로그인 오류:', error);
        // 에러 메시지 표시 로직 추가 가능
        setIsLoginLoading(false);
        return;
      }

      if (data.user) {
        console.log('로그인 성공:', data.user.email);
        // 로그인 성공 시 메인 페이지로 이동
        router.push('/');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      setIsLoginLoading(false);
    }
  };

  // Google 로그인 처리
  const handleGoogleLogin = async () => {
    try {
      setIsLoginLoading(true);
      await signInWithGoogle();
      // 로그인 성공 시 로딩 상태는 자동으로 해제됨 (페이지 이동)
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoginLoading(false);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };

  // 로그인된 사용자가 있으면 홈으로 리다이렉트
  if (isClient && user) {
    router.push('/');
    return null;
  }

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
              <img src="/dys_logo.png" alt="데연소 로고" />
              데연소
            </a>
            <nav>
              <a href="/#problem">공감</a>
              <a href="/#preview">미리보기</a>
              <a href="/#science">과학적 분석</a>
              <a href="/#features">핵심 기능</a>
              <a href="/price">가격</a>
            </nav>
          </div>
          <div className="header-right" suppressHydrationWarning>
            {isClient && user ? (
              <div className="user-dropdown">
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
      
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="logo">데연소</div>
            <div className="header-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#a6c1ee" strokeWidth="2" strokeMiterlimit="10"/>
                <path d="M12 16V8" stroke="#fbc2eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 13L12 16L9 13" stroke="#fbc2eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <p>계정에 로그인하여 계속하세요.</p>
          
          <form onSubmit={handleEmailLogin}>
            <div className="input-group">
              <input type="email" id="email" name="email" required placeholder="이메일 주소" />
              <span className="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
            </div>
            <div className="input-group">
              <input type={passwordVisible ? 'text' : 'password'} id="password" name="password" required placeholder="비밀번호" />
              <span className="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                {passwordVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </span>
            </div>
            <button type="submit" className={`btn btn-primary ${isLoginLoading ? 'loading' : ''}`} disabled={isLoginLoading}>
              <span className="btn-text">
                {isLoginLoading ? '로그인 중...' : '로그인'}
              </span>
              {isLoginLoading && <div className="spinner"></div>}
            </button>
          </form>

          <div className="divider">또는</div>

          <button 
            onClick={handleGoogleLogin}
            className={`btn btn-google ${isLoginLoading ? 'loading' : ''}`}
            disabled={isLoginLoading}
          >
            {!isLoginLoading && (
              <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.865,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
            )}
            <span className="btn-text">
              {isLoginLoading ? 'Google 로그인 중...' : 'Google 계정으로 로그인'}
            </span>
            {isLoginLoading && <div className="spinner"></div>}
          </button>

          <div className="login-links">
            <a href="#">비밀번호 찾기</a>
            <span className="separator">|</span>
            <a href="/signup">회원가입</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
