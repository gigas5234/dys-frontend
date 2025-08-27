"use client";

import React, { useEffect, useRef, useState } from "react";
import { getCurrentSession, supabase, signOut } from "../../lib/supabase";

export default function ScenarioPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [userPlan, setUserPlan] = useState('basic');
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    // 사용자 정보 가져오기
    const fetchUser = async () => {
      const session = await getCurrentSession();
      if (session?.user) {
        setUser(session.user);
        setUserPlan(getUserPlan(session.user));
        // 세팅 동기화: 세션 로드 직후 DB 설정도 불러와 플랜 배지를 정확히 반영
        fetchUserSettings(session.user.id);
      }
    };
    fetchUser();
  }, []);

  // 사용자 플랜 확인 함수 (auth 메타데이터 기준, 기본값 basic)
  const getUserPlan = (user) => {
    if (!user) return 'basic';
    return user.user_metadata?.subscription_plan || 'basic';
  };

  // 실제 사용자 플랜 가져오기 (설정의 member_tier 우선, 그 다음 auth 메타데이터)
  const getActualUserPlan = () => {
    if (userSettings?.member_tier) return userSettings.member_tier;
    if (user?.user_metadata?.subscription_plan) return user.user_metadata.subscription_plan;
    return 'basic';
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 사용자 설정 가져오기 (명시적 사용자 ID 허용)
  const fetchUserSettings = async (userId) => {
    if (!userId) return;
    
    setIsLoadingSettings(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, mbti, member_tier, cam_calibration')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserSettings(data);
      
      // member_tier가 있으면 userPlan도 업데이트
      if (data?.member_tier) {
        setUserPlan(data.member_tier);
      }
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

      if (error) throw error;
      
      // 로컬 상태 업데이트
      setUserSettings(prev => prev ? { ...prev, mbti: newMBTI } : null);
    } catch (error) {
      console.error('MBTI 업데이트 오류:', error);
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

      if (error) throw error;
      
      // 로컬 상태 업데이트
      setUserSettings(prev => prev ? { ...prev, cam_calibration: false } : null);
    } catch (error) {
      console.error('캠 캘리브레이션 삭제 오류:', error);
    }
  };

  // 설정 모달이 열릴 때 사용자 설정 가져오기
  useEffect(() => {
    if (showSettingsModal && user) {
      fetchUserSettings(user.id);
    }
  }, [showSettingsModal, user]);

  // 사용자 정보가 로드되면 설정도 미리 로드
  useEffect(() => {
    if (user && !userSettings) {
      fetchUserSettings(user.id);
    }
  }, [user, userSettings]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
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

  // 사용자 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      const session = await getCurrentSession();
      if (!session?.user) {
        window.location.href = '/login';
      }
    };
    checkSession();
  }, []);

  if (!isClient || !user) {
    return (
      <div className="loading-container">
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
              <div className="user-dropdown" ref={dropdownRef}>
                <div className="plan-badge-header">
                  {userSettings ? (
                    <span className={`plan-type ${getActualUserPlan()}`}>
                      {getActualUserPlan() === 'premium' ? 'Premium' : 'Basic'}
                    </span>
                  ) : (
                    <span className="plan-type basic" style={{ opacity: 0.6 }}>로딩중...</span>
                  )}
                </div>
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
                       <path d="M5 12h14"/>
                       <path d="m12 5 7 7-7 7"/>
                     </svg>
                     시작하기
                   </a>
                   <button onClick={() => {
                     setShowSettingsModal(true);
                     fetchUserSettings(user.id);
                   }} className="user-dropdown-item" role="menuitem">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <circle cx="12" cy="12" r="3"/>
                       <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                     </svg>
                     설정
                   </button>
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
              <div className="auth-buttons">
                <a href="/login" className="btn btn-secondary">로그인</a>
                <a href="/signup" className="btn btn-primary">회원가입</a>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="persona-container">
        <aside className="sidebar">
          <nav>
            <a href="/persona">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              데이트 상대 선택
            </a>
            <a href="/scenario" className="active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              도전 시나리오
            </a>
            <a href="/feedback">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              피드백
            </a>
          </nav>
        </aside>

        <main className="main-content">
          <div className="scenario-content">
            <h1>도전 시나리오</h1>
            <p>다양한 데이트 상황을 연습해보세요.</p>
            
            <div className="scenario-grid">
              <div className="scenario-card">
                <h3>첫 만남</h3>
                <p>소개팅이나 데이트 앱으로 만난 상대와의 첫 만남 시나리오</p>
                <button className="btn btn-primary">시작하기</button>
              </div>
              
              <div className="scenario-card">
                <h3>카페 데이트</h3>
                <p>조용한 카페에서의 대화 시나리오</p>
                <button className="btn btn-primary">시작하기</button>
              </div>
              
              <div className="scenario-card">
                <h3>식사 데이트</h3>
                <p>레스토랑에서의 식사 데이트 시나리오</p>
                <button className="btn btn-primary">시작하기</button>
              </div>
              
              <div className="scenario-card">
                <h3>영화 데이트</h3>
                <p>영화관에서의 데이트 시나리오</p>
                <button className="btn btn-primary">시작하기</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 설정 모달 */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>설정</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowSettingsModal(false)}
                aria-label="닫기"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="setting-group">
                <label>이름</label>
                <div className="setting-value disabled">
                  {userSettings?.name || user?.user_metadata?.full_name || '설정되지 않음'}
                </div>
              </div>
              
              <div className="setting-group">
                <label>이메일</label>
                <div className="setting-value disabled">
                  {user?.email || '설정되지 않음'}
                </div>
              </div>
              
              <div className="setting-group">
                <label>MBTI</label>
                <select 
                  value={userSettings?.mbti || ''} 
                  onChange={(e) => updateMBTI(e.target.value)}
                  disabled={isLoadingSettings}
                >
                  <option value="">MBTI 선택</option>
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
              
              <div className="setting-group">
                <label>멤버십</label>
                <div className="setting-value">
                  {userSettings ? (
                    <span className={`membership-badge ${getActualUserPlan()}`}>
                      {getActualUserPlan() === 'premium' ? 'Premium' : 'Basic'}
                    </span>
                  ) : (
                    <span className="membership-badge loading">로딩중...</span>
                  )}
                </div>
              </div>
              
              {userSettings?.cam_calibration && (
                <div className="setting-group">
                  <label>카메라 캘리브레이션</label>
                  <div className="setting-value">
                    <span className="calibration-status">완료됨</span>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={deleteCamCalibration}
                      disabled={isLoadingSettings}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowSettingsModal(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
