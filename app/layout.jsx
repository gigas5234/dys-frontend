export const metadata = {
    title: "데연소 - Minimal",
    description: "Start → Runpod webcam feedback"
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="ko">
        <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Apple SD Gothic Neo, Malgun Gothic" }}>
          {children}
        </body>
      </html>
    );
  }
  