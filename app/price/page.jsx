"use client";

import React from 'react';

// 페이지에 필요한 모든 스타일을 포함하는 컴포넌트입니다.
const GlobalStyles = () => (
  <style>{`
    /* --- 기본 스타일 변수 (메인 페이지와 동일) --- */
    :root {
        --bg: #f7f8fc;
        --glass: rgba(255, 255, 255, 0.75);
        --stroke: rgba(0, 0, 0, 0.08);
        --shadow: 0 12px 50px rgba(0, 0, 0, 0.12);
        --text: #2c3e50;
        --muted: rgba(44, 62, 80, 0.65);
        --brand1: #fbc2eb;
        --brand2: #a6c1ee;
        --brand3: #e6b3ff;
        --radius: 24px;
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

    /* --- 배경 하이라이트 애니메이션 --- */
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
    
    /* --- 헤더 (메인 페이지와 동일) --- */
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
    .main-header nav a.active { color: var(--text); font-weight: 700; }

    .btn { padding: 10px 22px; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block; }
    .btn-login { background: var(--text); color: white; }
    .btn-login:hover { background: #000; transform: translateY(-2px); }
    
    /* --- 가격 페이지 스타일 --- */
    .pricing-section {
        padding: 180px 0 120px;
        text-align: center;
    }
    .section-title {
        margin-bottom: 70px;
    }
    .section-title h1 {
        font-size: 48px;
        font-weight: 800;
        margin-bottom: 15px;
        line-height: 1.3;
    }
    .section-title p {
        font-size: 18px;
        color: var(--muted);
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.7;
    }
    .pricing-grid {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        gap: 30px;
        flex-wrap: wrap;
    }
    .plan-card {
        background: var(--glass);
        border: 1px solid var(--stroke);
        border-radius: var(--radius);
        padding: 40px;
        width: 100%;
        max-width: 400px;
        text-align: left;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
    }
    .plan-card:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow);
    }

    .plan-card.premium {
        border: 1px solid transparent;
        background-image: linear-gradient(var(--glass), var(--glass)), linear-gradient(135deg, var(--brand2), var(--brand1));
        background-origin: border-box;
        background-clip: padding-box, border-box;
        box-shadow: 0 16px 60px rgba(166, 193, 238, 0.3);
    }
    .plan-badge {
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, var(--brand2), var(--brand1));
        color: white;
        padding: 8px 20px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 700;
    }
    .plan-card h2 {
        font-size: 28px;
        margin-top: 0;
        margin-bottom: 5px;
    }
    .plan-card .price {
        font-size: 44px;
        font-weight: 800;
        margin: 10px 0;
        display: flex;
        align-items: baseline;
    }
    .plan-card .price small {
        font-size: 16px;
        font-weight: 500;
        color: var(--muted);
        margin-left: 8px;
    }
    .plan-card .description {
        color: var(--muted);
        margin-bottom: 35px;
        min-height: 44px;
        font-size: 15px;
        line-height: 1.6;
    }
    .feature-list {
        list-style: none;
        padding: 0;
        margin: 0 0 40px 0;
    }
    .feature-list li {
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        font-size: 16px;
    }
    .feature-list li svg {
        width: 20px;
        height: 20px;
        color: var(--brand2);
        flex-shrink: 0;
        margin-top: 3px;
    }
    .plan-card .btn-cta {
        width: 100%;
        padding: 16px;
        font-size: 17px;
        border-radius: 12px;
        background: var(--text);
        color: white;
        text-decoration: none;
        display: block;
        text-align: center;
    }
    .plan-card .btn-cta:hover {
         background: #000;
         transform: translateY(-2px);
         box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .plan-card.premium .btn-cta {
        background: linear-gradient(135deg, var(--brand2), var(--brand1));
    }
    .plan-card.premium .btn-cta:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(166, 193, 238, 0.4);
    }

    /* FAQ 섹션 */
    .faq-section {
        padding: 80px 0;
        text-align: center;
    }
    .faq-section h2 {
        font-size: 32px;
        margin-bottom: 50px;
    }
    .faq-container {
        max-width: 700px;
        margin: 0 auto;
        text-align: left;
    }
    .faq-item {
        border-bottom: 1px solid var(--stroke);
    }
    .faq-item summary {
        font-size: 18px;
        font-weight: 600;
        padding: 20px 0;
        cursor: pointer;
        list-style: none;
        position: relative;
        padding-right: 30px;
    }
    .faq-item summary::-webkit-details-marker {
        display: none;
    }
    .faq-item summary::after {
        content: '+';
        position: absolute;
        right: 5px;
        font-size: 24px;
        color: var(--muted);
        transition: transform 0.2s;
    }
    .faq-item[open] summary::after {
        transform: rotate(45deg);
    }
    .faq-item p {
        padding: 0 10px 20px 10px;
        line-height: 1.7;
        color: var(--muted);
    }

    /* --- 푸터 --- */
    .main-footer { text-align: center; padding: 60px 0; color: var(--muted); font-size: 14px; }
    
    @media (max-width: 992px) {
        .pricing-grid { align-items: stretch; }
    }
    @media (max-width: 768px) {
        .container { padding: 0 20px; }
        .main-header nav { display: none; }
        .pricing-grid { gap: 50px; }
    }
  `}</style>
);

// 가격 페이지를 위한 React 컴포넌트입니다.
function PricingPage() {
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
              <a href="/#problem">공감</a>
              <a href="/#preview">미리보기</a>
              <a href="/#science">과학적 분석</a>
              <a href="/#features">핵심 기능</a>
              <a href="/price" className="active">가격</a>
            </nav>
          </div>
          <a href="/login" className="btn btn-login">로그인</a>
        </div>
      </header>

      <main>
        <section className="pricing-section">
          <div className="container">
            <div className="section-title">
              <h1>성장을 위한 당신의 플랜</h1>
              <p>실패의 두려움을 자신감의 초석으로 바꿔보세요. '데연소'가 당신의 잠재된 매력을 찾아드릴게요.</p>
            </div>

            <div className="pricing-grid">
              <div className="plan-card">
                <h2>Free</h2>
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
                <a href="/login" className="btn-cta">무료로 시작하기</a>
              </div>

              <div className="plan-card premium">
                <div className="plan-badge">추천 플랜</div>
                <h2>Premium</h2>
                <div className="price">₩9,900<small>/ 월 (예상)</small></div>
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
                <a href="/login" className="btn-cta">프리미엄 구독하기</a>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container">
            <h2>자주 묻는 질문</h2>
            <div className="faq-container">
              <details className="faq-item">
                <summary>무료 플랜의 5회 대화는 언제 초기화되나요?</summary>
                <p>무료 대화 횟수는 매월 1일에 자동으로 초기화됩니다. 새로운 달이 시작되면 다시 5번의 대화 연습을 하실 수 있습니다.</p>
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
    </>
  );
}

// 이 컴포넌트를 다른 파일에서 import하여 사용할 수 있도록 export합니다.
// 여기서는 단일 파일이므로 App으로 이름을 유지합니다.
export default PricingPage;
