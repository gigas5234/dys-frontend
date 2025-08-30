"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getCurrentSession, restoreSessionFromUrl, signOut, isReturnFromBackend, cleanReturnParams, supabase } from '../lib/supabase';

function HomePage() {
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [visibleBubbles, setVisibleBubbles] = useState([]);
  const [isDateButtonActive, setIsDateButtonActive] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isPageReady, setIsPageReady] = useState(true); // 로딩 화면 비활성화
  const [showAnimations, setShowAnimations] = useState(false);
  const [userPlan, setUserPlan] = useState('basic'); // 사용자 플랜 정보
  const [userSettings, setUserSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const hasAnimatedRef = useRef(false);
  const cleanupRef = useRef(() => {});
  const dropdownRef = useRef(null);

  // 사용자 플랜 확인 함수
  const getUserPlan = (user) => {
    // 실제로는 서버에서 사용자의 구독 정보를 가져와야 함
    // 현재는 기본값으로 'basic' 설정
    if (!user) return 'basic';
    
    // 여기에 실제 구독 정보 확인 로직 추가
    // 예: user.user_metadata?.subscription_plan || 'basic'
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

  // 사용자 세션 확인 함수
  const checkUser = async () => {
    try {
      setLoading(true);
      
      // 기존 세션 확인 (restoreSessionFromUrl은 이미 useEffect에서 호출됨)
      const session = await getCurrentSession();
      setUser(session?.user || null);
      
      // 사용자 플랜 설정
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

  // useEffect를 사용하여 컴포넌트가 렌더링된 후 스크립트 로직을 실행합니다.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    setMounted(true);
    
    // 스크롤 이벤트 핸들러 추가
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 스크롤 진행률 계산 (0-100%)
      const progress = Math.min((scrollY / (documentHeight - windowHeight)) * 100, 100);
      setScrollProgress(progress);
      
      // 첫 번째 섹션(hero-section)에서만 화살표 표시
      // 스크롤이 상단으로 돌아왔을 때도 다시 표시
      setShowScrollArrow(scrollY < windowHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    
    // 한 번만 실행되도록 플래그 추가
    let isInitialized = false;
    
    const run = async () => {
      if (isInitialized) return;
      isInitialized = true;
      
      try {
        await restoreSessionFromUrl(); // URL만 처리
        await checkUser();             // 세션 조회 1회
        cleanReturnParams();           // URL 파라미터 정리
      } catch (error) {
        console.error('Error during initialization:', error);
      }
      
      // 0.5초 후에 애니메이션 시작
      setTimeout(() => {
        setShowAnimations(true);
      }, 500);
    };
    run();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    // 클라이언트에서만 실행
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

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => () => cleanupRef.current(), []);

  // 키보드 화살표 키로 섹션 이동
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyDown = (e) => {
      const sections = [
        'hero-section',
        'problem',
        'empathy',
        'preview',
        'science',
        'features',
        'reviews'
      ];
      
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const currentSectionIndex = Math.round(currentScrollY / windowHeight);
      
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextSectionIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
        const nextSection = document.getElementById(sections[nextSectionIndex]) || 
                          document.querySelector(`.${sections[nextSectionIndex]}`);
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevSectionIndex = Math.max(currentSectionIndex - 1, 0);
        const prevSection = document.getElementById(sections[prevSectionIndex]) || 
                          document.querySelector(`.${sections[prevSectionIndex]}`);
        if (prevSection) {
          prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === 'undefined') return;
    
    // 애니메이션이 활성화된 후에만 reveal 효과 적용
    if (!showAnimations) return;
    
    // 스크롤 시 나타나는 애니메이션 효과
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));

    // 스크롤 패럴랙스 효과 (throttled)
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          parallaxElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elCenterY = rect.top + rect.height / 2;
            const screenCenterY = window.innerHeight / 2;
            const distanceFromCenter = elCenterY - screenCenterY;
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            el.style.setProperty('--parallax', `${distanceFromCenter * -speed * 0.1}px`);
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 컴포넌트가 언마운트될 때 이벤트 리스너를 정리합니다.
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showAnimations]); // showAnimations가 변경될 때마다 실행

  // 채팅 애니메이션을 시작하는 함수
  const startChatAnimation = () => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;
    setIsChatStarted(true);

    const chatMessages = [
      { type: 'me', text: '안녕하세요! 이서아님?' },
      { type: 'ai', text: '네, 안녕하세요! 맞아요' },
      { type: 'me', text: '프로필 보니까 마케터라고 하시네요!' },
      { type: 'ai', text: '네, 브랜드 마케팅을 하고 있어요. 혹시 이번 주말에 시간 괜찮으세요?' },
      { type: 'me', text: '네, 주말 좋아요! 토요일 오후는 어떠세요?' },
      { type: 'ai', text: '토요일 오후 괜찮아요! 어디서 뵙는 게 좋을까요?' },
      { type: 'me', text: '조용한 카페는 어떠세요? 근처에 좋은 곳 알아요!' },
      { type: 'ai', text: '좋아요! 그럼 토요일 오후 2시에 뵙겠습니다' },
    ];

    const timeouts = [];
    chatMessages.forEach((_, index) => {
      const t = setTimeout(() => setVisibleBubbles(p => [...p, index]), (index + 1) * 800);
      timeouts.push(t);
    });
    timeouts.push(setTimeout(() => setIsDateButtonActive(true), (chatMessages.length + 1) * 800));
    cleanupRef.current = () => timeouts.forEach(clearTimeout);
  };

  const chatMessages = [
      { type: 'me', text: '안녕하세요! 이서아님?' },
      { type: 'ai', text: '네, 안녕하세요! 맞아요' },
      { type: 'me', text: '프로필 보니까 마케터라고 하시네요!' },
      { type: 'ai', text: '네, 브랜드 마케팅을 하고 있어요. 혹시 이번 주말에 시간 괜찮으세요?' },
      { type: 'me', text: '네, 주말 좋아요! 토요일 오후는 어떠세요?' },
      { type: 'ai', text: '토요일 오후 괜찮아요! 어디서 뵙는 게 좋을까요?' },
      { type: 'me', text: '조용한 카페는 어떠세요? 근처에 좋은 곳 알아요!' },
      { type: 'ai', text: '좋아요! 그럼 토요일 오후 2시에 뵙겠습니다' },
  ];

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsDropdownOpen(false);
      // 페이지 새로고침 대신 상태만 초기화
      // window.location.reload(); // 제거
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
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


  // JSX: HTML과 유사하지만 JavaScript가 통합된 형태입니다.
  // class -> className, style 속성은 객체로, 주석은 {/**/}으로 변경됩니다.
  return (
    <>
      <header className={`main-header ${showAnimations ? 'fade-in' : ''}`}>
        <div className="container">
          <div className="header-left">
            <a href="/" className="logo">
              <img src="/dys_logo.png" alt="데연소 로고" />
              데연소
            </a>
            <nav>
              <a href="#problem">공감</a>
              <a href="#preview">미리보기</a>
              <a href="#science">과학적 분석</a>
              <a href="#features">핵심 기능</a>
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
                                    <button onClick={() => setShowSettingsModal(true)} className="user-dropdown-item" role="menuitem">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3"/>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
        
        {/* 스크롤 진행률 바 */}
        <div className="scroll-progress-bar">
          <div 
            className="scroll-progress-fill"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
      </header>

      <main className={showAnimations ? 'fade-in' : ''}>
        <section className="hero-section">
            {/* AI 코칭 스마트 애니메이션 */}
            <div className="paint-flow-container">
                {/* AI 뉴런들 */}
                <div className="ai-neuron neuron-left"></div>
                <div className="ai-neuron neuron-right"></div>
                <div className="ai-neuron neuron-top"></div>
                <div className="ai-neuron neuron-bottom"></div>
                <div className="ai-neuron neuron-left-2"></div>
                <div className="ai-neuron neuron-right-2"></div>
                <div className="ai-neuron neuron-top-2"></div>
                <div className="ai-neuron neuron-bottom-2"></div>
                
                {/* AI 연결선 */}
                <div className="ai-connection connection-1"></div>
                <div className="ai-connection connection-2"></div>
                <div className="ai-connection connection-3"></div>
                
                {/* 대화 버블 */}
                <div className="chat-bubble bubble-1">안녕하세요!</div>
                <div className="chat-bubble bubble-2">소통 연습을 시작해볼까요?</div>
                <div className="chat-bubble bubble-3">AI가 도와드릴게요</div>
                
                {/* 데이터 시각화 */}
                <div className="data-point data-1"></div>
                <div className="data-point data-2"></div>
                <div className="data-point data-3"></div>
                <div className="data-point data-4"></div>
                
                {/* 타겟팅 효과 */}
                <div className="target-ring target-1"></div>
                <div className="target-ring target-2"></div>
            </div>
            
            {/* 외각 AI 뉴런 확장 효과 */}
            <div className="ai-outer-neurons">
                <div className="ai-outer-neuron outer-neuron-1"></div>
                <div className="ai-outer-neuron outer-neuron-2"></div>
                <div className="ai-outer-neuron outer-neuron-3"></div>
                <div className="ai-outer-neuron outer-neuron-4"></div>
                <div className="ai-outer-neuron outer-neuron-5"></div>
                <div className="ai-outer-neuron outer-neuron-6"></div>
                
                <div className="outer-connection outer-conn-1"></div>
                <div className="outer-connection outer-conn-2"></div>
                <div className="outer-connection outer-conn-3"></div>
                <div className="outer-connection outer-conn-4"></div>
            </div>
            
            <div className="hero-content">
                <div className="slogan reveal">설렘은 현실로, 실수는 연습으로.</div>
                <h1 className="reveal" style={{transitionDelay: '0.1s'}}>AI 소통 코칭으로<br/>당신의 매력을 발견하세요</h1>
                <p className="reveal" style={{transitionDelay: '0.2s'}}>관계에 대한 막연한 두려움이 있으신가요? 데연소는 실패의 부담이 없는 안전한 공간에서 당신의 소통 능력을 과학적으로 진단하고 잠재된 매력을 찾아드립니다.</p>
                <button 
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            user ? window.location.href = '/persona' : window.location.href = '/login';
                        }
                    }} 
                    className="btn btn-cta reveal" 
                    style={{transitionDelay: '0.3s'}}
                    suppressHydrationWarning
                >
                    {isClient && user ? '데이트 준비하기' : '지금 시작하기'}
                </button>
            </div>
            
            {/* 스크롤 안내 화살표 */}
            {showScrollArrow && (
              <div 
                className="scroll-arrow reveal" 
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  cursor: 'pointer',
                  animation: 'bounce 2s infinite',
                  zIndex: 20,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '12px 20px',
                  boxShadow: '0 4px 20px rgba(166, 193, 238, 0.2)',
                  border: '1px solid rgba(166, 193, 238, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  const problemSection = document.getElementById('problem');
                  if (problemSection) {
                    problemSection.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateX(-50%) scale(1.05)';
                  e.target.style.boxShadow = '0 6px 25px rgba(166, 193, 238, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateX(-50%) scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(166, 193, 238, 0.2)';
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <span style={{ marginBottom: '8px' }}>아래로 스크롤</span>
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="url(#scrollGradient)" 
                    strokeWidth="2"
                  >
                    <defs>
                      <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>
              </div>
            )}
        </section>

        <section id="preview" className="preview-section">
            <div className="container">
                <div className="preview-grid">
                    <div className="preview-text reveal">
                        <h3>실제보다 더 실제같은<br/>AI 데이트 시뮬레이션</h3>
                        <p>다양한 성격과 스토리를 가진 AI 파트너를 직접 선택하고, 약속을 잡는 과정부터 실제 대화까지. 현실적인 시나리오 속에서 당신의 소통 능력을 마음껏 시험하고 발전시켜 보세요.</p>
                    </div>
                    <div className="interactive-mockup reveal" style={{transitionDelay: '0.2s'}}>
                        <div className="mockup-chat-container">
                            <div className="mockup-phone-screen">
                                <div className="mockup-phone-notch"></div>
                                <div className="mockup-phone-view mockup-phone-profile" style={{opacity: isChatStarted ? 0 : 1, transform: isChatStarted ? 'translateX(-20px)' : 'none', pointerEvents: isChatStarted ? 'none' : 'auto'}}>
                                    <img src="/img/woman1_insta.webp" className="mockup-profile-img" alt="AI Persona"/>
                                    <div className="mockup-profile-name">이서아</div>
                                    <div className="mockup-profile-info">28세 · ENFP · 마케터</div>
                                    <button className="mockup-contact-btn" onClick={startChatAnimation}>연락 보내기</button>
                                </div>
                                <div className="mockup-phone-view mockup-phone-chat-view" style={{opacity: isChatStarted ? 1 : 0, transform: isChatStarted ? 'translateX(0)' : 'translateX(20px)', pointerEvents: isChatStarted ? 'auto' : 'none'}}>
                                    <div className="mockup-phone-header"><span className="mockup-phone-header-name">이서아</span></div>
                                    <div className="mockup-phone-chat-log">
                                        {chatMessages.map((msg, index) => (
                                            <div key={index} className={`mockup-phone-bubble ${msg.type} ${visibleBubbles.includes(index) ? 'visible' : ''}`}>{msg.text}</div>
                                        ))}
                                    </div>
                                    <div className="mockup-phone-footer">
                                        <button className={`date-start-button ${isDateButtonActive ? 'active' : ''}`}>데이트 시작하기</button>
                                    </div>
                                </div>
                                <div className="mockup-phone-home-indicator"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="science" className="science-section">
            <div className="container">
                 <div className="section-title reveal">
                    <h2>첫인상을 결정하는 3V의 법칙</h2>
                    <p>메라비언의 법칙에 따르면, 소통에서 가장 큰 영향을 미치는 것은 바로 3V - 시각(Visual), 청각(Vocal), 그리고 언어(Verbal)입니다. 데연소는 이 세 가지 요소를 과학적으로 분석하여 당신의 숨은 매력을 찾아냅니다.</p>
                </div>
                <div className="content-wrapper">
                    <div className="venn-diagram-container reveal">
                        <div className="venn-circle venn-visual"><div className="percent">55%</div><div className="label">Visual</div></div>
                        <div className="venn-circle venn-vocal"><div className="percent">38%</div><div className="label">Vocal</div></div>
                        <div className="venn-circle venn-verbal"><div className="percent">7%</div><div className="label">Verbal</div></div>
                    </div>
                    <div className="text-content reveal" style={{transitionDelay: '0.2s'}}>
                        <h3>'데연소'는 3V를 어떻게 분석할까요?</h3>
                        <p>단순한 대화 분석을 넘어, AI가 당신의 표정, 시선, 목소리, 말투까지 종합적으로 분석해 '데연소 리포트'를 제공합니다.</p>
                        <div className="analysis-grid">
                            <div className="analysis-item visual"><h4>시각(Visual) 분석</h4><p>긍정적 표정, 안정적 시선, 자세 등을 통해 당신의 비언어적 매력을 측정합니다.</p></div>
                            <div className="analysis-item vocal"><h4>청각(Vocal) 분석</h4><p>목소리의 톤과 감정을 분석하여 대화 분위기를 파악하고 긍정 감정에 가중치를 부여합니다.</p></div>
                            <div className="analysis-item verbal"><h4>언어(Verbal) 분석</h4><p>GPT가 대화의 흐름과 연결성을 종합 평가하여 내용의 긍정성을 분석합니다.</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" className="features-section">
            <div className="container">
                <div className="section-title reveal">
                    <h2>'데연소'의 특별한 기능</h2>
                    <p>단순한 대화를 넘어, 당신의 표정, 목소리, 말투까지 분석하는 멀티모달 AI를 통해 입체적인 코칭을 경험하세요.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card reveal">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <h3>실시간 대화 시뮬레이션</h3>
                        <p>원하는 이상형의 AI와 가상 소개팅을 진행하며 실전처럼 대화 연습을 할 수 있습니다. 실패의 두려움 없이 마음껏 시도하며 자신감을 키워보세요.</p>
                    </div>
                    <div className="feature-card reveal" style={{transitionDelay: '0.15s'}}>
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <h3>과학적인 종합 분석 리포트</h3>
                        <p>대화가 끝난 후, 당신의 표정, 시선, 목소리 톤, 대화 균형 등을 분석한 '데연소 리포트'를 제공하여 강점과 개선점을 명확하게 파악할 수 있습니다.</p>
                    </div>
                    <div className="feature-card reveal" style={{transitionDelay: '0.3s'}}>
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <h3>다양한 AI 페르소나</h3>
                        <p>MBTI, 직업, 관심사 등을 조합하여 원하는 이상형에 가까운 AI 파트너를 직접 선택하고, 다양한 상황에 맞는 대화 연습을 할 수 있습니다.</p>
                        
                        {/* 다이나믹 페르소나 카드뷰 */}
                        <div className="persona-showcase">
                            <div className="persona-cards-container">
                                <div className="persona-card" style={{transform: 'rotate(-15deg) translateY(-20px)', animationDelay: '0s'}}>
                                    <img src="/img/woman1_insta.webp" alt="AI Persona 1" />
                                </div>
                                <div className="persona-card" style={{transform: 'rotate(10deg) translateY(10px)', animationDelay: '0.2s'}}>
                                    <img src="/img/man1_insta.webp" alt="AI Persona 2" />
                                </div>
                                <div className="persona-card" style={{transform: 'rotate(-8deg) translateY(-15px)', animationDelay: '0.4s'}}>
                                    <img src="/img/woman2_insta.webp" alt="AI Persona 3" />
                                </div>
                                <div className="persona-card" style={{transform: 'rotate(12deg) translateY(5px)', animationDelay: '0.6s'}}>
                                    <img src="/img/man2_insta.webp" alt="AI Persona 4" />
                                </div>
                                <div className="persona-card" style={{transform: 'rotate(-5deg) translateY(-25px)', animationDelay: '0.8s'}}>
                                    <img src="/img/woman3_insta.webp" alt="AI Persona 5" />
                                </div>
                                <div className="persona-card" style={{transform: 'rotate(8deg) translateY(15px)', animationDelay: '1s'}}>
                                    <img src="/img/man3_insta.webp" alt="AI Persona 6" />
                                </div>
                                <div className="persona-card" style={{transform: 'rotate(-12deg) translateY(-10px)', animationDelay: '1.2s'}}>
                                    <img src="/img/woman4_insta.webp" alt="AI Persona 7" />
                                </div>
                                <div className="persona-card" style={{transform: 'rotate(6deg) translateY(20px)', animationDelay: '1.4s'}}>
                                    <img src="/img/man4_insta.webp" alt="AI Persona 8" />
                                </div>
                                <div className="persona-card" style={{transform: 'rotate(-10deg) translateY(-5px)', animationDelay: '1.6s'}}>
                                    <img src="/img/woman5_insta.webp" alt="AI Persona 9" />
                                </div>
                                <div className="persona-card" style={{transform: 'rotate(15deg) translateY(25px)', animationDelay: '1.8s'}}>
                                    <img src="/img/man5_insta.webp" alt="AI Persona 10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="reviews" className="reviews-section">
            <div className="container">
                <div className="section-title reveal">
                    <h2>실제 사용자들의 이야기</h2>
                    <p>데연소를 통해 자신감을 찾고, 새로운 인연을 만난 분들의 생생한 후기를 확인해보세요.</p>
                </div>
                <div className="reviews-wrapper">
                    <div className="review-track scroll-left">
                        {/* 무한 루프 효과를 위해 리뷰 목록을 복제합니다. */}
                        {[...Array(3)].map((_, i) => (
                          <React.Fragment key={`review-${i}`}>
                            <div className="review-card" key={`review-${i}-1`}><div className="stars">★★★★★</div><p className="comment">소개팅 전날 밤, AI랑 연습한 게 정말 큰 도움이 됐어요. 예전 같았으면 어색해서 말도 못했을 텐데, 자연스럽게 대화를 이어갈 수 있었습니다!</p><p className="author">- 김*준 (31세, 개발자)</p></div>
                            <div className="review-card" key={`review-${i}-2`}><div className="stars">★★★★★</div><p className="comment">제가 어떤 표정을 짓는지, 목소리 톤이 어떤지 객관적으로 알 수 있어서 좋았어요. 리포트 보고 고칠 점을 명확히 알게 됐습니다.</p><p className="author">- 박*연 (28세, 마케터)</p></div>
                            <div className="review-card" key={`review-${i}-3`}><div className="stars">★★★★☆</div><p className="comment">다양한 성격의 AI가 있어서 여러 상황을 연습하기 좋았어요. 다만 가끔 AI 답변이 조금 느릴 때가 있네요. 그래도 만족합니다.</p><p className="author">- 최*우 (34세, 회사원)</p></div>
                            <div className="review-card" key={`review-${i}-4`}><div className="stars">★★★★★</div><p className="comment">솔직히 반신반의했는데, 그냥 대화만 하는 게 아니라 과학적으로 분석해준다는 점이 신뢰가 갔어요. 제 매력이 뭔지 알게 된 기분이에요.</p><p className="author">- 이*은 (29세, 디자이너)</p></div>
                            <div className="review-card" key={`review-${i}-5`}><div className="stars">★★★★★</div><p className="comment">이런 서비스 만들어주셔서 감사합니다. 저처럼 내성적인 사람들한테는 정말 한 줄기 빛과 같아요. 자신감이 많이 생겼어요!</p><p className="author">- 정*솜 (26세, 대학원생)</p></div>
                            <div className="review-card" key={`review-${i}-6`}><div className="stars">★★★★★</div><p className="comment">실패해도 부담이 없다는 점이 가장 큰 장점이에요. 마음 편하게 여러 가지 시도를 해볼 수 있었어요.</p><p className="author">- 윤*호 (30세, 프리랜서)</p></div>
                            <div className="review-card" key={`review-${i}-7`}><div className="stars">★★★★☆</div><p className="comment">리액션이나 질문 타이밍 같은 디테일한 부분을 연습하기에 좋네요.</p><p className="author">- 한*라 (27세, 간호사)</p></div>
                            <div className="review-card" key={`review-${i}-8`}><div className="stars">★★★★★</div><p className="comment">드디어... 썸녀한테 애프터 신청 받았습니다. 다 데연소 덕분입니다. 진심으로요.</p><p className="author">- 강*민 (32세, 연구원)</p></div>
                            <div className="review-card" key={`review-${i}-9`}><div className="stars">★★★★★</div><p className="comment">AI라고 어색할 줄 알았는데, 대화가 너무 자연스러워서 놀랐어요. 시간 가는 줄 모르고 연습했네요.</p><p className="author">- 신*영 (29세, 교사)</p></div>
                            <div className="review-card" key={`review-${i}-10`}><div className="stars">★★★★☆</div><p className="comment">분석 리포트가 생각보다 훨씬 상세해서 놀랐습니다. 다음 업데이트도 기대돼요!</p><p className="author">- 문*혁 (35세, 공무원)</p></div>
                          </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        <section id="problem" className="problem-section">
            <div className="container">
                <div className="section-title reveal">
                    <h2>혹시, 당신의 이야기인가요?</h2>
                    <p>우리 사회는 '관계 단절의 시대'에 살고 있습니다. 이성과의 만남과 대화가 점점 더 특별하고 부담스러운 일이 되어가고 있죠. 더 이상 혼자 고민하지 마세요.</p>
                </div>
                <div className="stats-grid">
                    <div className="stat-card reveal" data-parallax="0.1"><div className="number">75.8%</div><p className="description">현재 연애를 하고 있지 않은 20-50대 성인 남녀의 비율.</p></div>
                    <div className="stat-card reveal" data-parallax="0.2" style={{transitionDelay: '0.15s'}}><div className="number">35.4%</div><p className="description">지금까지 연애 경험이 전혀 없는 20대의 비율.</p></div>
                    <div className="stat-card reveal" data-parallax="0.1" style={{transitionDelay: '0.3s'}}><div className="number">ZERO</div><p className="description">만날 기회는 줄고, 편하게 연습할 기회는 사라졌습니다. 데연소(데이트 연습소)는 실패의 부담감을 덜어주는 환경을 제공합니다.</p></div>
                </div>
            </div>
        </section>

        <section id="empathy" className="empathy-section">
            <div className="container">
                <div className="section-title reveal">
                    <h2>"좋아하는 이성을 만났지만,<br/>놓쳤던 경험이 있으신가요?"</h2>
                    <p>그 순간 무슨 말을 해야 할지 몰라 망설였던 기억, 어색한 침묵에 아쉬웠던 순간들. <span className="highlight-text">그 몇 초의 공백이, 평생의 기회를 놓치게 할 수도 있습니다.</span>
                    <br/><br/>
                    '데연소'는 그런 당신을 위해 탄생했습니다. 실전보다 더 실감 나는 대화 연습으로, 말문이 막히던 순간을 기회의 순간으로 바꿔드립니다. 다음 번엔 주저하지 않고, 마음을 사로잡을 수 있도록 도와드릴게요.</p>
                </div>
            </div>
        </section>

        
        <div className="cta-section reveal">
            <div className="container">
                <h2>이제, 설렘을 현실로 만들 시간</h2>
                <p>가상 훈련을 현실의 성공으로, 실패의 두려움을 자신감의 초석으로 바꿔보세요. 데연소가 당신의 잠재된 매력을 찾아드릴게요.</p>
                                 <button 
                   onClick={() => {
                     if (typeof window !== 'undefined') {
                       user ? window.location.href = '/persona' : window.location.href = '/login';
                     }
                   }} 
                   className="btn btn-cta"
                   suppressHydrationWarning
                 >
                   {isClient && user ? '데이트 준비하기' : '데연소 시작하기'}
                 </button>
            </div>
        </div>
      </main>

      <footer className="main-footer">
        <p>&copy; 2025 데연소. All rights reserved.</p>
      </footer>

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

export default HomePage;
