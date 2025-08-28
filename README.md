# 데연소 (DYS) - AI 데이트 연습소 프론트엔드

<div align="center">
  <img src="/public/dys_logo.webp" alt="데연소 로고" width="200"/>
  
  **AI 가상 인물과 데이트·소개팅을 연습하며 소통 능력을 진단하고 매력을 발견하세요**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.54.0-green?style=flat-square&logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-blue?style=flat-square&logo=vercel)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
</div>

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [환경 설정](#환경-설정)
- [주요 기능](#주요-기능)
- [API 구조](#api-구조)
- [배포](#배포)
- [개발 가이드](#개발-가이드)
- [기여하기](#기여하기)

## 🎯 프로젝트 개요

**데연소(DYS)**는 AI 가상 인물과의 데이트 연습을 통해 사용자의 소통 능력을 진단하고 개선하는 웹 애플리케이션입니다. 

### 주요 특징
- 🤖 **AI 페르소나**: 10명의 다양한 성격의 가상 인물과 대화 연습
- 📊 **실시간 피드백**: 대화 태도, 목소리 톤, 감정 분석 제공
- 🎯 **시나리오 기반**: 실제 데이트 상황을 시뮬레이션한 연습 시나리오
- 🔐 **멤버십 시스템**: Basic/Premium 사용자 등급별 접근 권한 관리
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원

## 🛠 기술 스택

### Frontend
- **Framework**: [Next.js 14.2.5](https://nextjs.org/) (App Router)
- **UI Library**: [React 18.3.1](https://reactjs.org/)
- **Styling**: CSS3 (Custom CSS with Glassmorphism, Gradients)
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Routing**: Next.js App Router

### Backend & Database
- **Authentication**: [Supabase Auth 2.54.0](https://supabase.com/auth)
- **Database**: [Supabase PostgreSQL](https://supabase.com/database)
- **Backend API**: GKE (Google Kubernetes Engine) - Python FastAPI
- **Real-time**: Supabase Realtime

### Deployment & Infrastructure
- **Hosting**: [Vercel](https://vercel.com/)
- **Container Orchestration**: [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine)
- **Domain**: dys-phi.vercel.app
- **CDN**: Vercel Edge Network

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Code Quality**: ESLint (Next.js 기본 설정)
- **Image Optimization**: Next.js Image Optimization

## 📁 프로젝트 구조

```
dys-frontend/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 health/               # Health Check API
│   │   │   └── route.js             # GKE 서버 상태 확인
│   │   └── 📁 proxy/                # Proxy API Routes
│   │       └── 📁 health/
│   │           └── route.js         # Legacy health check
│   ├── 📁 components/               # 공통 컴포넌트
│   │   ├── BetaSurvey.jsx           # 베타 테스트 설문조사 모달
│   │   └── TokenExpiryChecker.jsx   # 토큰 만료 체커
│   ├── 📁 feedback/                 # 피드백 페이지
│   │   └── page.jsx                 # 코칭 히스토리 및 피드백
│   ├── 📁 login/                    # 로그인 페이지
│   │   └── page.jsx                 # Google OAuth 로그인
│   ├── 📁 persona/                  # 페르소나 선택 페이지
│   │   └── page.jsx                 # AI 페르소나 선택 및 대화
│   ├── 📁 price/                    # 가격 정책 페이지
│   │   └── page.jsx                 # Basic/Premium 플랜 안내
│   ├── 📁 scenario/                 # 도전 시나리오 페이지
│   │   └── page.jsx                 # 데이트 시나리오 연습
│   ├── 📁 settings/                 # 설정 페이지
│   │   └── page.jsx                 # 사용자 프로필 및 설정
│   ├── 📁 signup/                   # 회원가입 페이지
│   │   └── page.jsx                 # 사용자 등록
│   ├── globals.css                  # 전역 CSS 스타일 (3,681줄)
│   ├── layout.jsx                   # 루트 레이아웃
│   └── page.jsx                     # 메인 랜딩 페이지
├── 📁 data/                         # 정적 데이터
│   └── personas.json                # AI 페르소나 데이터 (10명)
├── 📁 design/                       # 디자인 참고 파일
│   ├── login.jsx                    # 로그인 페이지 디자인
│   ├── page.jsx                     # 메인 페이지 디자인
│   ├── persona.jsx                  # 페르소나 페이지 디자인
│   └── price.jsx                    # 가격 페이지 디자인
├── 📁 lib/                          # 라이브러리 및 유틸리티
│   └── supabase.js                  # Supabase 클라이언트 설정 (346줄)
├── 📁 public/                       # 정적 파일
│   ├── 📁 bg/                       # 배경 이미지
│   │   ├── bg_cafe.webp             # 카페 배경 (67KB)
│   │   ├── bg_city.webp             # 도시 배경 (91KB)
│   │   └── bg_park.webp             # 공원 배경 (198KB)
│   ├── 📁 img/                      # 페르소나 이미지
│   │   ├── man1.webp ~ man5.webp    # 남성 페르소나 (일반)
│   │   ├── man1_insta.webp ~ man5_insta.webp  # 남성 페르소나 (인스타)
│   │   ├── woman1.webp ~ woman5.webp          # 여성 페르소나 (일반)
│   │   └── woman1_insta.webp ~ woman5_insta.webp  # 여성 페르소나 (인스타)
│   ├── camera.webp                  # 카메라 아이콘 (70KB)
│   ├── dys_logo.png                 # 로고 (PNG, 1.5MB)
│   ├── dys_logo.webp                # 로고 (WebP, 105KB)
│   └── favicon.ico                  # 파비콘 (1.5MB)
├── .gitignore                       # Git 무시 파일
├── feedback.html                    # 레거시 피드백 페이지 (33KB)
├── next.config.js                   # Next.js 설정
├── package.json                     # 프로젝트 의존성 및 스크립트
├── package-lock.json                # 의존성 잠금 파일
├── README.md                        # 프로젝트 문서
└── vercel.json                      # Vercel 배포 설정
```

## 🚀 설치 및 실행

### 필수 요구사항
- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상
- **Git**: 최신 버전

### 1. 저장소 클론
```bash
git clone https://github.com/gigas5234/dys-frontend.git
cd dys-frontend
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local
```

필수 환경 변수:
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GKE 백엔드 설정 (선택사항)
NEXT_PUBLIC_API_URL=http://34.64.136.237
```

### 4. 개발 서버 실행
```bash
npm run dev
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

### 5. 프로덕션 빌드
```bash
npm run build
npm start
```

## ⚙️ 환경 설정

### Supabase 설정
1. [Supabase](https://supabase.com/)에서 새 프로젝트 생성
2. Authentication > Settings에서 Google OAuth 설정
3. Database에서 필요한 테이블 생성:
   - `users`: 사용자 프로필 정보
   - `beta_surveys`: 베타 테스트 설문조사 결과

### GKE 백엔드 연결
- **Health Check**: `/api/health` → `http://34.64.136.237/health`
- **Studio Proxy**: `/api/gke/dys_studio/*` → `http://34.64.136.237/dys_studio/*`
- **General API**: `/api/gke/*` → `http://34.64.136.237/*`

## 🎨 주요 기능

### 1. AI 페르소나 시스템
- **10명의 가상 인물**: 다양한 성격, 나이, 직업의 AI 페르소나
- **성별 필터링**: 남성/여성 페르소나 선택 가능
- **멤버십 제한**: Basic 사용자는 1번 페르소나만 선택 가능
- **실시간 대화**: 자연스러운 대화 인터페이스

### 2. 사용자 인증 시스템
- **Google OAuth**: 구글 계정으로 간편 로그인
- **세션 관리**: 자동 토큰 갱신 및 만료 처리
- **프로필 관리**: 사용자 정보 수정 및 멤버십 관리

### 3. 피드백 시스템
- **대화 분석**: 자세, 시선, 목소리 톤 분석
- **실시간 피드백**: 즉시 개선점 제안
- **히스토리 관리**: 과거 연습 기록 저장

### 4. 시나리오 연습
- **다양한 상황**: 첫 만남, 카페 데이트, 식사 데이트, 영화 데이트
- **배경 이미지**: 각 시나리오별 맞춤 배경
- **단계별 연습**: 상황별 맞춤 연습 가이드

### 5. 베타 테스트 설문조사
- **5개 질문**: 서비스 만족도 및 개선점 수집
- **실시간 저장**: Supabase를 통한 즉시 데이터 저장
- **모달 인터페이스**: 사용자 친화적인 설문 UI

## 🔌 API 구조

### Frontend API Routes
```
/api/health          # GKE 서버 상태 확인
/api/proxy/health    # Legacy health check (deprecated)
```

### Backend Integration
```
GKE Server (34.64.136.237)
├── /health                    # 서버 상태 확인
├── /dys_studio/              # AI 스튜디오 애플리케이션
│   └── studio_calibration.html  # 메인 스튜디오 페이지
└── /api/*                    # 기타 API 엔드포인트
```

### Supabase Integration
```javascript
// 인증
supabase.auth.signInWithOAuth()
supabase.auth.getSession()
supabase.auth.signOut()

// 데이터베이스
supabase.from('users').select()
supabase.from('beta_surveys').insert()
```

## 🚀 배포

### Vercel 배포
1. **GitHub 연동**: Vercel에서 GitHub 저장소 연결
2. **환경 변수 설정**: Vercel 대시보드에서 환경 변수 등록
3. **자동 배포**: main 브랜치 푸시 시 자동 배포

### 배포 설정 파일
- **vercel.json**: 프록시 설정 및 CORS 헤더
- **next.config.js**: Next.js 최적화 설정

### 배포 URL
- **Production**: https://dys-phi.vercel.app
- **Preview**: 각 PR마다 자동 생성

## 👨‍💻 개발 가이드

### 코드 스타일
- **React Hooks**: 함수형 컴포넌트 및 Hooks 사용
- **CSS**: 모듈화된 CSS 클래스명 사용
- **TypeScript**: 향후 TypeScript 마이그레이션 예정

### 주요 컴포넌트
```javascript
// 페르소나 카드 컴포넌트
const PersonaCard = ({ persona, isSelected, onClick, userPlan }) => {
  // 멤버십 제한 로직
  const isLocked = isBasicUser && isPremiumPersona;
  
  return (
    <div className={`persona-card ${isLocked ? 'locked' : ''}`}>
      {/* 카드 내용 */}
    </div>
  );
};
```

### 상태 관리
```javascript
// 사용자 상태
const [user, setUser] = useState(null);
const [userPlan, setUserPlan] = useState('basic');

// UI 상태
const [isLoading, setIsLoading] = useState(false);
const [showModal, setShowModal] = useState(false);
```

### 에러 처리
```javascript
try {
  const response = await fetch('/api/health');
  if (!response.ok) throw new Error('서버 연결 실패');
} catch (error) {
  console.error('에러:', error);
  setShowWarningModal(true);
}
```

## 🤝 기여하기

### 개발 환경 설정
1. 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feature/새기능`
3. 변경사항 커밋: `git commit -m "feat: 새 기능 추가"`
4. PR 생성 및 리뷰 요청

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 프로세스 또는 보조 도구 변경
```

### 이슈 리포트
- 버그 리포트: 상세한 재현 단계 포함
- 기능 요청: 명확한 사용 사례 설명
- 개선 제안: 구체적인 개선 방안 제시

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **프로젝트 관리자**: gigas5234
- **이메일**: [이메일 주소]
- **GitHub**: [https://github.com/gigas5234/dys-frontend](https://github.com/gigas5234/dys-frontend)

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Supabase](https://supabase.com/) - 백엔드 서비스
- [Vercel](https://vercel.com/) - 배포 플랫폼
- [Google Cloud](https://cloud.google.com/) - 인프라 서비스

---

<div align="center">
  <strong>데연소로 더 나은 소통을 시작하세요! ��</strong>
</div>

