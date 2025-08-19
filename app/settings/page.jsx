"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession, restoreSessionFromUrl, signOut, supabase } from '../../lib/supabase';

export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [userSettings, setUserSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [userPlan, setUserPlan] = useState('basic');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();

    // 사용자 플랜 가져오기
    const getUserPlan = (user) => {
        if (!user) return 'basic';
        return user.user_metadata?.subscription_plan || 'basic';
    };

    // 사용자 설정 가져오기
    const fetchUserSettings = async () => {
        if (!user) return;
        
        try {
            setIsLoadingSettings(true);
            
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (error) {
                console.error('Error fetching user settings:', error);
                return;
            }
            
            setUserSettings(data);
        } catch (error) {
            console.error('Error fetching user settings:', error);
        } finally {
            setIsLoadingSettings(false);
        }
    };

    // MBTI 업데이트
    const updateMBTI = async (newMBTI) => {
        if (!user) return;
        
        try {
            const { error } = await supabase
                .from('users')
                .update({ mbti: newMBTI })
                .eq('id', user.id);
            
            if (error) {
                console.error('Error updating MBTI:', error);
                return;
            }
            
            // 로컬 상태 업데이트
            setUserSettings(prev => ({ ...prev, mbti: newMBTI }));
        } catch (error) {
            console.error('Error updating MBTI:', error);
        }
    };

    // 캠 캘리브레이션 삭제
    const deleteCamCalibration = async () => {
        if (!user) return;
        
        try {
            const { error } = await supabase
                .from('users')
                .update({ cam_calibration: false })
                .eq('id', user.id);
            
            if (error) {
                console.error('Error deleting cam calibration:', error);
                return;
            }
            
            // 로컬 상태 업데이트
            setUserSettings(prev => ({ ...prev, cam_calibration: false }));
        } catch (error) {
            console.error('Error deleting cam calibration:', error);
        }
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // 사용자 세션 확인
    const checkUser = async () => {
        try {
            setLoading(true);
            // URL에서 토큰 복원 시도 (OAuth 이후 직접 접근 대비)
            const restored = await restoreSessionFromUrl();
            if (restored) {
                setUser(restored.user);
                setUserPlan(getUserPlan(restored.user));
                setLoading(false);
                return;
            }

            // 기존 세션 확인
            const session = await getCurrentSession();
            setUser(session?.user || null);
            if (session?.user) {
                setUserPlan(getUserPlan(session.user));
            }
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

    // 사용자가 로드되면 설정 가져오기
    useEffect(() => {
        if (user) {
            fetchUserSettings();
        }
    }, [user]);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isClient || loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <>
            <header className="main-header">
                <div className="header-content">
                    <div className="logo">
                        <a href="/">
                            <img src="/dys_logo.png" alt="데연소" />
                        </a>
                    </div>
                    
                    <div className="user-section" ref={dropdownRef}>
                        <div className="user-info">
                            <span className="user-plan">{userPlan === 'premium' ? 'Premium' : 'Basic'}</span>
                        </div>
                        <button 
                            className="user-dropdown-toggle" 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                        >
                            <img 
                                src={user?.user_metadata?.avatar_url || 'https://placehold.co/32x32/e0e8ff/7d7d7d?text=Me'} 
                                alt="Profile" 
                                className="user-avatar"
                            />
                            <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                        </button>
                        
                        <div id="user-menu" className={`user-dropdown-menu ${isDropdownOpen ? 'open' : ''}`} role="menu">
                            <a href="/persona" className="user-dropdown-item" role="menuitem">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                </svg>
                                시작하기
                            </a>
                            <a href="/settings" className="user-dropdown-item active" role="menuitem">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                </svg>
                                설정
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
                </div>
            </header>

            <main className="settings-page">
                <div className="settings-container">
                    <header className="settings-header">
                        <h1>설정</h1>
                        <p>계정 정보와 개인 설정을 관리하세요.</p>
                    </header>

                    <div className="settings-content">
                        {isLoadingSettings ? (
                            <div className="settings-loading">
                                <div className="loading-spinner"></div>
                                <p>설정을 불러오는 중...</p>
                            </div>
                        ) : userSettings ? (
                            <div className="settings-sections">
                                <section className="settings-section">
                                    <h2>기본 정보</h2>
                                    <div className="setting-group">
                                        <label className="setting-label">이름</label>
                                        <div className="setting-value">
                                            {user?.user_metadata?.full_name || '이름 없음'}
                                        </div>
                                    </div>
                                    
                                    <div className="setting-group">
                                        <label className="setting-label">이메일</label>
                                        <div className="setting-value">
                                            {user?.email || '이메일 없음'}
                                        </div>
                                    </div>
                                </section>

                                <section className="settings-section">
                                    <h2>개인 설정</h2>
                                    <div className="setting-group">
                                        <label className="setting-label">MBTI</label>
                                        <select 
                                            className="setting-input"
                                            value={userSettings.mbti || ''}
                                            onChange={(e) => updateMBTI(e.target.value)}
                                        >
                                            <option value="">MBTI를 선택하세요</option>
                                            <option value="INTJ">INTJ</option>
                                            <option value="INTP">INTP</option>
                                            <option value="ENTJ">ENTJ</option>
                                            <option value="ENTP">ENTP</option>
                                            <option value="INFJ">INFJ</option>
                                            <option value="INFP">INFP</option>
                                            <option value="ENFJ">ENFJ</option>
                                            <option value="ENFP">ENFP</option>
                                            <option value="ISTJ">ISTJ</option>
                                            <option value="ISFJ">ISFJ</option>
                                            <option value="ESTJ">ESTJ</option>
                                            <option value="ESFJ">ESFJ</option>
                                            <option value="ISTP">ISTP</option>
                                            <option value="ISFP">ISFP</option>
                                            <option value="ESTP">ESTP</option>
                                            <option value="ESFP">ESFP</option>
                                        </select>
                                    </div>
                                </section>

                                <section className="settings-section">
                                    <h2>시스템 설정</h2>
                                    <div className="setting-group">
                                        <label className="setting-label">캠 캘리브레이션</label>
                                        <div className="setting-value">
                                            {userSettings.cam_calibration ? (
                                                <div className="calibration-status">
                                                    <span className="status-success">✅ 완료</span>
                                                    <button 
                                                        className="btn-delete-calibration"
                                                        onClick={deleteCamCalibration}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="status-pending">⏳ 미완료</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="setting-group">
                                        <label className="setting-label">멤버십</label>
                                        <div className="setting-value">
                                            <span className={`membership-badge ${userSettings.member_tier || 'basic'}`}>
                                                {userSettings.member_tier === 'premium' ? 'Premium' : 'Basic'}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="settings-error">
                                <p>설정을 불러올 수 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
