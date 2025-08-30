const fs = require('fs');
const path = require('path');

// 이미지 변환을 위한 간단한 스크립트
// 실제 변환은 온라인 도구를 사용하는 것을 권장합니다

console.log('🖼️ PNG to WebP 변환 가이드');
console.log('========================');

const onboardingDir = path.join(__dirname, 'public', 'onboarding');
const pngFiles = [
  'slide1-persona-selection.png',
  'slide2-chat-to-date.png', 
  'slide3-studio-overview.png' // 파일명 수정됨
];

console.log('\n📁 현재 PNG 파일들:');
pngFiles.forEach(file => {
  const filePath = path.join(onboardingDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  ✅ ${file} (${sizeInMB}MB)`);
  } else {
    console.log(`  ❌ ${file} (파일 없음)`);
  }
});

console.log('\n🎯 변환 권장사항:');
console.log('  1. 해상도: 600x400px (16:9 비율)');
console.log('  2. 품질: 80-85%');
console.log('  3. 목표 파일 크기: 100KB 이하');
console.log('  4. 포맷: WebP');

console.log('\n🛠️ 변환 도구 추천:');
console.log('  1. Squoosh.app: https://squoosh.app/');
console.log('  2. Convertio: https://convertio.co/png-webp/');
console.log('  3. TinyPNG: https://tinypng.com/');

console.log('\n📝 변환 후 파일명:');
console.log('  slide1-persona-selection.webp');
console.log('  slide2-chat-to-date.webp');
console.log('  slide3-studio-overview.webp');

console.log('\n⚠️ 주의사항:');
console.log('  - 변환 후 public/onboarding/ 폴더에 업로드하세요');

console.log('\n🚀 변환 완료 후 알려주시면 온보딩 기능을 테스트해드리겠습니다!');
