"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mbti: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const mbtiOptions = [
        '', 'INTJ', 'INTP', 'ENTJ', 'ENTP',
        'INFJ', 'INFP', 'ENFJ', 'ENFP',
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
        'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // 입력 시 에러 메시지 초기화
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('이름을 입력해주세요.');
            return false;
        }
        if (!formData.email.trim()) {
            setError('이메일을 입력해주세요.');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('올바른 이메일 형식을 입력해주세요.');
            return false;
        }
        if (formData.password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return false;
        }
        return true;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // 1. Supabase Auth로 회원가입
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name
                    }
                }
            });

            if (authError) {
                throw authError;
            }

            // 2. public.users 테이블에 프로필 정보 저장
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: authData.user.id,
                            name: formData.name,
                            email: formData.email,
                            mbti: formData.mbti || null,
                            member_tier: 'basic',
                            cam_calibration: false
                        }
                    ]);

                if (profileError) {
                    console.error('프로필 저장 오류:', profileError);
                    throw new Error('프로필 정보 저장에 실패했습니다.');
                }

                // 3. 회원가입 성공 후 자동 로그인 시도
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (loginError) {
                    throw new Error('자동 로그인에 실패했습니다. 로그인 페이지에서 다시 시도해주세요.');
                }

                if (loginData.user) {
                    setSuccess('회원가입이 완료되었습니다!');
                    
                    // 2초 후 persona 페이지로 이동
                    setTimeout(() => {
                        router.push('/persona');
                    }, 2000);
                }
            }

        } catch (error) {
            console.error('회원가입 오류:', error);
            
            if (error.message.includes('already registered')) {
                setError('이미 가입된 이메일입니다.');
            } else if (error.message.includes('password')) {
                setError('비밀번호 형식이 올바르지 않습니다.');
            } else if (error.message.includes('자동 로그인에 실패')) {
                setError(error.message);
            } else if (error.message.includes('프로필 정보 저장에 실패')) {
                setError(error.message);
            } else {
                setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="main-header">
                <div className="header-content">
                    <div className="header-left">
                        <a href="/" className="logo-link">
                            <img src="/dys_logo.png" alt="데연소" className="logo" />
                        </a>
                    </div>
                    <div className="header-right">
                        <a href="/login" className="btn btn-login">로그인</a>
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
                    <p>계정을 만들어 데연소와 함께 시작하세요.</p>
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}
                    
                    <form onSubmit={handleSignup}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={formData.name}
                                onChange={handleInputChange}
                                required 
                                placeholder="이름" 
                            />
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </span>
                        </div>
                        <div className="input-group">
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleInputChange}
                                required 
                                placeholder="이메일 주소" 
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
                                value={formData.password}
                                onChange={handleInputChange}
                                required 
                                placeholder="비밀번호 (최소 6자)" 
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
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required 
                                placeholder="비밀번호 확인" 
                            />
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </span>
                        </div>
                        <div className="input-group">
                            <select 
                                id="mbti" 
                                name="mbti" 
                                value={formData.mbti}
                                onChange={handleInputChange}
                                className="mbti-select"
                            >
                                {mbtiOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option || 'MBTI 선택 (선택사항)'}
                                    </option>
                                ))}
                            </select>
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                            </span>
                        </div>
                        <button 
                            type="submit" 
                            className={`btn btn-primary ${loading ? 'loading' : ''}`} 
                            disabled={loading}
                        >
                            <span className="btn-text">
                                {loading ? '가입 중...' : '회원가입'}
                            </span>
                            {loading && <div className="spinner"></div>}
                        </button>
                    </form>

                    <div className="login-links">
                        <a href="/login">이미 계정이 있으신가요? 로그인하기</a>
                    </div>
                </div>
            </div>
        </>
    );
}
