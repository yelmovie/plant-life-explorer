# Cloudflare 배포

운영 주소: https://leafy-garden.pages.dev

GitHub: https://github.com/yelmovie/plant-life-explorer

Cloudflare Pages 프로젝트는 `leafy-garden`, 운영 브랜치는 `main`이다. 검증한 `dist/`를 직접 업로드한다. GitHub push만으로 자동 배포되지는 않는다.

```powershell
npm run check
npm test
npm run build
wrangler pages deploy dist --project-name leafy-garden --branch main
```

`dist/`는 빌드 산출물이며 Git에 포함하지 않는다. 실행용 이미지·모형·글꼴만 배포하고 참고 자료·교육과정 원본·검증 화면은 배포에서 제외한다. 원본과 캡처는 로컬 프로젝트에 보존한다.

## 최근 배포 — 2026-10-24

- 기능 커밋: `85d934d` (`main`, GitHub push 완료)
- 배포 주소: https://71b22591.leafy-garden.pages.dev
- 운영 주소: https://leafy-garden.pages.dev
- 배포 전 JavaScript 31개 문법 검사, 테스트 80/80, 133파일·96에셋 빌드를 통과했다.
- 운영 주소의 HTML·앱·3D 복구 모듈·연구노트·보정 CSS·설정·서비스워커·한글 글꼴 8파일이 배포 빌드와 바이트 단위로 일치했다.
- 음원 2곡과 영상 2개의 HTTP 200 및 MIME을 확인했다. 원격 Range 요청은 HTTP 200으로 응답하여 부분 응답(206)은 확인하지 못했다.
- 인앱 브라우저에서 첫 화면·설정·인트로 재생·자막·복귀를 직접 확인했다. 영상 시간은 11.76초까지 진행했고 영상 재생 중 BGM은 정지했다. 확인한 브라우저 warning/error 로그는 없었다.
- 실제 학생·실물 태블릿·학교망 검증 등 최종점검 보고서의 미측정 조건은 그대로 남아 있다. 배포 성공이 그 조건의 통과를 뜻하지 않는다.

## 이전에 확인한 배포

- 기능 커밋: `6cf80051212a4090b47023177a4eb6344af92f58` (`main`)
- 배포 주소: https://1fb939ba.leafy-garden.pages.dev
- 운영 주소에서 HTTP 200, 새 첫 화면 이미지, 이야기→지도→현장 입장, 관찰 조작·로컬 저장·새로고침 보존을 Chrome 독립 프로필로 확인했다. 콘솔 오류와 HTTP 오류는 없었다.
