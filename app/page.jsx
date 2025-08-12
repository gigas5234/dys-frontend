"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    // 바로 /live로 이동 (Runpod를 iframe으로 임베드)
    router.push("/live");
  };

  return (
    <main style={{ 
      minHeight: "100vh", 
      display: "grid", 
      placeItems: "center", 
      padding: 24, 
      background: "linear-gradient(135deg, #0b1220 0%, #1e293b 100%)",
      color: "#fff",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Apple SD Gothic Neo, Malgun Gothic"
    }}>
      <div style={{ 
        textAlign: "center", 
        maxWidth: 500,
        padding: "40px 20px"
      }}>
        <div style={{
          width: 80,
          height: 80,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          borderRadius: "50%",
          margin: "0 auto 24px",
          display: "grid",
          placeItems: "center",
          fontSize: 32,
          fontWeight: "bold",
          boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
        }}>
          🎥
        </div>
        
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: "bold", 
          marginBottom: 16,
          background: "linear-gradient(135deg, #fff, #94a3b8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          데연소 Live
        </h1>
        
        <p style={{ 
          fontSize: "1.1rem", 
          color: "#94a3b8", 
          marginBottom: 40,
          lineHeight: 1.6
        }}>
          RunPod 기반 실시간 웹캠 피드백 시스템
        </p>
        
        <button
          onClick={handleStart}
          disabled={loading}
          style={{
            background: loading 
              ? "#374151" 
              : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "#fff",
            border: "none",
            padding: "16px 32px",
            borderRadius: 12,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1.1rem",
            fontWeight: "600",
            transition: "all 0.3s ease",
            boxShadow: loading 
              ? "none" 
              : "0 10px 30px rgba(59, 130, 246, 0.3)",
            transform: loading ? "scale(0.98)" : "scale(1)",
            minWidth: 200
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 15px 40px rgba(59, 130, 246, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 10px 30px rgba(59, 130, 246, 0.3)";
            }
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{
                width: 16,
                height: 16,
                border: "2px solid transparent",
                borderTop: "2px solid #fff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              열 준비 중...
            </span>
          ) : (
            "시작하기"
          )}
        </button>
        
        <div style={{ 
          marginTop: 40, 
          padding: "20px", 
          background: "rgba(255,255,255,0.05)", 
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <p style={{ 
            fontSize: "0.9rem", 
            color: "#94a3b8", 
            margin: 0,
            lineHeight: 1.5
          }}>
            💡 <strong>팁:</strong> 카메라와 마이크 권한을 허용해주세요.
          </p>
        </div>
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
