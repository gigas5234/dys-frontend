"use client";

import React, { useState, useEffect, useRef } from 'react';

// 모든 스타일을 컴포넌트 내에 포함시킵니다.
const GlobalStyles = () => (
  <style>{`
    /* --- 기본 스타일 변수 (기존 테마 유지) --- */
    :root {
        --bg: #f7f8fc;
        --glass: rgba(255, 255, 255, 0.6);
        --stroke: rgba(0, 0, 0, 0.08);
        --shadow: 0 12px 50px rgba(0, 0, 0, 0.12);
        --text: #2c3e50;
        --muted: rgba(44, 62, 80, 0.65);
        --brand1: #fbc2eb;
        --brand2: #a6c1ee;
        --brand3: #e6b3ff;
        --radius: 24px;
        --transition-speed: 0.5s;
    }

    /* --- 기본 설정 --- */
    * {
        box-sizing: border-box;
    }

    html, body {
        margin: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
        background: var(--bg);
        color: var(--text);
        overflow-x: hidden;
        scroll-behavior: smooth;
        word-break: keep-all;
    }

    /* --- 배경 하이라이트 애니메이션 (스크롤 패럴랙스 효과 추가) --- */
    .background-highlight {
        content: '';
        position: fixed;
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
        will-change: transform; /* GPU 가속 활성화 */
    }

    @keyframes backgroundHighlight {
        0% { transform: translate(-50%, -50%) rotate(0deg) scale(1.2); }
        100% { transform: translate(-50%, -50%) rotate(360deg) scale(1.4); }
    }

    .container {
        width: 100%;
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 40px;
    }
    
    /* --- 스크롤 기반 애니메이션 --- */
    .reveal {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        will-change: opacity, transform;
    }
    .reveal.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* --- 공통 섹션 스타일 --- */
    section {
        padding: 120px 0;
        position: relative;
    }
    section[id] {
        scroll-margin-top: 100px;
    }
    
    .section-title h2 {
        font-size: 42px;
        font-weight: 800;
        margin-bottom: 15px;
        line-height: 1.3;
    }
    
    .section-title p {
        font-size: 18px;
        color: var(--muted);
        max-width: 700px;
        margin: 0 auto;
        line-height: 1.7;
    }
    .section-title {
        text-align: center;
        margin-bottom: 80px;
    }

    /* --- 헤더 --- */
    .main-header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 20px 0;
        z-index: 1000;
        background: rgba(247, 248, 252, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--stroke);
        transition: transform 0.3s ease-out;
    }
    
    .main-header .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: none;
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
    .main-header nav { display: flex; gap: 30px; }
    .main-header nav a { font-weight: 600; color: var(--muted); text-decoration: none; transition: color 0.3s ease; }
    .main-header nav a:hover { color: var(--text); }
    
    .btn { padding: 10px 22px; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block; }
    .btn-login { background: var(--text); color: white; }
    .btn-login:hover { background: #000; transform: translateY(-2px); }
    .btn-cta { background: linear-gradient(135deg, var(--brand2), var(--brand1)); color: white; padding: 18px 35px; font-size: 18px; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    .btn-cta:hover { transform: translateY(-3px); box-shadow: 0 6px 25px rgba(166, 193, 238, 0.4); }

    /* --- 히어로 섹션 --- */
    .hero-section { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 100vh; }
    .hero-section .slogan { font-size: 22px; font-weight: 600; margin-bottom: 15px; background: linear-gradient(135deg, var(--brand2), var(--brand1)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-section h1 { font-size: 58px; font-weight: 800; margin: 0 0 20px 0; line-height: 1.2; max-width: 800px; }
    .hero-section p { font-size: 20px; color: var(--muted); max-width: 600px; margin-bottom: 40px; line-height: 1.7; }
    
    /* --- 문제 제기 섹션 --- */
    .problem-section { background: rgba(255,255,255,0.2); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; text-align: center; }
    .stat-card { background: var(--glass); border: 1px solid var(--stroke); border-radius: var(--radius); padding: 40px 30px; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); transition: transform 0.4s ease, box-shadow 0.4s ease; }
    .stat-card:hover { transform: translateY(-8px); box-shadow: var(--shadow); }
    .stat-card .number { font-size: 60px; font-weight: 800; background: linear-gradient(135deg, var(--brand2), var(--brand1)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .stat-card .description { font-size: 16px; color: var(--muted); line-height: 1.6; }

    /* --- 공감 문구 섹션 --- */
    .empathy-section { text-align: center; }
    .empathy-section h2 { font-size: 38px; line-height: 1.4; max-width: 800px; margin: 0 auto 20px; }
    .empathy-section p { font-size: 18px; color: var(--muted); max-width: 650px; margin: 0 auto; line-height: 1.8; }
    
    .highlight-text {
        font-weight: 800;
        font-size: 1.15em;
        background: linear-gradient(135deg, var(--brand2), var(--brand1));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
        text-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        -webkit-text-stroke: 0.5px rgba(44, 62, 80, 0.5);
        animation: pulse-effect 2s ease-in-out infinite;
    }

    @keyframes pulse-effect {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.5;
            transform: scale(1.02);
        }
    }

    /* --- 서비스 미리보기 섹션 --- */
    .preview-section { background: #fff; }
    .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .preview-text { text-align: left; }
    .preview-text h3 { font-size: 32px; margin-bottom: 15px; }
    .preview-text p { font-size: 17px; color: var(--muted); line-height: 1.7; margin-bottom: 25px; }
    
    .interactive-mockup { display: flex; justify-content: center; align-items: center; }
    .mockup-chat-container { width: 300px; height: 620px; background-image: linear-gradient(135deg, #393e41 0%, #1c1c1e 74%); border-radius: 48px; padding: 14px; box-shadow: 0 25px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.1); transition: transform 0.5s ease; }
    .mockup-chat-container:hover { transform: scale(1.03); }
    .mockup-phone-screen { width: 100%; height: 100%; background: var(--bg); border-radius: 34px; display: flex; flex-direction: column; overflow: hidden; position: relative; }
    .mockup-phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 28px; background: #1c1c1e; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px; z-index: 10; }
    .mockup-phone-home-indicator { width: 130px; height: 5px; background: rgba(0,0,0,0.3); border-radius: 10px; position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); z-index: 10; }
    
    .mockup-phone-view { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: opacity 0.4s ease, transform 0.4s ease; }
    .mockup-phone-profile { text-align: center; padding: 40px 20px 20px; }
    .mockup-profile-img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 4px solid #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .mockup-profile-name { font-size: 20px; font-weight: 700; margin-bottom: 5px; }
    .mockup-profile-info { font-size: 14px; color: var(--muted); }
    .mockup-contact-btn { background: var(--brand2); color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: all 0.3s ease; }
    .mockup-contact-btn:hover { background: #8aa9d6; transform: translateY(-2px); }
    
    .mockup-phone-chat-view { display: flex; flex-direction: column; height: 100%; }
    .mockup-phone-header { padding: 10px 15px; padding-top: 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--stroke); flex-shrink: 0; }
    .mockup-phone-header .name { font-weight: 600; }
    .mockup-phone-chat-log { flex: 1; padding: 15px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
    .mockup-phone-bubble { padding: 8px 12px; border-radius: 15px; max-width: 80%; line-height: 1.5; font-size: 13px; opacity: 0; transform: translateY(10px) scale(0.9); transition: opacity 0.5s ease, transform 0.5s ease; }
    .mockup-phone-bubble.visible { opacity: 1; transform: translateY(0) scale(1); }
    .mockup-phone-bubble.me { align-self: flex-end; background: var(--brand2); color: #fff; }
    .mockup-phone-bubble.ai { align-self: flex-start; background: #fff; border: 1px solid var(--stroke); }
    .mockup-phone-footer { padding: 15px; text-align: center; }
    .date-start-button { width: 100%; padding: 12px; border: none; border-radius: 15px; background: linear-gradient(135deg, var(--brand2), var(--brand1)); color: #fff; font-size: 16px; font-weight: 600; cursor: default; opacity: 0; transform: scale(0.9); transition: all 0.3s ease; }
    .date-start-button.active { opacity: 1; transform: scale(1); }

    /* --- 과학적 근거 섹션 --- */
    .science-section .content-wrapper { display: flex; align-items: center; gap: 60px; }
    .venn-diagram-container { flex: 0 0 300px; position: relative; width: 300px; height: 300px; }
    .venn-circle { position: absolute; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; color: white; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,0.3); backdrop-filter: blur(5px); transition: all 0.4s ease; }
    .venn-diagram-container:hover .venn-circle { transform: scale(1.05); }
    .venn-circle .percent { font-size: 40px; line-height: 1; }
    .venn-circle .label { font-size: 18px; margin-top: 5px; }
    
    .venn-visual { width: 220px; height: 220px; background: rgba(166, 193, 238, 0.8); top: 0; left: 50%; transform: translateX(-50%); z-index: 1; }
    .venn-vocal { width: 190px; height: 190px; background: rgba(230, 179, 255, 0.8); bottom: 0; left: 0; z-index: 2; }
    .venn-verbal { width: 100px; height: 100px; background: rgba(251, 194, 235, 0.85); bottom: 10px; right: 10px; z-index: 3; }

    .science-section .text-content { flex-grow: 1; }
    .science-section .text-content h3 { font-size: 28px; font-weight: 700; margin-bottom: 20px; }
    .science-section .text-content p { color: var(--muted); line-height: 1.8; margin-bottom: 25px; }
    .analysis-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
    .analysis-item { border-left: 3px solid; padding-left: 20px; }
    .analysis-item.visual { border-color: #a6c1ee; }
    .analysis-item.vocal { border-color: #e6b3ff; }
    .analysis-item.verbal { border-color: #fbc2eb; }
    .analysis-item h4 { margin: 0 0 5px 0; font-size: 18px; }
    .analysis-item p { font-size: 15px; color: var(--muted); line-height: 1.6; margin: 0; }

    /* --- 핵심 기능 섹션 --- */
    .features-section { background: rgba(255,255,255,0.2); }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    .feature-card { background: var(--glass); border: 1px solid var(--stroke); border-radius: var(--radius); padding: 40px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); text-align: center; transition: transform 0.4s ease, box-shadow 0.4s ease; }
    .feature-card:hover { transform: translateY(-10px); box-shadow: var(--shadow); }
    .feature-card .icon { width: 50px; height: 50px; margin: 0 auto 20px auto; color: var(--brand2); }
    .feature-card h3 { font-size: 22px; margin: 0 0 10px 0; }
    .feature-card p { color: var(--muted); line-height: 1.6; }

    /* --- 실제 후기 섹션 --- */
    .reviews-section {
        padding-top: 60px;
        padding-bottom: 120px;
    }
    .reviews-wrapper {
        position: relative;
        overflow: hidden;
        -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    }
    .review-track {
        display: flex;
        gap: 30px;
        width: fit-content;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
    }
    .review-track.scroll-left {
        animation-name: scroll-left;
        animation-duration: 50s;
    }
    .review-track.scroll-right {
        animation-name: scroll-right;
        animation-duration: 50s;
    }
    .reviews-wrapper:hover .review-track {
        animation-play-state: paused;
    }

    @keyframes scroll-left {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
    }
    @keyframes scroll-right {
        from { transform: translateX(-50%); }
        to { transform: translateX(0); }
    }

    .review-card {
        width: 350px;
        flex-shrink: 0;
        background: var(--glass);
        border: 1px solid var(--stroke);
        border-radius: var(--radius);
        padding: 30px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }
    .review-card .stars {
        color: #f5c518;
        margin-bottom: 15px;
        font-size: 18px;
    }
    .review-card .comment {
        font-size: 16px;
        line-height: 1.7;
        margin-bottom: 20px;
        color: var(--text);
    }
    .review-card .author {
        font-weight: 600;
        font-size: 15px;
        text-align: right;
        color: var(--muted);
    }
    
    /* --- CTA 섹션 --- */
    .cta-section { text-align: center; background: linear-gradient(135deg, var(--brand2), var(--brand1)); color: white; border-radius: var(--radius); padding: 80px 40px; margin: 120px 20px 0; }
    .cta-section h2 { font-size: 36px; font-weight: 800; margin-bottom: 20px; color: white; }
    .cta-section p { font-size: 18px; max-width: 600px; margin: 0 auto 40px auto; opacity: 0.9; }
    .cta-section .btn-cta { background: white; color: var(--text); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .cta-section .btn-cta:hover { background: #f0f0f0; transform: translateY(-3px); box-shadow: 0 6px 25px rgba(0,0,0,0.25); }

    /* --- 푸터 --- */
    .main-footer { text-align: center; padding: 60px 0; color: var(--muted); font-size: 14px; }

    /* --- 반응형 디자인 --- */
    @media (max-width: 992px) {
        .preview-grid { grid-template-columns: 1fr; gap: 40px; }
        .preview-text { text-align: center; }
        .science-section .content-wrapper { flex-direction: column; text-align: center; }
        .analysis-grid { grid-template-columns: 1fr; gap: 30px; }
        .analysis-item { text-align: left; }
    }
    @media (max-width: 768px) {
        .hero-section h1, .section-title h2, .empathy-section h2 { font-size: 36px; }
        section { padding: 80px 0; }
        .container { padding: 0 20px; }
        .main-header nav { display: none; }
    }
  `}</style>
);

function App() {
  // 상태(state)를 사용하여 UI의 동적인 부분을 관리합니다.
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [visibleBubbles, setVisibleBubbles] = useState([]);
  const [isDateButtonActive, setIsDateButtonActive] = useState(false);
  const chatAnimated = useRef(false);

  // useEffect를 사용하여 컴포넌트가 렌더링된 후 스크립트 로직을 실행합니다.
  useEffect(() => {
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

    // 스크롤 패럴랙스 효과
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    const backgroundHighlight = document.querySelector('.background-highlight');
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (backgroundHighlight) {
        backgroundHighlight.style.transform = `translate(-50%, -50%) translateY(${scrollY * 0.3}px)`;
      }
      parallaxElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenterY = rect.top + rect.height / 2;
        const screenCenterY = window.innerHeight / 2;
        const distanceFromCenter = elCenterY - screenCenterY;
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        el.style.transform = `translateY(${distanceFromCenter * -speed * 0.1}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);

    // 컴포넌트가 언마운트될 때 이벤트 리스너를 정리합니다.
    return () => {
      revealElements.forEach(el => observer.unobserve(el));
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때 한 번만 실행되도록 합니다.

  // 채팅 애니메이션을 시작하는 함수
  const startChatAnimation = () => {
    if (chatAnimated.current) return;
    chatAnimated.current = true;
    setIsChatStarted(true);

    const chatMessages = [
      { type: 'me', text: '안녕하세요!' },
      { type: 'ai', text: '네, 안녕하세요!' },
      { type: 'me', text: '혹시 이번 주말에 시간 괜찮으세요?' },
      { type: 'ai', text: '네, 주말 좋아요!' },
      { type: 'me', text: '그럼 토요일 어떠세요?' },
    ];

    let totalDelay = 0;
    chatMessages.forEach((_, index) => {
      const delay = (index + 1) * 800;
      setTimeout(() => {
        setVisibleBubbles(prev => [...prev, index]);
      }, delay);
      totalDelay = delay;
    });

    setTimeout(() => {
      setIsDateButtonActive(true);
    }, totalDelay + 800);
  };

  const chatMessages = [
      { type: 'me', text: '안녕하세요!' },
      { type: 'ai', text: '네, 안녕하세요!' },
      { type: 'me', text: '혹시 이번 주말에 시간 괜찮으세요?' },
      { type: 'ai', text: '네, 주말 좋아요!' },
      { type: 'me', text: '그럼 토요일 어떠세요?' },
  ];

  // JSX: HTML과 유사하지만 JavaScript가 통합된 형태입니다.
  // class -> className, style 속성은 객체로, 주석은 {/**/}으로 변경됩니다.
  return (
    <>
      <GlobalStyles />
      <div className="background-highlight"></div>

      <header className="main-header">
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
          <a href="/login" className="btn btn-login">로그인</a>
        </div>
      </header>

      <main>
        <section className="hero-section container">
            <div className="slogan reveal">설렘은 현실로, 실수는 연습으로.</div>
            <h1 className="reveal" style={{transitionDelay: '0.1s'}}>AI 소통 코칭으로<br/>당신의 매력을 발견하세요</h1>
            <p className="reveal" style={{transitionDelay: '0.2s'}}>관계에 대한 막연한 두려움이 있으신가요? 데연소는 실패의 부담이 없는 안전한 공간에서 당신의 소통 능력을 과학적으로 진단하고 잠재된 매력을 찾아드립니다.</p>
            <a href="/price" className="btn btn-cta reveal" style={{transitionDelay: '0.3s'}}>지금 시작하기</a>
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
                    <div className="stat-card reveal" data-parallax="0.1" style={{transitionDelay: '0.3s'}}><div className="number">ZERO</div><p className="description">만날 기회는 줄고, 편하게 연습할 기회는 사라졌습니다. 데연소는 실패의 부담감을 덜어주는 환경을 제공합니다.</p></div>
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
                                    <img src="https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="mockup-profile-img" alt="AI Persona"/>
                                    <div className="mockup-profile-name">이지은</div>
                                    <div className="mockup-profile-info">29세 · ISFP · 디자이너</div>
                                    <button className="mockup-contact-btn" onClick={startChatAnimation}>연락 보내기</button>
                                </div>
                                <div className="mockup-phone-view mockup-phone-chat-view" style={{opacity: isChatStarted ? 1 : 0, transform: isChatStarted ? 'translateX(0)' : 'translateX(20px)', pointerEvents: isChatStarted ? 'auto' : 'none'}}>
                                    <div className="mockup-phone-header"><span className="mockup-phone-header-name">이지은</span></div>
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
            </div>
            <div className="reviews-wrapper">
                <div className="review-track scroll-left">
                    {/* 무한 루프 효과를 위해 리뷰 목록을 복제합니다. */}
                    {[...Array(2)].map((_, i) => (
                      <React.Fragment key={i}>
                        <div className="review-card"><div className="stars">★★★★★</div><p className="comment">소개팅 전날 밤, AI랑 연습한 게 정말 큰 도움이 됐어요. 예전 같았으면 어색해서 말도 못했을 텐데, 자연스럽게 대화를 이어갈 수 있었습니다!</p><p className="author">- 김민준 (31세, 개발자)</p></div>
                        <div className="review-card"><div className="stars">★★★★★</div><p className="comment">제가 어떤 표정을 짓는지, 목소리 톤이 어떤지 객관적으로 알 수 있어서 좋았어요. 리포트 보고 고칠 점을 명확히 알게 됐습니다.</p><p className="author">- 박서연 (28세, 마케터)</p></div>
                        <div className="review-card"><div className="stars">★★★★☆</div><p className="comment">다양한 성격의 AI가 있어서 여러 상황을 연습하기 좋았어요. 다만 가끔 AI 답변이 조금 느릴 때가 있네요. 그래도 만족합니다.</p><p className="author">- 최현우 (34세, 회사원)</p></div>
                        <div className="review-card"><div className="stars">★★★★★</div><p className="comment">솔직히 반신반의했는데, 그냥 대화만 하는 게 아니라 과학적으로 분석해준다는 점이 신뢰가 갔어요. 제 매력이 뭔지 알게 된 기분이에요.</p><p className="author">- 이지은 (29세, 디자이너)</p></div>
                        <div className="review-card"><div className="stars">★★★★★</div><p className="comment">이런 서비스 만들어주셔서 감사합니다. 저처럼 내성적인 사람들한테는 정말 한 줄기 빛과 같아요. 자신감이 많이 생겼어요!</p><p className="author">- 정다솜 (26세, 대학원생)</p></div>
                      </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="reviews-wrapper" style={{marginTop: '30px'}}>
                <div className="review-track scroll-right">
                    {[...Array(2)].map((_, i) => (
                      <React.Fragment key={i}>
                        <div className="review-card"><div className="stars">★★★★★</div><p className="comment">실패해도 부담이 없다는 점이 가장 큰 장점이에요. 마음 편하게 여러 가지 시도를 해볼 수 있었어요.</p><p className="author">- 윤지호 (30세, 프리랜서)</p></div>
                        <div className="review-card"><div className="stars">★★★★☆</div><p className="comment">리액션이나 질문 타이밍 같은 디테일한 부분을 연습하기에 좋네요.</p><p className="author">- 한소라 (27세, 간호사)</p></div>
                        <div className="review-card"><div className="stars">★★★★★</div><p className="comment">드디어... 썸녀한테 애프터 신청 받았습니다. 다 데연소 덕분입니다. 진심으로요.</p><p className="author">- 강태민 (32세, 연구원)</p></div>
                        <div className="review-card"><div className="stars">★★★★★</div><p className="comment">AI라고 어색할 줄 알았는데, 대화가 너무 자연스러워서 놀랐어요. 시간 가는 줄 모르고 연습했네요.</p><p className="author">- 신아영 (29세, 교사)</p></div>
                        <div className="review-card"><div className="stars">★★★★☆</div><p className="comment">분석 리포트가 생각보다 훨씬 상세해서 놀랐습니다. 다음 업데이트도 기대돼요!</p><p className="author">- 문성혁 (35세, 공무원)</p></div>
                      </React.Fragment>
                    ))}
                </div>
            </div>
        </section>

        
        <div className="cta-section reveal">
            <div className="container">
                <h2>이제, 설렘을 현실로 만들 시간</h2>
                <p>가상 훈련을 현실의 성공으로, 실패의 두려움을 자신감의 초석으로 바꿔보세요. 데연소가 당신의 잠재된 매력을 찾아드릴게요.</p>
                <a href="/price" className="btn btn-cta">데연소 시작하기</a>
            </div>
        </div>
      </main>

      <footer className="main-footer">
        <p>&copy; 2025 데연소. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
