"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, getCurrentSession, restoreSessionFromUrl } from '../../lib/supabase';

// 페이지에 필요한 모든 스타일을 포함하는 컴포넌트입니다.
const GlobalStyles = () => (
  <style>{`
    :root {
      --bg: #f7f8fc;
      --glass: rgba(255, 255, 255, 0.5);
      --stroke: rgba(0, 0, 0, 0.1);
      --shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
      --text: #2c3e50;
      --muted: rgba(44, 62, 80, 0.6);
      --brand1: #fbc2eb;
      --brand2: #a6c1ee;
      --brand3: #e6b3ff;
      --radius: 24px;
      --transition-speed: 0.5s;
    }
    * { box-sizing: border-box; }
    html, body, #root {
      height: 100%;
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    body::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 70vw;
      height: 70vh;
      min-width: 800px;
      min-height: 800px;
      background: radial-gradient(circle, var(--brand1) 0%, var(--brand2) 50%, var(--brand3) 100%);
      opacity: 0.15;
      filter: blur(120px);
      transform-origin: center;
      animation: backgroundHighlight 25s ease-in-out infinite alternate;
      z-index: -1;
    }
    @keyframes backgroundHighlight {
      0% { transform: translate(-20%, -20%) rotate(0deg) scale(1.2); }
      100% { transform: translate(20%, 20%) rotate(360deg) scale(1.4); }
    }
    /* 메인 헤더 스타일 */
    .main-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: var(--glass);
      border-bottom: 1px solid var(--stroke);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      z-index: 100;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 40px;
    }
    .main-header .logo { 
      display: flex; 
      align-items: center; 
      gap: 14px; 
      font-size: 32px; 
      font-weight: 700; 
      color: var(--text); 
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .main-header .logo img {
      width: 38px;
      height: 38px;
      object-fit: contain;
    }
    .main-header nav {
      display: flex;
      gap: 30px;
    }
    .main-header nav a {
      color: var(--muted);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    .main-header nav a:hover {
      color: var(--text);
    }
    .btn-login {
      background: var(--brand2);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(166, 193, 238, 0.4);
    }

    .login-container {
      width: 100%;
      max-width: 420px;
      padding: 20px;
      margin-top: 100px;
    }
    .login-box {
      background: var(--glass);
      border: 1px solid var(--stroke);
      border-radius: var(--radius);
      padding: 40px 45px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: var(--shadow);
      text-align: center;
      transform: scale(0.95);
      opacity: 0;
      animation: fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards, float 4s ease-in-out infinite;
    }
    @keyframes fadeIn {
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes float {
      0% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-10px) scale(1); }
      100% { transform: translateY(0px) scale(1); }
    }
    .login-header {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 25px;
    }
    .login-box .logo {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 36px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    .login-box .logo img {
      width: 42px;
      height: 42px;
      object-fit: contain;
    }
    .header-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.4s ease;
    }
    .header-icon:hover {
      transform: rotate(90deg) scale(1.1);
    }
    .login-box p {
      color: var(--muted);
      margin-bottom: 35px;
      font-size: 16px;
      text-align: left;
    }
    .input-group {
      position: relative;
      margin-bottom: 22px;
      text-align: left;
    }
    .input-group .icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      transition: color 0.3s ease;
      pointer-events: none;
    }
    .input-group input {
      width: 100%;
      padding: 15px 18px 15px 50px;
      border-radius: 14px;
      border: 1px solid var(--stroke);
      background-color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
      color: var(--text);
      transition: all 0.3s ease;
    }
    .input-group input:focus {
      outline: none;
      border-color: var(--brand2);
      box-shadow: 0 0 0 4px rgba(166, 193, 238, 0.3);
      background-color: rgba(255, 255, 255, 0.8);
    }
    .input-group input:focus ~ .icon {
      color: var(--brand2);
    }
    .password-toggle {
      position: absolute;
      right: 18px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: var(--muted);
    }
    .password-toggle:hover {
      color: var(--text);
    }
    .btn {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      position: relative;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--brand2), var(--brand1));
      color: white;
      margin-top: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 25px rgba(166, 193, 238, 0.4);
    }
    .btn .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.5);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: none;
    }
    .btn.loading .btn-text {
      opacity: 0;
    }
    .btn.loading .spinner {
      display: block;
      position: absolute;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      color: var(--muted);
      margin: 35px 0;
      font-size: 14px;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--stroke);
    }
    .divider:not(:empty)::before { margin-right: .75em; }
    .divider:not(:empty)::after { margin-left: .75em; }
    .btn-google {
      background-color: #fff;
      color: var(--text);
      border: 1px solid var(--stroke);
    }
    .btn-google:hover {
      background-color: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .btn-google .google-icon {
      width: 22px;
      height: 22px;
    }
    .login-links {
      margin-top: 35px;
      font-size: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
    }
    .login-links a {
      color: var(--muted);
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .login-links a:hover {
      color: var(--text);
      text-decoration: underline;
    }
    .login-links .separator {
      color: var(--stroke);
    }
  `}</style>
);

// 로그인 페이지 컴포넌트
function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    // 컴포넌트 마운트 시 세션 확인
    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        console.log('🔍 [LOGIN] checkUser 함수 시작');
        try {
            // 환경 변수가 설정되지 않은 경우 더미 사용자로 설정
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                console.log('⚠️ [LOGIN] 환경 변수가 설정되지 않음');
                setUser(null);
                setAuthLoading(false);
                return;
            }
            
            console.log('🔍 [LOGIN] 현재 URL:', window.location.href);
            console.log('🔍 [LOGIN] URL 해시:', window.location.hash);
            
            // URL에서 토큰이 있는지 확인하고 세션 복원 시도
            const restoredSession = await restoreSessionFromUrl();
            if (restoredSession) {
                console.log('✅ [LOGIN] URL에서 세션 복원 성공:', restoredSession.user.email);
                setUser(restoredSession.user);
                setAuthLoading(false);
                // URL 정리 후 persona 페이지로 이동
                console.log('🔄 [LOGIN] URL 정리 및 persona 페이지로 이동');
                window.history.replaceState({}, document.title, window.location.pathname);
                router.push('/persona');
                return;
            }
            
            console.log('🔍 [LOGIN] 기존 세션 확인 시도');
            // 기존 세션 확인
            const session = await getCurrentSession();
            console.log('🔍 [LOGIN] 기존 세션 결과:', session ? '있음' : '없음');
            setUser(session?.user || null);
            
            // 이미 로그인된 경우에만 persona 페이지로 이동
            if (session?.user) {
                console.log('✅ [LOGIN] 기존 세션 발견, persona 페이지로 이동');
                router.push('/persona');
            } else {
                console.log('⚠️ [LOGIN] 로그인된 세션 없음 - 로그인 페이지에 머물기');
                // 세션이 없으면 로그인 페이지에 머물기 (리다이렉트하지 않음)
            }
        } catch (error) {
            console.error('❌ [LOGIN] Error checking user session:', error);
            setUser(null);
        } finally {
            console.log('🔍 [LOGIN] checkUser 완료, authLoading false로 설정');
            setAuthLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        // This function is no longer used
    };

    const handleGoogleSignIn = async () => {
        console.log('🔍 [GOOGLE] Google 로그인 버튼 클릭됨!');
        console.log('🔍 [GOOGLE] 현재 URL:', window.location.href);
        
        // 환경 변수가 설정되지 않은 경우 안내 메시지
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('⚠️ [GOOGLE] 환경 변수가 설정되지 않음');
            alert('Supabase 환경 변수가 설정되지 않았습니다.\n\n.env.local 파일에 다음을 추가해주세요:\n\nNEXT_PUBLIC_SUPABASE_URL=your_supabase_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
            return;
        }
        
        console.log('🔍 [GOOGLE] 환경 변수 확인됨');
        console.log('🔍 [GOOGLE] 로딩 상태 설정 시작');
        setIsLoading(true);
        
        try {
            console.log('🔍 [GOOGLE] signInWithGoogle 호출 시작');
            const { data, error } = await signInWithGoogle();
            
            console.log('🔍 [GOOGLE] signInWithGoogle 응답 받음:', { data: !!data, error: !!error });
            
            if (error) {
                console.error('❌ [GOOGLE] Google sign in error:', error);
                alert('로그인 중 오류가 발생했습니다.');
            } else {
                console.log('✅ [GOOGLE] Google 로그인 성공, Supabase가 리다이렉트 처리');
                console.log('🔍 [GOOGLE] data 객체:', data);
            }
            // 성공 시에는 Supabase가 자동으로 리다이렉트하므로 여기서는 아무것도 하지 않음
        } catch (error) {
            console.error('❌ [GOOGLE] Sign in error:', error);
            alert('로그인 중 오류가 발생했습니다.');
        } finally {
            console.log('🔍 [GOOGLE] Google 로그인 완료, 로딩 상태 해제');
            setIsLoading(false);
        }
    };

    const handleLogin = (event) => {
        event.preventDefault();
        alert('일반 로그인은 현재 지원되지 않습니다. Google 계정으로 로그인해주세요.');
    };

    // 로딩 중일 때 표시할 화면
    if (authLoading) {
        return (
            <>
                <GlobalStyles />
                <div className="login-container">
                    <div className="login-box" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            border: "3px solid rgba(166, 193, 238, 0.3)",
                            borderTop: "3px solid var(--brand2)",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 20px"
                        }}></div>
                        <p>로그인 상태를 확인하는 중...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <GlobalStyles />
            
            {/* 메인 헤더 */}
            <header className="main-header">
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
                <a href="/login" className="btn-login">로그인</a>
            </header>

            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <div className="header-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#a6c1ee" strokeWidth="2" strokeMiterlimit="10"/>
                                <path d="M12 16V8" stroke="#fbc2eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M15 13L12 16L9 13" stroke="#fbc2eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <p>계정에 로그인하여 계속하세요.</p>
                    
                    <div style={{ 
                        background: 'rgba(255, 193, 7, 0.1)', 
                        border: '1px solid rgba(255, 193, 7, 0.3)', 
                        borderRadius: '12px', 
                        padding: '16px', 
                        marginBottom: '24px',
                        textAlign: 'center'
                    }}>
                        <p style={{ 
                            margin: '0 0 12px 0', 
                            color: '#856404', 
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            ⚠️ 일반 로그인은 현재 지원되지 않습니다
                        </p>
                        <p style={{ 
                            margin: '0', 
                            color: '#856404', 
                            fontSize: '13px'
                        }}>
                            Google 계정으로 로그인해주세요
                        </p>
                    </div>

                    <button 
                        className={`btn btn-google ${isLoading ? 'loading' : ''}`} 
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        style={{ marginBottom: '24px' }}
                    >
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.865,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            </svg>
                        )}
                        {isLoading ? '로그인 중...' : 'Google 계정으로 로그인'}
                    </button>

                    <div style={{ 
                        background: 'rgba(166, 193, 238, 0.1)', 
                        border: '1px solid rgba(166, 193, 238, 0.3)', 
                        borderRadius: '12px', 
                        padding: '16px',
                        marginBottom: '24px'
                    }}>
                        <p style={{ 
                            margin: '0', 
                            color: '#2c3e50', 
                            fontSize: '13px',
                            textAlign: 'center',
                            lineHeight: '1.5'
                        }}>
                            💡 <strong>팁:</strong> Google 계정으로 간편하게 로그인하세요.<br/>
                            로그인 후 자동으로 데이트 상대 선택 페이지로 이동합니다.
                        </p>
                    </div>

                    <div className="login-links">
                        <a href="#">비밀번호 찾기</a>
                        <span className="separator">|</span>
                        <a href="#">회원가입</a>
                    </div>
                </div>
            </div>
        </>
    );
}

// 이 컴포넌트를 App으로 export하여 렌더링합니다.
export default LoginPage;
