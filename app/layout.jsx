export const metadata = {
    title: "데연소 - Minimal",
    description: "Start → Runpod webcam feedback"
  };
  
  export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Apple SD Gothic Neo, Malgun Gothic" }}>
        {children}
      </body>
    </html>
  );
}
  