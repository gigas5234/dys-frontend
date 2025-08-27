"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getCurrentSession, restoreSessionFromUrl, signOut, supabase } from '../../lib/supabase';

function PricePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userPlan, setUserPlan] = useState('basic'); // 사용자 플랜 정보
  const [userSettings, setUserSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const dropdownRef = useRef(null);

  // 사용자 플랜 확인 함수
  const getUserPlan = (user) => {
    if (!user) return 'basic';
    return user.user_metadata?.subscription_plan || 'basic';
  };

  // 실제 사용자 플랜 반환 함수 (로딩 상태 고려)
  const getActualUserPlan = () => {
    if (isLoadingSettings) return 'loading';
    return userSettings?.member_tier || userPlan;
  };

  // 사용자 설정 가져오기
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
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // 사용자 정보가 로드되면 설정도 미리 로드
  useEffect(() => {
    if (user && !userSettings) {
      fetchUserSettings(user.id);
    }
  }, [user]);

  // 사용자 세션 확인
  const checkUser = async () => {
    try {
      setLoading(true);
      
      // URL에서 토큰이 있는지 확인하고 세션 복원 시도
      const restoredSession = await restoreSessionFromUrl();
      if (restoredSession) {
        setUser(restoredSession.user);
        setUserPlan(getUserPlan(restoredSession.user));
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

  // 설정 모달 닫기
  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  // MBTI 업데이트 함수
  const updateMBTI = async (mbti) => {
    if (!user || !userSettings) return;

    setIsLoadingSettings(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ mbti })
        .eq('id', user.id);

      if (error) throw error;
      setUserSettings(prev => ({ ...prev, mbti }));
      alert('MBTI가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('Error updating MBTI:', error);
      alert('MBTI 업데이트에 실패했습니다.');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // 캠 캘리브레이션 삭제 함수
  const deleteCamCalibration = async () => {
    if (!user || !userSettings) return;

    if (confirm('캠 캘리브레이션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setIsLoadingSettings(true);
      try {
        const { error } = await supabase
          .from('users')
          .update({ cam_calibration: null })
          .eq('id', user.id);

        if (error) throw error;
        setUserSettings(prev => ({ ...prev, cam_calibration: null }));
        alert('캠 캘리브레이션이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('Error deleting cam calibration:', error);
        alert('캠 캘리브레이션 삭제에 실패했습니다.');
      } finally {
        setIsLoadingSettings(false);
      }
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
              <img src="/dys_logo.png" alt="데연소 로고" />
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
                                    <button onClick={() => setShowSettingsModal(true)} className="user-dropdown-item" role="menuitem">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3"/>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
              <p>"놓치면 후회할 성장의 기회, 프리미엄에서 시작하세요."</p>
            </div>

            <div className="pricing-grid">
              <div className="plan-card">
                <h2>Basic</h2>
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
                <a href="/persona" className="btn-cta">Basic으로 시작하기</a>
              </div>

              <div className="plan-card premium">
                <div className="plan-badge">추천 플랜</div>
                <h2>Premium</h2>
                <div className="price">₩9,900<small>/ 월</small></div>
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
                <button 
                  onClick={() => setShowPremiumAlert(true)} 
                  className="btn-cta"
                >
                  프리미엄 구독하기
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container">
            <h2>자주 묻는 질문</h2>
            <div className="faq-container">
              <details className="faq-item">
                <summary>Basic 플랜의 5회 대화는 언제 초기화되나요?</summary>
                <p>Basic 플랜의 대화 횟수는 매월 1일에 자동으로 초기화됩니다. 새로운 달이 시작되면 다시 5번의 대화 연습을 하실 수 있습니다.</p>
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

      {/* 프리미엄 준비중 알림 팝업 */}
      {showPremiumAlert && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card alert-modal">
            <div className="modal-header">
              <h3>알림</h3>
              <button 
                className="modal-close" 
                aria-label="닫기" 
                onClick={() => setShowPremiumAlert(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="alert-content">
                <div className="alert-icon">🚧</div>
                <h4>아직 준비중입니다</h4>
                <p>프리미엄 구독 서비스는 현재 개발 중입니다.<br/>조금만 기다려주세요!</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowPremiumAlert(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 설정 모달 */}
      {showSettingsModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card settings-modal">
            <div className="modal-header">
              <h3>설정</h3>
              <button className="modal-close" aria-label="닫기" onClick={closeSettingsModal}>×</button>
            </div>
            <div className="modal-body">
              {isLoadingSettings ? (
                <div className="settings-loading">
                  <div className="loading-spinner"></div>
                  <p>설정을 불러오는 중...</p>
                </div>
              ) : userSettings ? (
                <div className="settings-content">
                  <div className="setting-group">
                    <label className="setting-label">이름</label>
                    <div className="setting-value disabled">
                      {user?.user_metadata?.full_name || '이름 없음'}
                    </div>
                  </div>
                  
                  <div className="setting-group">
                    <label className="setting-label">이메일</label>
                    <div className="setting-value disabled">
                      {user?.email || '이메일 없음'}
                    </div>
                  </div>
                  
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
                      <span className={`membership-badge ${getActualUserPlan()}`}>
                        {getActualUserPlan() === 'premium' ? 'Premium' : 'Basic'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="settings-error">
                  <p>설정을 불러올 수 없습니다.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={closeSettingsModal}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PricePage;
