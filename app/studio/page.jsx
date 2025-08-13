"use client";

import { useState, useEffect } from "react";
import { getCurrentSession, sendAuthToBackend, getIframeUrl } from "../../lib/supabase";

export default function StudioPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [iframeUrl, setIframeUrl] = useState('');
  
  // Vercel에 환경변수로 등록: NEXT_PUBLIC_BACKEND_URL = https://<runpod-프록시-URL>
  const RUNPOD_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const checkUserAndRunpod = async () => {
      try {
        // 사용자 세션 확인
        const session = await getCurrentSession();
        setUser(session?.user || null);
        
        // 백엔드로 인증 정보 전송
        if (session && RUNPOD_URL) {
          await sendAuthToBackend(RUNPOD_URL);
          // iframe URL 생성 (JWT 토큰 포함)
          const url = await getIframeUrl(RUNPOD_URL, 'studio');
          setIframeUrl(url);
        }
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
    setError("RunPod Studio 서비스에 연결할 수 없습니다.");
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
          <p>RunPod Studio 서비스에 연결 중...</p>
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
      {/* 로그인 후 좌측 상단 홈 버튼 */}
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
          title="RunPod Studio"
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
            <p>RunPod Studio 로딩 중...</p>
          </div>
        </div>
      )}
      
      <iframe
        title="데연소 Studio (Runpod)"
        src={iframeUrl || `${RUNPOD_URL}/studio`}
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

function LeftPanel() {
  return (
    <section style={{ background:"#111827", borderRadius:12, padding:12 }}>
      <h2 style={{ marginBottom:12, fontSize:16 }}>웹캠 · 지표</h2>
      <WebcamCapture />
      <Metrics />
    </section>
  );
}

function CenterPanel() {
  return (
    <section style={{ background:"#111827", borderRadius:12, padding:12, display:"grid", gridTemplateRows:"auto 1fr auto", gap:12 }}>
      <h2 style={{ fontSize:16, margin:0 }}>중앙 영상 / 오버레이</h2>
      <OverlayView />
      <Controls />
    </section>
  );
}

function RightPanel() {
  return (
    <section style={{ background:"#111827", borderRadius:12, padding:12, display:"grid", gridTemplateRows:"1fr auto", gap:12 }}>
      <ChatWindow />
      <ChatInput />
    </section>
  );
}

/* ---------- 좌측: 웹캠 업로드 루프 ---------- */
function WebcamCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    })();
  }, []);

  useEffect(() => {
    let t;
    if (running) {
      const tick = async () => {
        const v = videoRef.current, c = canvasRef.current;
        if (v && c) {
          const w = v.videoWidth || 640, h = v.videoHeight || 480;
          c.width = w; c.height = h;
          const ctx = c.getContext("2d");
          ctx.drawImage(v, 0, 0, w, h);
          const blob = await new Promise(res => c.toBlob(res, "image/jpeg", 0.85));
          if (blob) {
            const form = new FormData();
            form.append("frame", new File([blob], "frame.jpg", { type: "image/jpeg" }));
            try { await fetch(`${API}/api/frame`, { method: "POST", body: form }); } catch {}
          }
        }
        t = setTimeout(tick, 300); // 3~4fps 정도
      };
      tick();
    }
    return () => clearTimeout(t);
  }, [running]);

  return (
    <div>
      <video ref={videoRef} muted playsInline style={{ width:"100%", borderRadius:8, marginBottom:8, background:"#000" }}/>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={()=>setRunning(true)} style={btn}>업로드 시작</button>
        <button onClick={()=>setRunning(false)} style={btn}>중지</button>
      </div>
      <canvas ref={canvasRef} style={{ display:"none" }} />
    </div>
  );
}

/* ---------- 좌측: 지표 (WebSocket 또는 폴링) ---------- */
function Metrics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let ws;
    const connectWS = () => {
      try {
        ws = new WebSocket(`${API.replace("https","wss").replace("http","ws")}/ws/telemetry`);
        ws.onmessage = (e) => setData(JSON.parse(e.data));
        ws.onclose = () => setTimeout(connectWS, 2000);
      } catch {
        // 폴백: 폴링
        const t = setInterval(async () => {
          try {
            const r = await fetch(`${API}/api/data`, { cache:"no-store" });
            setData(await r.json());
          } catch {}
        }, 1000);
        return () => clearInterval(t);
      }
    };
    connectWS();
    return () => { try { ws && ws.close(); } catch {} };
  }, []);

  const total = data?.scores?.total ?? 0;
  return (
    <div style={{ marginTop:12 }}>
      <div>종합 점수: <b>{Math.round(total*100)}%</b></div>
      <small style={{ color:"#9ca3af" }}>{data?.coaching_message || "대기 중…"}</small>
    </div>
  );
}

/* ---------- 중앙: 오버레이/영상 ---------- */
function OverlayView() {
  const imgRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      if (imgRef.current) {
        imgRef.current.src = `${API}/api/overlay.jpg?t=${Date.now()}`;
      }
    }, 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background:"#000", borderRadius:8, minHeight:360, display:"grid", placeItems:"center" }}>
      <img ref={imgRef} alt="overlay" style={{ width:"100%", height:"auto", borderRadius:8 }} />
    </div>
  );
}

function Controls() {
  const [sec, setSec] = useState(1.0);
  return (
    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
      <button style={btn} onClick={()=>fetch(`${API}/api/start`,{method:"POST"})}>분석 시작</button>
      <button style={btn} onClick={()=>fetch(`${API}/api/stop`,{method:"POST"})}>중지</button>
      <label>간격 {sec.toFixed(1)}s</label>
      <input type="range" min="0.2" max="2.0" step="0.1" value={sec}
        onChange={e=>{
          const v = parseFloat(e.target.value);
          setSec(v);
          fetch(`${API}/api/config/interval?seconds=${v}`,{method:"POST"});
        }} />
    </div>
  );
}

/* ---------- 우측: 채팅 ---------- */
function ChatWindow() {
  const [messages, setMessages] = useState([{role:"system", content:"채팅을 시작해보세요."}]);
  return (
    <div style={{ overflowY:"auto", minHeight:300, border:"1px solid #1f2937", borderRadius:8, padding:8 }}>
      {messages.map((m,i)=>(
        <div key={i} style={{ margin:"6px 0", color: m.role==="user"?"#e5e7eb":"#9ca3af" }}>
          <b>{m.role === "user" ? "나" : "코치"}</b> · {m.content}
        </div>
      ))}
    </div>
  );
}

function ChatInput() {
  const [text, setText] = useState("");
  const send = async () => {
    if (!text.trim()) return;
    // TODO: 여기에 너의 챗봇 API 연동 (예: /chat)
    setText("");
  };
  return (
    <div style={{ display:"flex", gap:8 }}>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="메시지를 입력…" style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1px solid #1f2937", background:"#0b1220", color:"#fff" }} />
      <button onClick={send} style={btn}>전송</button>
    </div>
  );
}

const btn = { background:"#0b1220", border:"1px solid #1f2937", color:"#fff", padding:"8px 12px", borderRadius:8, cursor:"pointer" };
