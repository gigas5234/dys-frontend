"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession, restoreSessionFromUrl, signOut } from '../../lib/supabase';

// 페르소나 데이터
const allPersonas = [
    { gender: 'female', name: '김세아', age: 28, mbti: 'ENFP', job: '마케터', personality: ['활발함', '긍정적'], image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'female', name: '박서진', age: 25, mbti: 'ESFJ', job: '대학생', personality: ['사교적', '다정함'], image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'female', name: '최유나', age: 34, mbti: 'INFJ', job: '상담사', personality: ['통찰력', '따뜻함'], image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'female', name: '이지은', age: 29, mbti: 'ISFP', job: '디자이너', personality: ['예술적', '온화함'], image: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'female', name: '한소희', age: 26, mbti: 'ESTP', job: '필라테스 강사', personality: ['에너제틱', '모험적'], image: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '이준영', age: 31, mbti: 'ISTJ', job: '개발자', personality: ['논리적', '신중함'], image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '정현우', age: 29, mbti: 'ENTP', job: '스타트업 대표', personality: ['도전적', '창의적'], image: 'https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '박도윤', age: 32, mbti: 'INTP', job: '연구원', personality: ['분석적', '지적 호기심'], image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '강태오', age: 27, mbti: 'ESFP', job: '배우 지망생', personality: ['자유로운 영혼', '즉흥적'], image: 'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '서지훈', age: 30, mbti: 'ISFJ', job: '수의사', personality: ['헌신적', '차분함'], image: 'https://images.pexels.com/photos/819530/pexels-photo-819530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
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
    const [currentPersonas, setCurrentPersonas] = useState(allPersonas);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isChatActive, setIsChatActive] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [trackStyle, setTrackStyle] = useState({});
    
    const router = useRouter();
    const trackRef = useRef(null);
    const coverflowRef = useRef(null);
    const isAnimating = useRef(false);
    const chatTimeoutRef = useRef(null);

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
        createNewChat(currentPersonas[index]);

        setTimeout(() => { isAnimating.current = false; }, 500);
    };

    const createNewChat = (persona) => {
        clearTimeout(chatTimeoutRef.current);
        setChatMessages([]);

        const messages = [
            { role: 'me', text: `안녕하세요. ${user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자'}라고 합니다.` },
            { role: 'ai', text: `네, 안녕하세요. 저는 ${persona.name}이라고 합니다.` },
            { role: 'me', text: '혹시 이번 주말 시간이 괜찮으실까요?' },
            { role: 'ai', text: '이번 주말이요? 네, 가능할 것 같습니다.' },
        ];

        let delay = 100;
        messages.forEach((msg) => {
            delay += 1200;
            chatTimeoutRef.current = setTimeout(() => {
                setChatMessages(prev => [...prev, msg]);
            }, delay);
        });
    };

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
            <div className="persona-container">
                <aside className="sidebar">
                    <div className="logo">데연소</div>
                    <nav>
                        <a href="#" className="active">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.783 2.826L12 1l8.217 1.826a1 1 0 0 1 .783.976v9.987a6 6 0 0 1-2.672 4.992L12 23l-6.328-4.219A6 6 0 0 1 3 13.79V3.802a1 1 0 0 1 .783-.976zM5 4.604v9.185a4 4 0 0 0 1.781 3.328L12 20.597l5.219-3.48A4 4 0 0 0 19 13.79V4.604L12 3.05 5 4.604z"></path></svg>
                            <span>데이트 상대 선택</span>
                        </a>
                    </nav>
                    <div className="profile">
                        <img src={user?.user_metadata?.avatar_url || 'https://placehold.co/100x100/e0e8ff/7d7d7d?text=Me'} alt="Profile" />
                        <div className="name">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자'}</div>
                    </div>
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
                                    <div className="phone-chat-log">
                                        {chatMessages.map((msg, index) => (
                                            <div key={index} className={`phone-bubble ${msg.role}`}>{msg.text}</div>
                                        ))}
                                    </div>
                                    <div className="phone-footer">
                                        <button className={`date-start-button ${chatMessages.length >= 4 ? 'active' : ''}`}>데이트 시작하기</button>
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
                        <header className="main-header">
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
        </>
    );
}

export default PersonaPage;
