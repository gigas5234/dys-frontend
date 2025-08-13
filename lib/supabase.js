import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

// 환경 변수가 없으면 더미 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 로그인 버튼 핸들러
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://dys-phi.vercel.app" // 로그인 후 돌아올 URL
    }
  });
  if (error) console.error(error);
  return { data, error };
}

// 로그인 후 세션 확인 & 내 프로필 조회(본인 로우만 보임)
export async function fetchMyProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No session");
  const { data, error } = await supabase.from("users").select("*").single();
  if (error) throw error;
  return data;
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error(error);
  return { error };
}

// 현재 세션 가져오기
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// JWT 토큰을 백엔드로 전송
export async function sendAuthToBackend(backendUrl) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No session found');
      return false;
    }

    const response = await fetch(`${backendUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        user_id: session.user.id,
        email: session.user.email,
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })
    });

    if (response.ok) {
      console.log('Auth sent to backend successfully');
      return true;
    } else {
      console.error('Failed to send auth to backend:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error sending auth to backend:', error);
    return false;
  }
}

// iframe용 URL 생성 (JWT 토큰 포함)
export async function getIframeUrl(baseUrl, path) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No session found for iframe URL');
      return `${baseUrl}/${path}`;
    }

    // JWT 토큰을 URL 파라미터로 전달
    const params = new URLSearchParams({
      user_id: session.user.id,
      email: session.user.email,
      token: session.access_token
    });

    return `${baseUrl}/${path}?${params.toString()}`;
  } catch (error) {
    console.error('Error generating iframe URL:', error);
    return `${baseUrl}/${path}`;
  }
}
