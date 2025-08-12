# 데연소 Live - RunPod 기반 웹캠 피드백 시스템

Next.js 14 기반의 RunPod 임베딩 프론트엔드 애플리케이션입니다.

## 🚀 빠른 시작

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 추가하세요:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-runpod-proxy-url.com
```

### Vercel 배포

1. Vercel에 프로젝트를 연결
2. 환경변수 설정:
   - `NEXT_PUBLIC_BACKEND_URL`: RunPod 프록시 URL

## 📁 프로젝트 구조

```
dys_frontend/
├── app/
│   ├── layout.jsx          # 루트 레이아웃
│   ├── page.jsx            # 메인 페이지
│   └── live/
│       └── page.jsx        # RunPod 임베드 페이지
├── next.config.js          # Next.js 설정
├── package.json            # 의존성 관리
└── README.md              # 프로젝트 문서
```

## 🔧 주요 기능

- **현대적인 UI/UX**: 그라디언트 배경과 애니메이션 효과
- **에러 처리**: 환경변수 누락 및 연결 오류 처리
- **로딩 상태**: 사용자 친화적인 로딩 인디케이터
- **보안**: iframe sandbox 및 보안 헤더 설정
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험

## 🛠️ 기술 스택

- **Framework**: Next.js 14
- **Language**: JavaScript (JSX)
- **Styling**: Inline Styles + CSS-in-JS
- **Deployment**: Vercel (권장)

## 🔒 보안 고려사항

- iframe sandbox 속성으로 보안 강화
- CORS 및 보안 헤더 설정
- 환경변수를 통한 민감 정보 관리

## 📝 배포 체크리스트

- [ ] `NEXT_PUBLIC_BACKEND_URL` 환경변수 설정
- [ ] RunPod 프록시 URL 유효성 확인
- [ ] 카메라/마이크 권한 테스트
- [ ] 모바일 디바이스 호환성 확인

## 🐛 문제 해결

### iframe이 로드되지 않는 경우
1. `NEXT_PUBLIC_BACKEND_URL` 환경변수 확인
2. RunPod 서비스 상태 확인
3. 브라우저 콘솔에서 CORS 오류 확인

### 카메라/마이크 권한 문제
1. 브라우저 설정에서 권한 확인
2. HTTPS 환경에서 실행 중인지 확인
3. 브라우저 캐시 및 쿠키 삭제

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 환경변수 설정
2. RunPod 서비스 상태
3. 브라우저 콘솔 오류 메시지
