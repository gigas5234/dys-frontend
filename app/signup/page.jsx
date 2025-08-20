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
                    // Auth는 성공했지만 프로필 저장 실패 시 처리
                }
            }

            setSuccess('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
            
            // 3초 후 로그인 페이지로 이동
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (error) {
            console.error('회원가입 오류:', error);
            
            if (error.message.includes('already registered')) {
                setError('이미 가입된 이메일입니다.');
            } else if (error.message.includes('password')) {
                setError('비밀번호 형식이 올바르지 않습니다.');
            } else {
                setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <img src="/dys_logo.png" alt="데연소" className="auth-logo" />
                    <h1>회원가입</h1>
                    <p>데연소와 함께 데이트 연습을 시작해보세요</p>
                </div>

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

                <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">이름 *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="이름을 입력하세요"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">이메일 *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="이메일을 입력하세요"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">비밀번호 *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="최소 6자 이상"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">비밀번호 확인 *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="비밀번호를 다시 입력하세요"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="mbti">MBTI (선택)</label>
                        <select
                            id="mbti"
                            name="mbti"
                            value={formData.mbti}
                            onChange={handleInputChange}
                        >
                            {mbtiOptions.map(option => (
                                <option key={option} value={option}>
                                    {option || 'MBTI를 선택하세요'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                <span className="btn-text">가입 중...</span>
                            </>
                        ) : (
                            <span className="btn-text">회원가입</span>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>이미 계정이 있으신가요? <a href="/login">로그인하기</a></p>
                </div>
            </div>
        </div>
    );
}
