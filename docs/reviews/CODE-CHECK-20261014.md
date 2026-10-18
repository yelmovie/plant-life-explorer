# 코드·기능 점검 — 2026-10-14

> 아래는 코드 분담 점검 당시의 기록이다. 보고서 저장 UI 연결·브라우저 검증과 빌드 스크립트는 이후 통합 완료했다. 최종 상태는 [통합 점검](FINAL-CHECK-20261014.md)을 참고한다.

범위: `src/model.js`, `src/audio.js`, `server.mjs`, `tests/model.test.mjs`. final-check 코드 lane의 제한된 결과이며 전체 배포 판정은 통합 점검에서 결정한다.

## 확인 및 수정

| 항목 | 결과·증거등급 | 근거 |
|---|---|---|
| 저장 데이터 기본값·이전 저장 호환·손상 입력 필터 | PASS · 확인됨 | `npm test`, model.test.mjs의 저장 왕복·손상 복원 테스트 |
| 보고서 증거 연결 영속화 | 모델 PASS · 확인됨 / UI 통합 확인 필요 | model.js:34,92에 reportSubmitted 기본값·중복 제거·완료 미션 검증 추가. 이전 저장은 빈 배열 사용 |
| 최종 정원·발명 확인의 저장 정합성 | PASS · 확인됨 | model.js:94~100. 복원된 산출물이 무효면 해당 확인과 finished 해제, ending→final 이동 테스트 |
| 새 미션 잠금·관찰 선행·계절 증거·정원 위치·시험 비교 | PASS · 확인됨 | 기존 의미 있는 상태 테스트 10개 유지 및 통과 |
| 코드 문법 | PASS · 확인됨 | `npm run check`: app/model/art/audio/server 모두 성공 |
| HTTP 경로 처리 | PASS · 확인됨 | 임시 포트 4322 실제 서버: `/` 200, `/src/model.js` 200, 없는 파일 404, `/.env` 403, 인코딩된 상위경로 403, NUL 경로 404. 검사 후 서버 종료 |
| 신규 이미지 MIME | 수정 · 추정 | server.mjs:7. JPEG/WebP/AVIF, WOFF2, GLB MIME 추가. 신규 파일별 브라우저 검사는 통합 단계 필요 |
| 오디오 | 정적 확인 · 추정 | audio.js는 사용자 클릭 후만 AudioContext 생성, 음소거 시 suspend, 80ms 음 종료 시 노드 disconnect, 실패 catch. 실제 기기 소리·고속 연속 입력은 미측정 |
| Git 추적 | WARNING · 확인됨 | 현재 폴더는 Git 저장소가 아님. 기존 파일 삭제·되돌림·커밋·배포 없음 |

## 실행 결과

- `npm test`: 12개 통과, 실패 0개. 추가 2개는 보고서 재진입/손상 번호 필터와 최종 산출물 변경 후 복원 회귀 검사.
- `npm run check`: 성공.
- 의존성 설치·버전 변경 없음. build/lint/typecheck 독립 스크립트는 package.json에 없음.

## 코디네이터에게 전달한 UI 연결 사항

1. app.js의 `ui.reportSubmitted`를 `state.reportSubmitted`로 바꾸고 증거 연결 때 `save()` 호출. 보고서 새로고침 복원 브라우저 확인 필요.
2. 엔딩 뒤 정원/가방을 변경하면 `finished`가 그 즉시 false가 되도록 저장 지점에서 `canFinish(state)` 확인. 기존 지도 100% 표시와 새로고침 뒤 표시가 달랐음.
3. 가방 설계 변경 뒤 시험 화면이 이전 시험 결과를 새 가방 그림에 붙이는 문제: 현재 designKey와 최신 시험 key가 일치할 때만 현재 결과 표시. 이전 결과는 기록으로 유지.

이 파일 작성 시점에는 위 UI 변경은 코드 lane 소유권 밖이므로 적용하지 않았음. 브라우저 핵심 흐름, 실제 배포 URL, 태블릿 동작, 전체 교육 내용 검증은 이 보고서에서 PASS로 주장하지 않음.
