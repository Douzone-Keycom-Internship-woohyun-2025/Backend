<p align="center">
<img width="200" height="200" alt="TechLens로고" src="https://github.com/user-attachments/assets/3e8b41ac-733c-499a-b49b-bf32eee18ad8" />
</p>

# TechLens Backend

TechLens Backend는 특허 검색·분석 플랫폼 **TechLens**의 서버 애플리케이션입니다.  
Node.js + Express + PostgreSQL 기반으로 **인증, 특허 검색(KIPRIS 연동), 분석 요약, 프리셋 관리, 관심특허 관리** 기능을 제공합니다.

---

# 1. Project Overview

## 1.1 시스템 구성도

```
TechLens Platform
├── techlens-frontend    (React + TS, Vercel)
└── techlens-backend     (Node + Express, Render)
    ├── PostgreSQL (Render Managed DB)
    ├── KIPRIS Open API (xml2js)
    ├── JWT Authentication (Access + Refresh)
    └── REST API Server
```

## 1.2 프로젝트 역할 (Project Roles)

| 이름 | 소속 / 직책 | 역할 |
|------|-------------|-------|
| **심우현** | 강원대학교 / 인턴 | 백엔드 전체 설계·구현, DB 스키마 모델링, API 설계, KIPRIS 연동, 배포 |
| **박효민** | 더존 Keycom 선임연구원 | 기술 멘토링, 아키텍처 검토, 전체 개발 방향성 지도 |
| **양태인** | 더존 Keycom 주임연구원 | 개발 방향성 조언 |

---

# 2. Features

TechLens Backend는 다음의 주요 기능을 지원합니다.

### ✔ 인증(Auth)
- AccessToken + RefreshToken 기반 JWT 인증
- 로그인 / 회원가입 / 로그아웃 / 토큰 재발급
- Refresh Token DB 저장 방식으로 안전성 강화

### ✔ 특허 검색(Patent Search)
- KIPRIS Open API 연동
- Basic / Advanced 검색 지원
- XML → JSON 가공(xml2js)
- IPC 코드 자동 파싱 및 정규화

### ✔ 분석 요약(Summary Analysis)
- 회사명 + 기간 조건 기반 전체 특허 분석
- IPC 분포, 월별 출원 추이, 상태 비율, 최근 특허 등 통계 생성

### ✔ 프리셋(Preset)
- 자주 사용하는 조회 조건 관리
- 생성 / 수정 / 삭제 / 상세 조회
- Summary/Patent Search와 연동

### ✔ 관심특허(Favorites)
- applicationNumber 기반 저장/조회/삭제
- 중복 방지 로직
- Patent Detail과 연동

---

# 3. Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20+ |
| Framework | Express |
| Database | PostgreSQL 14+ |
| Authentication | JWT + Refresh Token |
| Validation | Zod |
| External API | KIPRIS Open API, xml2js |
| Deployment | Render |
| Logging | console |

---

# 4. Directory Structure  

```
src/
├── config/
│   ├── db.ts
│   └── env.ts
│
├── controllers/
│   ├── constants/
│   │   └── pagination.ts
│   ├── authController.ts
│   ├── favoriteController.ts
│   ├── patentController.ts
│   ├── presetController.ts
│   └── summaryController.ts
│
├── errors/
│   ├── badRequestError.ts
│   ├── notFoundError.ts
│   └── unauthorizedError.ts
│
├── middlewares/
│   ├── errorHandler.ts
│   ├── requireAuth.ts
│   └── validate.ts
│
├── models/
│   └── .gitkeep
│
├── repositories/
│   ├── authRepository.ts
│   ├── favoriteRepository.ts
│   ├── ipcSubclassDictionary.ts
│   ├── patentIpcSubclassRepository.ts
│   ├── presetRepository.ts
│   └── refreshTokenRepository.ts
│
├── routes/
│   ├── authRoutes.ts
│   ├── favoriteRoutes.ts
│   ├── patentRoutes.ts
│   ├── presetRoutes.ts
│   └── summaryRoutes.ts
│
├── services/
│   ├── authService.ts
│   ├── favoriteService.ts
│   ├── patentService.ts
│   ├── presetService.ts
│   └── summaryService.ts
│
├── types/
│   ├── auth.ts
│   ├── favorite.ts
│   ├── kipris.ts
│   └── preset.ts
│
├── utils/
│   └── ipc.ts
│
├── validators/
│   ├── favoriteSchemas.ts
│   └── presetSchemas.ts
│
├── app.ts
└── server.ts
```

---

# 5. API Reference

### Users (Auth)
- POST /users/signup  
- POST /users/login  
- POST /users/logout  
- POST /users/refresh  

### Patents
- POST /patents/search/basic  
- POST /patents/search/advanced  
- GET /patents/:applicationNumber  

### Summary
- GET /summary  

### Presets
- POST /presets  
- GET /presets  
- GET /presets/:presetId  
- PATCH /presets/:presetId  
- DELETE /presets/:presetId  

### Favorites
- GET /favorites  
- POST /favorites  
- DELETE /favorites/:applicationNumber  

API 명세서:  
https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs/blob/main/specs/TechLens_API_specificationsV1.1.md

---

# 6. Development Guide

## Commit Convention
```
feat: 기능 추가
fix: 버그 수정
docs: 문서 변경
refactor: 리팩토링
perf: 성능 최적화
test: 테스트 코드
```

## Branch Strategy
```
main           → 배포
└── develop    → 개발 통합
      ├── feat/auth
      ├── feat/presets
      ├── feat/patents
      ├── feat/favorites
      └── feat/analysis
```

---

# 7. Environment Variables

### `.env`
```
DATABASE_URL=
PORT=4000
JWT_SECRET=
KIPRIS_API_KEY=
KIPRIS_BASE_URL=
FRONTEND_URL_DEV=
FRONTEND_URL_PROD=
FRONTEND_URL_VERCEL=
FRONTEND_URL_STAGING=

(해당 내용들이 필요합니다)

```

---

# 8. Local Setup

```
npm ci
npm run dev
```

서버 실행 URL: http://localhost:4000  
헬스 체크: `GET /health`

---

# 9. Deployment (Render)

- develop 브랜치 → 자동 배포
- Render PostgreSQL 사용
- 헬스 체크 엔드포인트 지원

---

# 10. 저작권(Copyright)

본 프로젝트의 모든 산출물(코드, 로직, 설계, 문서 등)은  
**심우현 개인에게 귀속됩니다.**

단, 인턴십 협업 특성상  
**KICOM(더존 Keycom)은 내부 운영 목적에 한하여 사용 권한을 가집니다.**

> 무단 복제, 배포, 상업적 이용을 금합니다.
