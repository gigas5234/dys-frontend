import './globals.css';
import TokenExpiryChecker from './components/TokenExpiryChecker';

export const metadata = {
    title: "데연소 — 데이트 연습소, AI 피드백 대시보드",
    description: "AI 가상 인물과 데이트·소개팅을 연습하며 소통 능력을 진단하고 매력을 발견하세요. 안전한 공간에서 자신감을 키워보세요."
  };
  
  export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <title>데연소 — 데이트 연습소, AI 피드백 대시보드</title>
        <meta name="description" content="AI 가상 인물과 데이트·소개팅을 연습하며 소통 능력을 진단하고 매력을 발견하세요. 안전한 공간에서 자신감을 키워보세요." />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="데연소 — AI 피드백 대시보드" />
        <meta property="og:description" content="AI 데이트·소개팅 연습을 통해 소통 능력을 진단하고 매력을 발견하세요." />
        <meta property="og:url" content="https://dys-phi.vercel.app/" />
        <meta property="og:image" content="https://dys-phi.vercel.app/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="데연소 — AI 피드백 대시보드" />
        <meta name="twitter:description" content="가상의 AI 인물과 데이트 연습, 즉시 피드백으로 자신감을 키우세요." />
        <meta name="twitter:image" content="https://dys-phi.vercel.app/og-image.png" />

        <link rel="icon" href="/dys_logo.png" />
        <link rel="shortcut icon" href="/dys_logo.png" />
        <link rel="apple-touch-icon" href="/dys_logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <TokenExpiryChecker />
        {children}
      </body>
    </html>
  );
}
  