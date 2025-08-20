"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [mbti, setMbti] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        
        if (!email || !email.includes('@')) {
            setErrorMessage('올바른 이메일을 입력해주세요.');
            return;
        }
        if (password.length < 6) {
            setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!name.trim()) {
            setErrorMessage('이름을 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);

            // 1) Supabase Auth 회원가입
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name }
                }
            });

            if (signUpError) {
                throw signUpError;
            }

            // 2) 선택: 사용자 프로필 저장(실패해도 회원가입은 유지)
            if (signUpData?.user) {
                await supabase.from('users').insert([
                    {
                        id: signUpData.user.id,
                        name,
                        email,
                        mbti: mbti || null,
                        member_tier: 'basic',
                        cam_calibration: false
                    }
                ]);
            }

            setSuccessMessage('회원 가입이 완료되었습니다');
            setTimeout(() => router.push('/login'), 1800);
        } catch (error) {
            console.error('[SIGNUP] error:', error);
            const msg = (error && error.message ? String(error.message) : '').toLowerCase();
            let uiMessage = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';

            if (msg.includes('already registered')) uiMessage = '이미 가입된 이메일입니다.';
            else if (msg.includes('signups not allowed')) uiMessage = '관리자 설정에서 이메일 회원가입이 비활성화되어 있습니다. Supabase Auth 설정을 확인해주세요.';
            else if (msg.includes('invalid') && msg.includes('email')) uiMessage = '올바른 이메일 형식을 입력해주세요.';
            else if (msg.includes('password should be at least') || msg.includes('password')) uiMessage = '비밀번호는 최소 6자 이상이어야 합니다.';

            setErrorMessage(uiMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <header className="main-header">
                <div className="container">
                    <div className="header-left">
                        <a href="/" className="logo">
                            <img src="/dys_logo.png" alt="데연소" />
                        </a>
                    </div>
                    <div className="header-right">
                        <a href="/login" className="btn btn-login">로그인</a>
                    </div>
                </div>
            </header>

            <main className="auth-page">
                <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <div className="logo"><img src="/dys_logo.png" alt="데연소" className="auth-logo-small" /></div>
                        <div className="header-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#a6c1ee" strokeWidth="2" strokeMiterlimit="10"/>
                                <path d="M12 16V8" stroke="#fbc2eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M15 13L12 16L9 13" stroke="#fbc2eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>

                    <p>계정을 만들어 데연소와 함께 시작하세요.</p>

                    {errorMessage && (
                        <div className="error-message">{errorMessage}</div>
                    )}
                    {successMessage && (
                        <div className="success-message">{successMessage}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </span>
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                placeholder="비밀번호 (최소 6자)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </span>
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                placeholder="비밀번호 확인"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </span>
                        </div>

                        <div className="input-group">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                placeholder="이름"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </span>
                        </div>

                        <div className="input-group">
                            <select
                                id="mbti"
                                name="mbti"
                                value={mbti}
                                onChange={(e) => setMbti(e.target.value)}
                            >
                                <option value="">MBTI 선택 (선택사항)</option>
                                {['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'].map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                            </span>
                        </div>

                        <button type="submit" className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                            <span className="btn-text">{isSubmitting ? '가입 중...' : '회원가입'}</span>
                            {isSubmitting && <div className="spinner"></div>}
                        </button>
                    </form>

                    <div className="login-links">
                        <a href="/login">이미 계정이 있으신가요? 로그인하기</a>
                    </div>
                </div>
                </div>
            </main>
        </>
    );
}
