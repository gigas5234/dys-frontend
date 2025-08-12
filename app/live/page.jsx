"use client";

import { useState, useEffect } from "react";

export default function LivePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  // Vercel에 환경변수로 등록: NEXT_PUBLIC_BACKEND_URL = https://<runpod-프록시-URL>
  const RUNPOD_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
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
        src={RUNPOD_URL}
        style={{ 
          width: "100%", 
          height: "100vh", 
          border: "0",
          opacity: iframeLoaded ? 1 : 0,
          transition: "opacity 0.3s ease"
        }}
        allow="camera; microphone; autoplay; clipboard-read; clipboard-write; fullscreen"
        allowFullScreen
        referrerPolicy="no-referrer"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
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
