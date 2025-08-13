"use client";

import { useState, useEffect } from "react";
import { getCurrentSession } from "../../lib/supabase";

export default function LivePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [user, setUser] = useState(null);
  
  // Vercel에 환경변수로 등록: NEXT_PUBLIC_BACKEND_URL = https://<runpod-프록시-URL>
  const RUNPOD_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const checkUserAndRunpod = async () => {
      try {
        // 사용자 세션 확인
        const session = await getCurrentSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking user session:', error);
        setUser(null);
      }

      // RunPod URL 확인
      if (!RUNPOD_URL) {
        setError("백엔드 URL이 설정되지 않았습니다.");
        setLoading(false);
        return;
      }

      // URL 유효성 검사
      try {
        new URL(RUNPOD_URL);
      } catch (e) {
        setError("잘못된 백엔드 URL 형식입니다.");
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    checkUserAndRunpod();
  }, [RUNPOD_URL]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const handleIframeError = () => {
    setError("RunPod 서비스에 연결할 수 없습니다.");
  };

  if (loading) {
    return (
      <main style={{ 
        minHeight: "100vh", 
        display: "grid", 
        placeItems: "center", 
        padding: 24,
        background: "#0b1220",
        color: "#fff"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: "3px solid #333", 
            borderTop: "3px solid #fff", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }}></div>
          <p>RunPod 서비스에 연결 중...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ 
        minHeight: "100vh", 
        display: "grid", 
        placeItems: "center", 
        padding: 24,
        background: "#0b1220",
        color: "#fff"
      }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h1 style={{ marginBottom: 12, color: "#ef4444" }}>연결 오류</h1>
          <p style={{ marginBottom: 24 }}>{error}</p>
          <p style={{ fontSize: 14, opacity: 0.7 }}>
            Vercel 환경변수 <b>NEXT_PUBLIC_BACKEND_URL</b> 를 확인하세요.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: "#111827",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.15)",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              marginTop: 16
            }}
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      {/* 로그인 후 우측 상단 홈 버튼 */}
      {user && (
        <button
          onClick={() => window.location.href = '/'}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            width: 50,
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
            zIndex: 1000
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
          title="메인 페이지로 돌아가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </button>
      )}
      {!iframeLoaded && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#0b1220",
          display: "grid",
          placeItems: "center",
          zIndex: 10
        }}>
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: "3px solid #333", 
              borderTop: "3px solid #fff", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }}></div>
            <p>RunPod 로딩 중...</p>
          </div>
        </div>
      )}
      
      <iframe
        title="데연소 Live (Runpod)"
        src={`${RUNPOD_URL}/webcam`}
        style={{ 
          width: "100%", 
          height: "100vh", 
          border: "0",
          opacity: iframeLoaded ? 1 : 0,
          transition: "opacity 0.3s ease"
        }}
        allow="camera; microphone; autoplay; clipboard-read; clipboard-write; fullscreen; display-capture; encrypted-media; geolocation; gyroscope; accelerometer; magnetometer; picture-in-picture; web-share"
        allowFullScreen
        allowTransparency={true}
        referrerPolicy="no-referrer"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        // sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-presentation"
      />
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
