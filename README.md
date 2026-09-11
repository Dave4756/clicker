# 모근 채굴단
클릭 이미지 2종, 랜덤 팝업 문구, 로컬 점수, PostgreSQL TOP 20 랭킹이 포함된 클릭커 게임입니다.

## 이미지 교체
`public/assets/idle.svg`와 `public/assets/click.svg`를 같은 이름의 PNG/WebP/SVG로 교체하세요. 확장자를 바꾸면 `public/game.js`의 `IDLE_IMAGE`, `CLICK_IMAGE`도 수정하세요.

## 문구 추가
`public/game.js` 상단의 `POPUP_TEXTS` 배열에 문자열을 추가하세요.

## 로컬 실행
```bash
npm install
npm start
```
`DATABASE_URL`이 없으면 랭킹은 메모리에서 작동하며 서버 재시작 시 초기화됩니다.

## GitHub
```bash
git init
git add .
git commit -m "Initial clicker game"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Render
1. 이 저장소를 GitHub에 push합니다.
2. Render Dashboard에서 **New > Blueprint**를 선택합니다.
3. 저장소를 연결합니다.
4. 루트의 `render.yaml`이 웹 서비스와 PostgreSQL을 생성합니다.

## 주의
현재 점수 검증은 형식, 범위, 요청 빈도만 검사합니다. 경쟁형 서비스라면 클릭 세션을 서버에서 발급하고 증가량을 서버에서 계산하도록 강화하세요.
