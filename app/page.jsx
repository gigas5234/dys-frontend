"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signInWithGoogle, signOut, getCurrentSession } from "../lib/supabase";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // 컴포넌트 마운트 시 세션 확인
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // 환경 변수가 설정되지 않은 경우 더미 사용자로 설정
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setUser(null);
        setAuthLoading(false);
        return;
      }
      
      const session = await getCurrentSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking user session:', error);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // 환경 변수가 설정되지 않은 경우 안내 메시지
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      alert('Supabase 환경 변수가 설정되지 않았습니다.\n\n.env.local 파일에 다음을 추가해주세요:\n\nNEXT_PUBLIC_SUPABASE_URL=your_supabase_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign in error:', error);
        alert('로그인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    // 바로 /live로 이동 (Runpod를 iframe으로 임베드)
    router.push("/live");
  };

  if (authLoading) {
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
          width: 40,
          height: 40,
          border: "3px solid rgba(255,255,255,0.3)",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
      </main>
    );
  }

  return (
    <main style={{ 
      minHeight: "100vh", 
      display: "grid", 
      placeItems: "center", 
      padding: 24, 
      background: "linear-gradient(135deg, #0b1220 0%, #1e293b 100%)",
      color: "#fff",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Apple SD Gothic Neo, Malgun Gothic",
      position: "relative"
    }}>
      {/* 로그인 후 우측 상단 홈 버튼 */}
      {user && (
        <button
          onClick={() => window.location.href = '/studio'}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
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
          title="RunPod Studio로 이동"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </button>
      )}
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

        {user ? (
          // 로그인된 상태
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <div style={{
              padding: "16px 24px",
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: 12,
              color: "#22c55e",
              fontSize: "0.9rem",
              fontWeight: "500"
            }}>
              ✅ {user.email}로 로그인됨
            </div>
            
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

            <button
              onClick={handleSignOut}
              disabled={loading}
              style={{
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                padding: "12px 24px",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.3s ease",
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = "rgba(148, 163, 184, 0.1)";
                  e.target.style.borderColor = "rgba(148, 163, 184, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = "transparent";
                  e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                }
              }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          // 로그인되지 않은 상태
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                background: loading 
                  ? "#374151" 
                  : "linear-gradient(135deg, #4285f4, #34a853)",
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
                  : "0 10px 30px rgba(66, 133, 244, 0.3)",
                transform: loading ? "scale(0.98)" : "scale(1)",
                minWidth: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 15px 40px rgba(66, 133, 244, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 10px 30px rgba(66, 133, 244, 0.3)";
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
                  로그인 중...
                </span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google로 로그인
                </>
              )}
            </button>

            <p style={{ 
              fontSize: "0.9rem", 
              color: "#64748b", 
              margin: 0,
              lineHeight: 1.5
            }}>
              서비스를 이용하려면 로그인이 필요합니다
            </p>
          </div>
        )}
        
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
            💡 <strong>팁:</strong> {user ? "카메라와 마이크 권한을 허용해주세요." : "Google 계정으로 간편하게 로그인하세요."}
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
