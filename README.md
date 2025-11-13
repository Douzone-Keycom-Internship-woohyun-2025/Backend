# TechLens Backend

특허 검색 및 분석 플랫폼의 **백엔드** 저장소입니다.  
Node.js + Express + PostgreSQL 기반으로 인증, 프리셋, 특허 검색, 분석, 관심특허 기능을 제공합니다.

---

## 📋 프로젝트 개요

### 프로젝트 정보
- **프로젝트명**: TechLens (특허 검색 및 분석 플랫폼)
- **소속**: 더존 ICT Group × 강원대학교 컴퓨터공학과 심우현
- **역할**: 백엔드 API 설계/구현, DB 설계, 배포 자동화

### 저장소/브랜치
- **Backend 저장소**: https://github.com/Douzone-Keycom-Internship-woohyun-2025/Backend/tree/develop  
- **브랜치 전략**: `main`(프로덕션), `develop`(개발 통합), `feat/*`(기능)

### 접속 URL (Staging)
- **Render Backend (develop)**: https://techlens-backend-develop.onrender.com/

### API/DB 문서
- **API 명세서 (V1.1)**  
  https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs/blob/main/specs/TechLens_API%EB%AA%85%EC%84%B8%EC%84%9CV1.1.md
- **DB 정의서 (V1.1)**  
  https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs/blob/main/specs/TechLens_DB%EC%A0%95%EC%9D%98%EC%84%9CV1.1.md

---

## 🧱 아키텍처

```
TechLens 프로젝트
├── techlens-frontend (별도 레포)         ← React + TS, Vercel
└── techlens-backend  (이 저장소)          ← Node + Express, Render
    ├── PostgreSQL 14+ (Render)
    └── KIPRIS Open API 연동 예정
```

**API Base URL**  
(로컬) `http://localhost:4000`  
(Render) `https://techlens-backend-develop.onrender.com`

---

## 🛠 기술 스택

| 항목 | 기술 |
|---|---|
| 런타임 | Node.js 20+ |
| 웹 프레임워크 | Express |
| DB | PostgreSQL 14+ |
| 인증 | JWT (Bearer), RefreshToken |
| 검증 | Zod |
| 배포 | Render |
| 로깅 | console (필요 시 winston 확장) |

---

## 📁 프로젝트 구조

```
. (Project Root)
├── src/
│   ├── app.ts                 # Express 앱 설정 (CORS/JSON/헬스체크)
│   ├── server.ts              # 서버 실행 (포트 바인딩)
│   ├── config/
│   │   ├── db.ts              # PostgreSQL pool 설정
│   │   └── env.ts             # 환경 변수 (Zod)
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── presetController.ts
│   │   └── summaryController.ts
│   ├── errors/
│   │   └── notFoundError.ts   # 커스텀 404 에러
│   ├── middlewares/
│   │   ├── requireAuth.ts     # JWT 인증 미들웨어
│   │   └── validate.ts        # Zod 기반 요청 바디 검증
│   ├── models/
│   │   └── .gitkeep
│   ├── repositories/
│   │   ├── authRepository.ts
│   │   ├── presetRepository.ts
│   │   └── refreshTokenRepository.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── presetRoutes.ts
│   │   └── summaryRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── presetService.ts
│   │   └── summaryService.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── preset.ts
│   └── validators/
│       └── presetSchemas.ts   # Zod 스키마 (create/update)
└── tests/
    └── .gitkeep
```

---

## 🔐 인증

- **방식**: AccessToken + RefreshToken 기반 JWT 인증
- **발급**
  - `POST /users/signup` 성공 시: `accessToken`, `refreshToken` 동시 발급
  - `POST /users/login` 성공 시: `accessToken`, `refreshToken` 동시 발급
- **사용 (인증이 필요한 모든 API)**
  - 요청 헤더에 **AccessToken**을 Bearer 방식으로 포함
  - 예시:
    ```http
    Authorization: Bearer <ACCESS_TOKEN>
    ```
- **토큰 재발급**
  - `POST /users/refresh`
  - 요청 바디에 **RefreshToken** 전달  
    ```json
    { "refreshToken": "<REFRESH_TOKEN>" }
    ```
  - 응답으로 **새로운 AccessToken** 발급

- **로그아웃**
  - `POST /users/logout`
  - 요청 바디에 **RefreshToken** 전달  
    ```json
    { "refreshToken": "<REFRESH_TOKEN>" }
    ```
  - 서버 DB에서 해당 RefreshToken을 삭제  
  - 이후에는 **AccessToken 재발급 불가능**, 기존 AccessToken은 만료 시점까지만 유효

---

## 🔗 주요 엔드포인트 요약

> 상세한 파라미터/응답 예시는 **API 명세서(V1.1)** 문서를 참고하세요.

### Users (인증)
- `POST /users/signup` – 회원가입
- `POST /users/login` – 로그인(JWT 발급)
- `POST /users/logout` – 로그아웃

### Presets (프리셋)
- `POST /presets` – 프리셋 생성 (JWT 필요)
- `GET /presets` – 프리셋 목록 (skip/limit, 요약 응답. description 제외)
- `GET /presets/:presetId` – 프리셋 단건 조회 (상세, description 포함)
- `PATCH /presets/:presetId` – 프리셋 수정 (부분 업데이트)
- `DELETE /presets/:presetId` – 프리셋 삭제 (204 No Content)

### Patents / Analysis / Favorites
- API 명세서에 설계 기재. 구현 순차 진행.

### Health Check
- `GET /health` – DB 연결 확인
  ```json
  { "status": "성공", "db": "연결" }
  ```

---

## ⚙️ 로컬 실행 ( 현재 진행 불가능 )

### 1) 환경 변수
프로젝트 루트에 `.env` 생성:
```
PORT=4000
DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<db>
JWT_SECRET=<랜덤-32바이트-이상>
```

### 2) 설치 & 실행
```bash
npm cl
npm run dev   # ts-node-dev 등 개발 서버
# 또는
npm run build && npm start
```

### 3) CORS
- 현재 `app.ts`에서 `cors()` 허용. 필요 시 `origin` 화이트리스트 세팅 권장.

---

## 🧰 개발 가이드

### 데이터베이스
- **PostgreSQL 14+**
- 주요 테이블: `users`, `presets`, `favorite_patents`, `ipc_subclass_map`, `patent_ipc_subclass_map`
- FK: `users → presets`, `favorite_patents → patent_ipc_subclass_map → ipc_subclass_map`
- 날짜: `TIMESTAMP DEFAULT NOW()` (ISO 8601)

### 요청 검증
- **Zod**로 요청 바디 스키마 검증
  - `validators/presetSchemas.ts`
  - `middlewares/validate.ts` 미들웨어로 라우터에서 적용

### 에러 처리
- 커스텀 에러: `NotFoundError` (404)
- 컨트롤러에서 `instanceof NotFoundError`로 분기
- 기본 에러는 500 `{ status:"error", message }`

### 페이징
- `skip`/`limit`(최대 100) 가드
- `COUNT(*) OVER()` 으로 total 동시 조회 (빈 페이지일 때만 count 보정)

---

## 🚀 배포

- **플랫폼**: Render
- **브랜치**: `develop` → Staging 자동 배포
- **헬스체크**: `GET /health`
- **환경 변수**: Render 환경 탭에 `.env`와 동일 키 등록

---

## 🤝 컨벤션

### 커밋
```
feat:     새로운 기능
fix:      버그 수정
docs:     문서 변경
refactor: 리팩토링
perf:     성능 개선
test:     테스트 추가/수정
```

### 브랜치
```
main            → 프로덕션
└─ develop      → 개발 통합
   ├─ feat/presets
   ├─ feat/auth
   ├─ feat/favorites
   └─ feat/analysis
```

---

## ✅ 구현 현황

구현 현황 체크리스트
전체 엔드포인트: 17개

구현 완료: 10개
미구현: 7개

완성도: 58.8%

| 엔드포인트 | 상태 || 엔드포인트 | 상태 |
|---|---|
| Users: POST /users/signup | ✅ 완료 |
| Users: POST /users/login | ✅ 완료 |
| Users: POST /users/logout | ✅ 완료 |
| Users: POST /users/refresh | ✅ 완료 |
| Presets: POST /presets | ✅ 완료 |
| Presets: GET /presets | ✅ 완료 |
| Presets: GET /presets/:presetId | ✅ 완료 |
| Presets: PATCH /presets/:presetId | ✅ 완료 |
| Presets: DELETE /presets/:presetId | ✅ 완료 |
| Summary: GET /summary | ✅ 완료 |
| Patents: POST /patents/search/basic | ⏳ 미구현 |
| Patents: POST /patents/search/advanced | ⏳ 미구현 |
| Patents: GET /patents/:applicationNumber | ⏳ 미구현 |
| Favorites: GET /favorites/list | ⏳ 미구현 |
| Favorites: POST /favorites | ⏳ 미구현 |
| Favorites: GET /favorites/:applicationNumber | ⏳ 미구현 |
| Favorites: DELETE /favorites/:applicationNumber | ⏳ 미구현 |

---

## 📌 비고
- 프론트엔드 저장소와 API 스펙/DB 정의는 상단 링크 참고.
- 보안상 `JWT_SECRET`은 최소 32바이트 랜덤 문자열을 권장합니다.
- 프리셋 목록 응답은 요약(설명 제외), 단건 응답은 상세(설명 포함)로 설계했습니다.

---

**마지막 업데이트**: 2025-11-13 (KST)  
문의: 심우현 (KNU / Kicom Internship)
