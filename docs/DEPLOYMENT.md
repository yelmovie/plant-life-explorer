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

## 확인한 배포

- 기능 커밋: `6cf80051212a4090b47023177a4eb6344af92f58` (`main`)
- 배포 주소: https://1fb939ba.leafy-garden.pages.dev
- 운영 주소에서 HTTP 200, 새 첫 화면 이미지, 이야기→지도→현장 입장, 관찰 조작·로컬 저장·새로고침 보존을 Chrome 독립 프로필로 확인했다. 콘솔 오류와 HTTP 오류는 없었다.
