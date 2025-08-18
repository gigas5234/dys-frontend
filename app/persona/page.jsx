"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession, restoreSessionFromUrl, signOut } from '../../lib/supabase';

// 페르소나 데이터
const allPersonas = [
    { gender: 'female', name: '이서아', age: 28, mbti: 'ENFP', job: '마케터', personality: ['활발함', '긍정적'], image: '/img/woman1_insta.webp' },
    { gender: 'female', name: '김연진', age: 25, mbti: 'ESFJ', job: '대학생', personality: ['사교적', '다정함'], image: '/img/woman2_insta.webp' },
    { gender: 'female', name: '이진아', age: 34, mbti: 'INFJ', job: '디자이너', personality: ['통찰력', '따뜻함'], image: '/img/woman3_insta.webp' },
    { gender: 'female', name: '박지은', age: 29, mbti: 'ISFP', job: '상담사', personality: ['예술적', '온화함'], image: '/img/woman4_insta.webp' },
    { gender: 'female', name: '최소희', age: 26, mbti: 'ESTP', job: '필라테스 강사', personality: ['에너제틱', '모험적'], image: '/img/woman5_insta.webp' },
    { gender: 'male', name: '한승준', age: 31, mbti: 'ISTJ', job: '스타트업 대표', personality: ['논리적', '신중함'], image: '/img/man1_insta.webp' },
    { gender: 'male', name: '박찬수', age: 29, mbti: 'ENTP', job: '개발자', personality: ['도전적', '창의적'], image: '/img/man2_insta.webp' },
    { gender: 'male', name: '박도윤', age: 32, mbti: 'INTP', job: '연구원', personality: ['분석적', '지적 호기심'], image: '/img/man3_insta.webp' },
    { gender: 'male', name: '강태오', age: 27, mbti: 'ESFP', job: '배우 지망생', personality: ['자유로운 영혼', '즉흥적'], image: '/img/man4_insta.webp' },
    { gender: 'male', name: '서지훈', age: 30, mbti: 'ISFJ', job: '대학생', personality: ['헌신적', '차분함'], image: '/img/man5_insta.webp' },
];

// 페르소나 카드 컴포넌트
const PersonaCard = ({ persona, isSelected, onClick, isProfileCard = false }) => {
    const tagsHtml = persona.personality.map(tag => <div key={tag} className="tag">#{tag}</div>);
    const cardClasses = `persona-card ${isSelected && !isProfileCard ? 'selected' : ''}`;

    return (
        <div className={cardClasses} onClick={onClick}>
            <img src={persona.image} alt={persona.name} className="persona-card-image" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x500/e0e8ff/7d7d7d?text=Image'; }} />
            <div className="persona-card-content">
                <div className="persona-card-name">{persona.name}</div>
                <div className="persona-card-info">{persona.age}세 · {persona.mbti} · {persona.job}</div>
                <div className="persona-card-tags">{tagsHtml}</div>
            </div>
        </div>
    );
};

function PersonaPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentPersonas, setCurrentPersonas] = useState(allPersonas);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isChatActive, setIsChatActive] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [trackStyle, setTrackStyle] = useState({});
    const [isDateStartActive, setIsDateStartActive] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    const router = useRouter();
    const trackRef = useRef(null);
    const coverflowRef = useRef(null);
    const isAnimating = useRef(false);
    const chatTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);
    const chatLogRef = useRef(null);

    // 사용자 세션 확인
    const checkUser = async () => {
        try {
            setLoading(true);
            // URL에서 토큰 복원 시도 (OAuth 이후 직접 접근 대비)
            const restored = await restoreSessionFromUrl();
            if (restored) {
                setUser(restored.user);
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

    // 헤더 높이를 측정하여 CSS 변수로 반영 (레이아웃 오프셋 정확화)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const updateHeaderHeight = () => {
            const header = document.querySelector('.main-header');
            if (!header) return;
            const height = Math.round(header.getBoundingClientRect().height);
            document.documentElement.style.setProperty('--header-height', `${height}px`);
        };
        updateHeaderHeight();
        window.addEventListener('resize', updateHeaderHeight);
        return () => window.removeEventListener('resize', updateHeaderHeight);
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await signOut();
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    const openProfileModal = () => setIsProfileModalOpen(true);
    const closeProfileModal = () => setIsProfileModalOpen(false);

    const updateSlider = useCallback((index) => {
        if (!trackRef.current || !coverflowRef.current) return;
        
        const newIndex = Math.max(0, Math.min(index, currentPersonas.length - 1));
        setSelectedIndex(newIndex);

        const cards = trackRef.current.children;
        if (!cards.length || !cards[newIndex]) return;

        const container = coverflowRef.current;
        const selectedCard = cards[newIndex];
        
        const containerWidth = container.offsetWidth;
        const cardWidth = selectedCard.offsetWidth;
        const cardLeft = selectedCard.offsetLeft;

        const translateX = (containerWidth / 2) - cardLeft - (cardWidth / 2);
        setTrackStyle({ transform: `translate3d(${translateX}px, -50%, 0)` });

    }, [currentPersonas.length]);

    useEffect(() => {
        updateSlider(0);
    }, [currentPersonas, updateSlider]);

    useEffect(() => {
        const handleResize = () => updateSlider(selectedIndex);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedIndex, updateSlider]);

    const handleFilterClick = (filter) => {
        if (isAnimating.current || activeFilter === filter) return;
        
        setActiveFilter(filter);
        setIsChatActive(false);

        const filtered = filter === 'all' 
            ? allPersonas 
            : allPersonas.filter(p => p.gender === filter);
        
        setCurrentPersonas(filtered);
    };

    const handleCardClick = (index) => {
        if (index === selectedIndex) {
            startChatView(index);
        } else {
            updateSlider(index);
        }
    };

    const startChatView = (index) => {
        if (isAnimating.current) return;
        isAnimating.current = true;
        
        setIsChatActive(true);
        setIsDateStartActive(true); // 버튼 즉시 활성화
        createNewChat(currentPersonas[index]);

        setTimeout(() => { isAnimating.current = false; }, 500);
    };

    const createNewChat = (persona) => {
        clearTimeout(chatTimeoutRef.current);
        setChatMessages([]);

        const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자';
        const messages = [
            { role: 'me', text: `안녕하세요. ${userName}이라고 합니다.` },
            { role: 'ai', text: `네, 안녕하세요. 저는 ${persona.name}이라고 합니다.` },
            { role: 'me', text: '혹시 이번 주말 시간이 괜찮으실까요?' },
            { role: 'ai', text: '이번 주말이요? 네, 가능할 것 같습니다.' },
            { role: 'me', text: '그렇다면 혹시 어디서 뵙는 게 좋을까요?' },
            { role: 'ai', text: '조용한 곳이 좋을 것 같은데 카페 괜찮으신가요?' },
            { role: 'me', text: '네, 좋습니다. 그럼 XX카페는 어떠세요?' },
            { role: 'ai', text: '네, 거기 괜찮습니다.' },
            { role: 'me', text: '그럼 토요일 오후 1시에 뵙겠습니다.' },
            { role: 'ai', text: '네, 알겠습니다. 그때 뵙겠습니다.' }
        ];

        let delay = 100;
        messages.forEach((msg) => {
            delay += 1000;
            chatTimeoutRef.current = setTimeout(() => {
                setChatMessages(prev => [...prev, msg]);
            }, delay);
        });
    };

    // 메시지가 추가될 때 하단으로 자동 스크롤
    useEffect(() => {
        if (!chatLogRef.current) return;
        chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }, [chatMessages]);

    // 로그인되지 않은 사용자는 홈으로 리다이렉트
    if (isClient && !loading && !user) {
        router.push('/login');
        return null;
    }

    if (loading) {
        return (
            <div className="persona-loading">
                <div className="loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    const selectedPersona = currentPersonas[selectedIndex];

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
                            <a href="/price">가격</a>
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
            <div className="persona-container">
                <aside className="sidebar">
                    <nav>
                        <a href="#" className="active">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.783 2.826L12 1l8.217 1.826a1 1 0 0 1 .783.976v9.987a6 6 0 0 1-2.672 4.992L12 23l-6.328-4.219A6 6 0 0 1 3 13.79V3.802a1 1 0 0 1 .783-.976zM5 4.604v9.185a4 4 0 0 0 1.781 3.328L12 20.597l5.219-3.48A4 4 0 0 0 19 13.79V4.604L12 3.05 5 4.604z"></path></svg>
                            <span>데이트 상대 선택</span>
                        </a>
                        <a href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94a7,7,0,0,0,.05-1,7,7,0,0,0-.05-1l2.11-1.65a.5.5,0,0,0,.12-.64l-2-3.46a.5.5,0,0,0-.6-.22l-2.49,1a7.05,7.05,0,0,0-1.73-1l-.38-2.65A.5.5,0,0,0,11.5,1h-4a.5.5,0,0,0-.5.42L6.62,4.07a7,7,0,0,0-1.73,1l-2.49-1a.5.5,0,0,0-.6.22l-2,3.46a.5.5,0,0,0,.12.64L2.62,10a7,7,0,0,0,0,2L.42,13.65a.5.5,0,0,0-.12.64l2,3.46a.5.5,0,0,0,.6.22l2.49-1a7.05,7.05,0,0,0,1.73,1l.38,2.65A.5.5,0,0,0,7.5,21h4a.5.5,0,0,0,.5-.42l.38-2.65a7.05,7.05,0,0,0,1.73-1l2.49,1a.5.5,0,0,0,.6-.22l2-3.46a.5.5,0,0,0-.12-.64ZM9.5,15A3,3,0,1,1,12.5,12,3,3,0,0,1,9.5,15Z"/></svg>
                            <span>설정</span>
                        </a>
                    </nav>
                    <button type="button" className="profile" onClick={openProfileModal}>
                        <img src={user?.user_metadata?.avatar_url || 'https://placehold.co/100x100/e0e8ff/7d7d7d?text=Me'} alt="Profile" />
                        <div className="name">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자'}</div>
                    </button>
                </aside>

                <main className={`main-content ${isChatActive ? 'chat-active' : ''}`}>
                    {selectedPersona && (
                        <div className="chat-view-container">
                            <div className="chat-simulation-container">
                                <div className="phone-screen">
                                    <div className="phone-notch"></div>
                                    <div className="phone-header">
                                        <button className="back-button" onClick={() => setIsChatActive(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z"></path></svg>
                                            다른 상대 찾기
                                        </button>
                                        <span className="name">{selectedPersona.name}</span>
                                    </div>
                                    <div className="phone-chat-log" ref={chatLogRef}>
                                        {chatMessages.map((msg, index) => (
                                            <div key={index} className={`phone-bubble ${msg.role}`}>{msg.text}</div>
                                        ))}
                                    </div>
                                    <div className="phone-footer">
                                        <button className={`date-start-button ${isDateStartActive ? 'active' : ''}`}>데이트 시작하기</button>
                                    </div>
                                    <div className="phone-home-indicator"></div>
                                </div>
                            </div>
                            <div className="selected-persona-profile">
                               <PersonaCard persona={selectedPersona} isSelected={true} isProfileCard={true} />
                            </div>
                        </div>
                    )}

                    <div className="persona-selection-container">
                        <header className="section-header">
                            <div>
                                <h1>오늘, 누구와 대화해볼까요?</h1>
                                <p>마음에 드는 상대를 선택하고 대화를 시작해보세요.</p>
                            </div>
                        </header>
                        <div className="filter-buttons">
                            <button className={activeFilter === 'all' ? 'active' : ''} onClick={() => handleFilterClick('all')}>전체</button>
                            <button className={activeFilter === 'female' ? 'active' : ''} onClick={() => handleFilterClick('female')}>Female</button>
                            <button className={activeFilter === 'male' ? 'active' : ''} onClick={() => handleFilterClick('male')}>Male</button>
                        </div>
                        <div className="persona-coverflow" ref={coverflowRef}>
                            <div className="persona-track" ref={trackRef} style={trackStyle}>
                                {currentPersonas.map((persona, index) => (
                                    <PersonaCard 
                                        key={persona.name} 
                                        persona={persona} 
                                        isSelected={index === selectedIndex}
                                        onClick={() => handleCardClick(index)}
                                    />
                                ))}
                            </div>
                            <button className="nav-arrow left" onClick={() => updateSlider(selectedIndex - 1)} disabled={selectedIndex <= 0}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z"/></svg>
                            </button>
                            <button className="nav-arrow right" onClick={() => updateSlider(selectedIndex + 1)} disabled={selectedIndex >= currentPersonas.length - 1}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"/></svg>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
            {isProfileModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>프로필</h3>
                            <button className="modal-close" aria-label="닫기" onClick={closeProfileModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-profile">
                                <img src={user?.user_metadata?.avatar_url || 'https://placehold.co/100x100/e0e8ff/7d7d7d?text=Me'} alt="Profile" />
                                <div>
                                    <div className="name">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자'}</div>
                                    <div className="email">{user?.email}</div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeProfileModal}>닫기</button>
                            <button className="btn btn-danger" onClick={handleLogout}>로그아웃</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PersonaPage;
