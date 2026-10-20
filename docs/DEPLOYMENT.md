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
