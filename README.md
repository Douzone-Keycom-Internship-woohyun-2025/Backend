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
| 인증 | JWT (Bearer), Blacklist(로그아웃) |
| 검증 | Zod |
| 배포 | Render |
| 로깅 | console (필요 시 winston 확장) |

---

## 📁 프로젝트 구조

```
src/
├── app.ts                      # Express 앱 설정 (CORS/JSON/헬스체크)
├── config/
│   └── db.ts                   # PostgreSQL pool 설정
├── controllers/
│   └── presetController.ts     # 프리셋 CRUD 컨트롤러
├── errors/
│   └── NotFoundError.ts        # 커스텀 404 에러
├── middlewares/
│   ├── requireAuth.ts          # JWT 인증 미들웨어
│   └── validate.ts             # Zod 기반 요청 바디 검증
├── repositories/
│   ├── jwtBlacklistRepository.ts
│   └── presetRepository.ts     # DB 접근 (쿼리)
├── routes/
│   ├── authRoutes.ts           # /users (signup/login/logout)
│   └── presetRoutes.ts         # /presets
├── services/
│   └── presetService.ts        # 비즈니스 로직
├── types/
│   └── request.ts              # AuthRequest 등 타입
└── validators/
    └── presetSchemas.ts        # Zod 스키마 (create/update)
```

---

## 🔐 인증

- **방식**: JWT Bearer Token
- **발급**: `POST /users/login` 성공 시 `token` 발급
- **제거(로그아웃)**: 블랙리스트 테이블에 token 등록 → `requireAuth`에서 차단
- **헤더 예시**
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## 🔗 주요 엔드포인트 요약

> 상세한 파라미터/응답 예시는 **API 명세서(V1.1)** 문서를 참고하세요.

### Users (인증)
- `POST /users/signup` – 회원가입
- `POST /users/login` – 로그인(JWT 발급)
- `POST /users/logout` – 로그아웃(JWT 블랙리스트)

### Presets (프리셋)
- `POST /presets` – 프리셋 생성 (JWT 필요)
- `GET /presets` – 프리셋 목록 (skip/limit, 요약 응답. description 제외)
- `GET /presets/:presetId` – 프리셋 단건 조회 (상세, description 포함)
- `PUT /presets/:presetId` – 프리셋 수정 (부분 업데이트)
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
CORS_ORIGIN=*
```

### 2) 설치 & 실행
```bash
npm install
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

| 영역 | 상태 |
|---|---|
| 인증 (signup/login/logout) | ✅ |
| 프리셋 CRUD | ✅ |
| 관심특허 CRUD | 🔄 |
| 특허 검색(KIPRIS 연동) | 🔄 |
| 분석 요약 | 🔄 |
| 배포 자동화 | ✅ |

---

## 📌 비고
- 프론트엔드 저장소와 API 스펙/DB 정의는 상단 링크 참고.
- 보안상 `JWT_SECRET`은 최소 32바이트 랜덤 문자열을 권장합니다.
- 프리셋 목록 응답은 요약(설명 제외), 단건 응답은 상세(설명 포함)로 설계했습니다.

---

**마지막 업데이트**: 2025-11-13 (KST)  
문의: 심우현 (KNU / Kicom Internship)
