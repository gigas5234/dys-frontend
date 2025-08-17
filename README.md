# 데연소 (DYS) - AI 데이트 시뮬레이션 플랫폼

Next.js 14 기반의 AI 데이트 시뮬레이션 프론트엔드 애플리케이션입니다.

## 프로젝트 개요

데연소는 사용자가 다양한 AI 페르소나와 데이트 시뮬레이션을 경험할 수 있는 플랫폼입니다. 구글 로그인을 통해 인증하고, 다양한 성격의 AI 캐릭터와 대화하며 데이트 경험을 시뮬레이션할 수 있습니다.

## 프로젝트 구조

```
dys_frontend/
├── app/
│   ├── layout.jsx              # 루트 레이아웃 (Inter 폰트 설정)
│   ├── page.jsx                # 메인 페이지 (랜딩 페이지)
│   ├── login/
│   │   └── page.jsx            # 로그인 페이지 (구글 OAuth)
│   ├── price/
│   │   └── page.jsx            # 가격 페이지 (구독 플랜)
│   └── persona/
│       └── page.jsx            # 페르소나 선택 페이지 (AI 캐릭터)
├── lib/
│   └── supabase.js             # Supabase 클라이언트 설정
├── public/
│   └── dys_logo.png            # 프로젝트 로고
├── next.config.js              # Next.js 설정
├── package.json                # 의존성 관리
└── README.md                   # 프로젝트 문서
```

## 주요 기능

### 1. **인증 시스템**
- **구글 OAuth 로그인**: Supabase Auth를 통한 안전한 구글 로그인
- **세션 관리**: 자동 로그인 상태 유지 및 세션 확인
- **로그인 상태 확인**: 이미 로그인된 사용자는 자동으로 페르소나 페이지로 이동

### 2. **페이지 구조**
- **메인 페이지 (`/`)**: 랜딩 페이지, 서비스 소개 및 CTA
- **로그인 페이지 (`/login`)**: 구글 로그인 및 인증 처리
- **가격 페이지 (`/price`)**: 구독 플랜 및 결제 정보
- **페르소나 페이지 (`/persona`)**: AI 캐릭터 선택 및 채팅 시뮬레이션

### 3. **AI 페르소나 시스템**
- **다양한 캐릭터**: 10개의 서로 다른 성격의 AI 페르소나
- **필터링 기능**: 성별별 필터링 (전체/Female/Male)
- **캐릭터 정보**: 나이, MBTI, 직업, 성격 특성 표시
- **인터랙티브 UI**: 카드 형태의 직관적인 선택 인터페이스

### 4. **채팅 시뮬레이션**
- **실시간 대화**: 선택한 페르소나와의 자연스러운 대화
- **모바일 UI**: 실제 데이팅 앱과 유사한 인터페이스
- **애니메이션 효과**: 부드러운 전환 및 메시지 표시 애니메이션

## 🛠️ 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (JSX)
- **Styling**: CSS-in-JS (Inline Styles)
- **Authentication**: Supabase Auth (Google OAuth)
- **Font**: Inter (Google Fonts)
- **Deployment**: Vercel (권장)

## 디자인 시스템

### 색상 팔레트
```css
--bg: #f7f8fc                    /* 배경색 */
--glass: rgba(255, 255, 255, 0.6) /* 글래스 효과 */
--text: #2c3e50                  /* 텍스트 색상 */
--brand1: #fbc2eb                /* 브랜드 색상 1 */
--brand2: #a6c1ee                /* 브랜드 색상 2 */
--brand3: #e6b3ff                /* 브랜드 색상 3 */
```

### 타이포그래피
- **폰트**: Inter (Google Fonts)
- **한글 폰트**: Noto Sans KR
- **로고 크기**: 32px (메인), 36px (로그인)
- **로고 이미지**: 38px × 38px (메인), 42px × 42px (로그인)

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 추가하세요:

```env
# Supabase 설정 (Google 로그인용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Supabase 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Authentication > Settings > Auth Providers에서 Google 활성화
3. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
4. Supabase에 Google OAuth 설정 정보 입력

### 4. 개발 서버 실행
```bash
npm run dev
```

## 페이지별 기능

### 메인 페이지 (`/`)
- 서비스 소개 및 핵심 기능 설명
- 네비게이션: 가격, 로그인 페이지 연결
- CTA 버튼: 가격 페이지로 이동

### 로그인 페이지 (`/login`)
- 구글 OAuth 로그인
- 세션 상태 확인
- 로그인 성공 시 자동으로 페르소나 페이지로 이동
- 로딩 상태 및 에러 처리

### 가격 페이지 (`/price`)
- 구독 플랜 표시
- 가격 카드 및 기능 비교
- 구독 버튼: 로그인 페이지로 연결

### 페르소나 페이지 (`/persona`)
- AI 캐릭터 선택 인터페이스
- 성별별 필터링
- 캐릭터 카드 슬라이더
- 채팅 시뮬레이션
- 모바일 앱 형태의 UI

## 보안 및 인증

- **Supabase Auth**: 안전한 OAuth 2.0 인증
- **세션 관리**: 자동 로그인 상태 유지
- **환경변수**: 민감 정보 보안 관리
- **CORS 설정**: 안전한 API 통신

## 사용자 플로우

1. **랜딩**: 메인 페이지에서 서비스 소개 확인
2. **가격 확인**: 가격 페이지에서 구독 플랜 확인
3. **로그인**: 구글 계정으로 간편 로그인
4. **페르소나 선택**: 원하는 AI 캐릭터 선택
5. **채팅 시뮬레이션**: 선택한 캐릭터와 데이트 시뮬레이션

## 배포

### Vercel 배포 (권장)
1. Vercel에 프로젝트 연결
2. 환경변수 설정
3. 자동 배포 설정

### 환경변수 체크리스트
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase Google OAuth 설정 완료

## 문제 해결

### 로그인 문제
1. Supabase 환경변수 확인
2. Google OAuth 설정 확인
3. 브라우저 콘솔에서 오류 메시지 확인

### 페이지 이동 문제
1. Next.js App Router 구조 확인
2. 라우팅 설정 확인
3. 브라우저 캐시 삭제

## 지원

문제가 발생하면 다음을 확인하세요:
1. 환경변수 설정 상태
2. Supabase 프로젝트 설정
3. 브라우저 콘솔 오류 메시지
4. 네트워크 연결 상태

