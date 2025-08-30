"use client";

import React, { useState, useEffect } from 'react';
import { updateOnboardingStatus } from '../../lib/supabase';

const OnboardingModal = ({ isOpen, onClose, onComplete, onDismiss }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDismiss, setShowDismiss] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const slides = [
    {
      title: "마음에 드는 상대를 선택하세요",
      description: "10명의 다양한 AI 페르소나 중에서 마음에 드는 상대를 선택할 수 있습니다.",
      image: "/onboarding/slide1-persona-selection.webp",
      alt: "페르소나 선택 화면",
      hasAnimation: true,
             animationElements: [
         // 멀리서 시작해서 중앙 카드로 이동하는 마우스 커서
         { type: 'mouse', x: 10, y: 30, delay: 500 },
         { type: 'mouse', x: 25, y: 35, delay: 1000 },
         { type: 'mouse', x: 40, y: 40, delay: 1500 },
         { type: 'mouse', x: 50, y: 45, delay: 2000 },
         // 중앙 카드 클릭
         { type: 'click', x: 50, y: 45, delay: 2500 },
         // 중앙 카드 하이라이트
         { type: 'highlight', x: 40, y: 35, width: 20, height: 15, delay: 3000 }
       ]
    },
    {
      title: "두 가지 선택지를 경험해보세요",
      description: "다른 상대를 찾아볼 수도 있고, 준비가 완료되면 실제 AI 데이트를 시작할 수도 있습니다.",
      image: "/onboarding/slide2-chat-to-date.webp",
      alt: "채팅에서 두 가지 선택지",
      hasAnimation: true,
             animationElements: [
         // 1. "다른 상대 찾기" 버튼 하이라이트 (좌측 상단)
         { type: 'highlight', x: 10, y: 10, width: 15, height: 8, delay: 500 },
         // 2. "다른 상대 찾기" 버튼으로 마우스 이동
         { type: 'mouse', x: 15, y: 12, delay: 1000 },
         { type: 'mouse', x: 17, y: 14, delay: 1500 },
         // 3. "다른 상대 찾기" 버튼 클릭
         { type: 'click', x: 17, y: 14, delay: 2000 },
         // 4. "데이트 시작하기" 버튼으로 이동 (우측 하단)
         { type: 'mouse', x: 30, y: 40, delay: 3000 },
         { type: 'mouse', x: 35, y: 45, delay: 3500 },
         { type: 'mouse', x: 40, y: 50, delay: 4000 },
         // 5. "데이트 시작하기" 버튼 클릭
         { type: 'click', x: 40, y: 50, delay: 4500 },
         // 6. "데이트 시작하기" 버튼 하이라이트
         { type: 'highlight', x: 35, y: 45, width: 18, height: 10, delay: 5000 }
       ]
    },
    {
      title: "실시간 피드백으로 소통 능력을 향상시키세요",
      description: "카메라와 마이크를 통해 실시간으로 자세, 시선, 목소리를 분석받아 소통 능력을 개선하세요.",
      image: "/onboarding/slide3-studio-overview.webp",
      alt: "GKE 스튜디오 전체 화면",
      hasAnimation: true,
             animationElements: [
         // 좌측 실시간 피드백 영역 하이라이트
         { type: 'highlight', x: 5, y: 15, width: 25, height: 40, delay: 500 },
         // 중앙 마이크 버튼으로 이동
         { type: 'mouse', x: 30, y: 30, delay: 1500 },
         { type: 'mouse', x: 35, y: 30, delay: 2000 },
         // 중앙 마이크 버튼 클릭
         { type: 'click', x: 35, y: 30, delay: 2500 },
         // 중앙 마이크 버튼 하이라이트
         { type: 'highlight', x: 32, y: 25, width: 8, height: 8, delay: 3000 },
         // 우측 채팅창으로 화살표
         { type: 'arrow', x: 45, y: 30, direction: 'right', delay: 3500 },
         // 우측 채팅창 하이라이트
         { type: 'highlight', x: 50, y: 15, width: 20, height: 40, delay: 4000 }
       ]
    }
  ];

  // 모달이 열릴 때 첫 번째 슬라이드로 리셋
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setShowDismiss(false);
    }
  }, [isOpen]);

  // 다음 슬라이드로 이동
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // 이전 슬라이드로 이동
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // 온보딩 완료 처리
  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await updateOnboardingStatus('completed');
      onComplete();
    } catch (error) {
      console.error('온보딩 완료 처리 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 다시보지 않기 처리
  const handleDismiss = async () => {
    setIsLoading(true);
    try {
      await updateOnboardingStatus('dismissed');
      onDismiss();
    } catch (error) {
      console.error('온보딩 거부 처리 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentSlideData = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        {/* 헤더 */}
        <div className="onboarding-header">
          <div className="onboarding-progress">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentSlide ? 'active' : ''} ${index < currentSlide ? 'completed' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          <button className="onboarding-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 슬라이드 내용 */}
        <div className="onboarding-content">
          <div className="slide-image-container">
            <img
              src={currentSlideData.image}
              alt={currentSlideData.alt}
              className="slide-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/600x400/e0e8ff/7d7d7d?text=Screenshot';
              }}
            />
            
                         {/* 애니메이션 요소들 */}
             {currentSlideData.hasAnimation && currentSlideData.animationElements?.map((element, index) => (
               <div
                 key={index}
                 className={`animation-element ${element.type}`}
                 style={{
                   left: element.x + '%',
                   top: element.y + '%',
                   width: element.width ? element.width + '%' : 'auto',
                   height: element.height ? element.height + '%' : 'auto',
                   animationDelay: `${element.delay}ms`
                 }}
               >
                {element.type === 'arrow' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                )}
              </div>
            ))}
          </div>
          
          <div className="slide-text">
            <h2 className="slide-title">{currentSlideData.title}</h2>
            <p className="slide-description">{currentSlideData.description}</p>
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="onboarding-navigation">
          <button
            className="nav-button prev"
            onClick={prevSlide}
            disabled={isFirstSlide}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            이전
          </button>

          <div className="navigation-center">
            {isLastSlide ? (
              <div className="final-actions">
                <label className="dismiss-checkbox">
                  <input
                    type="checkbox"
                    checked={showDismiss}
                    onChange={(e) => setShowDismiss(e.target.checked)}
                  />
                  <span>다시 보지 않기</span>
                </label>
                <button
                  className="btn btn-primary complete-btn"
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  {isLoading ? '처리 중...' : '시작하기'}
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary next-btn"
                onClick={nextSlide}
              >
                다음
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            )}
          </div>

          {showDismiss && (
            <button
              className="nav-button dismiss"
              onClick={handleDismiss}
              disabled={isLoading}
            >
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
