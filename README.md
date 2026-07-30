# TechLens Backend

- 수정일자: 2026-07-30
- 작성자: 심우현
- 프로젝트: 기업 특허 인텔리전스 플랫폼 TechLens의 백엔드
- 실행 환경: Node.js 20.19.0 · Express · PostgreSQL
- 프론트엔드: [Frontend](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Frontend)
- 전체 기술 문서: [Docs](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs)

> TechLens Backend는 특허 검색, 기술 분석, 사용자 인증, 관심 특허와 검색 프리셋을 안정적인 API 흐름으로 제공하는 서버 애플리케이션입니다.

## 목차

- [1. 프로젝트 개요](#1-프로젝트-개요)
- [2. 현황](#2-현황)
- [3. 문제 정의](#3-문제-정의)
- [4. 해결방안](#4-해결방안)
- [5. 기대효과](#5-기대효과)
- [6. 주요 요청 흐름](#6-주요-요청-흐름)
- [7. 백엔드 책임](#7-백엔드-책임)
- [8. 기술 스택](#8-기술-스택)
- [9. 계층 구조](#9-계층-구조)
- [10. API 요약](#10-api-요약)
- [11. 환경과 실행](#11-환경과-실행)
- [12. 검증 방법](#12-검증-방법)
- [13. 상세 기술 문서](#13-상세-기술-문서)
- [14. 유지보수 원칙](#14-유지보수-원칙)

## 1. 프로젝트 개요

- TechLens는 KIPRIS Open API의 특허 데이터를 활용해 기업의 기술 동향을 분석하는 서비스입니다.
- 백엔드는 다음 기능을 제공합니다.
  - 회원가입, 로그인, 로그아웃, Access Token 재발급
  - 출원인·기간·특허명·상태 기반 기본·고급 특허 검색
  - 특허 상세 조회와 IPC 정보 정규화
  - IPC 분포, 월별 출원 추이, 등록 상태 분석
  - 기업 비교 분석
  - 관심 특허 저장·조회·삭제·메모 수정
  - 검색 프리셋 저장·조회·수정·삭제

## 2. 현황

- 특허 원천 데이터는 XML 기반 외부 API에서 제공됩니다.
- 기업 분석을 위해 원천 데이터를 화면에 그대로 전달하지 않고 검색 결과와 통계 형태로 가공합니다.
- 인증이 필요한 API와 공개 상태 확인 API를 분리합니다.
- 프론트엔드는 REST API를 통해 검색, 분석, 사용자별 저장 기능을 사용합니다.

## 3. 문제 정의

- 외부 API의 데이터 형식과 호출 제한을 내부 화면이 직접 처리하면 서비스 결합도가 높아집니다.
- XML 응답을 그대로 사용하면 특허 필드와 IPC 분류를 화면마다 다르게 해석할 수 있습니다.
- 사용자별 관심 특허와 프리셋은 인증 정보와 함께 접근 범위를 보장해야 합니다.
- Access Token 만료, 잘못된 입력, 외부 API 실패, 데이터 없음이 서로 다른 오류로 전달되어야 합니다.
- 검색과 분석 API가 동시에 외부 API를 호출하면 호출량과 응답 시간이 커질 수 있습니다.

## 4. 해결방안

- Controller, Service, Repository, Middleware를 분리해 요청 처리와 업무 규칙, 데이터 접근 책임을 나눕니다.
- KIPRIS 연동은 Service에서 담당하고 XML을 내부 타입과 응답 구조로 변환합니다.
- Zod schema로 인증, 검색, 즐겨찾기, 프리셋 요청을 라우터 진입점에서 검증합니다.
- JWT Access Token과 DB에 저장하는 Refresh Token을 함께 사용합니다.
  - 일반 요청은 Access Token으로 인증합니다.
  - 재발급 시 Refresh Token의 존재와 만료를 확인합니다.
  - 재발급한 Refresh Token은 기존 토큰을 교체하는 방식으로 관리합니다.
- 인증·일반 API·KIPRIS API에 rate limit을 적용해 요청 폭주와 외부 호출 과다를 줄입니다.
- 공통 Error Handler와 도메인 오류 클래스를 사용해 클라이언트가 이해할 수 있는 오류 응답을 제공합니다.
- 통계 분석은 필요한 기간과 기업 조건을 기준으로 데이터를 수집하고 IPC·월별·상태별 결과를 서버에서 계산합니다.

## 5. 기대효과

- 프론트엔드는 외부 KIPRIS XML 구조가 아니라 일관된 JSON API 계약을 사용합니다.
- 인증과 사용자 데이터 접근을 공통 미들웨어로 통제해 기능별 중복을 줄입니다.
- 특허 검색과 분석 로직을 서비스 계층에서 관리해 화면과 저장 구조의 변경 영향을 줄입니다.
- 입력 검증, 오류 처리, 요청 제한을 서버 경계에서 수행해 운영 시 예측 가능성을 높입니다.
- API·DB·요구사항 문서를 별도 문서 저장소에서 관리해 이해관계자와 개발자가 같은 기준을 확인할 수 있습니다.

## 6. 주요 요청 흐름

### 6-1. 인증 흐름

- 요청이 Auth Router로 들어옵니다.
- Zod schema가 이메일, 비밀번호, Refresh Token을 검증합니다.
- Auth Service가 비밀번호 해시, JWT 발급, Refresh Token 저장을 처리합니다.
- Refresh Token Repository가 토큰의 저장·조회·삭제를 담당합니다.
- 응답에는 사용자 정보와 필요한 토큰만 포함합니다.

### 6-2. 특허 검색 흐름

- 프론트엔드가 기본 또는 고급 검색 조건을 전달합니다.
- 인증·rate limit·Zod 검증 middleware를 통과합니다.
- Patent Service가 KIPRIS API를 호출하고 XML을 파싱합니다.
- IPC 값을 정규화하고 내부 데이터 구조로 변환합니다.
- 검색 결과와 페이지 정보를 JSON으로 반환합니다.

### 6-3. 분석·비교 흐름

- Summary Controller가 기업·기간 조건을 받습니다.
- Summary Service가 KIPRIS 데이터를 페이지 단위로 수집합니다.
- IPC 분포, 월별 추이, 등록 상태와 주요 특허를 계산합니다.
- 비교 요청은 여러 기업의 분석 결과를 분리해 반환합니다.

### 6-4. 사용자 저장 데이터 흐름

- 인증된 사용자의 ID를 middleware에서 요청에 연결합니다.
- Favorite·Preset Service가 사용자 ID 기준으로 업무 규칙을 처리합니다.
- Repository가 사용자 소유 데이터만 조회·수정·삭제합니다.
- 생성·수정·삭제 결과를 프론트엔드가 cache 갱신에 사용할 수 있는 응답으로 반환합니다.

## 7. 백엔드 책임

| 계층 | 책임 |
| :--- | :--- |
| Route | HTTP method, URL, middleware 조합 |
| Middleware | 인증, 입력 검증, rate limit, 공통 오류 처리 |
| Controller | 요청값 추출, Service 호출, HTTP 응답 반환 |
| Service | 인증, 특허 검색, 분석, 사용자 기능의 업무 흐름 |
| Repository | PostgreSQL 조회·저장·수정·삭제 |
| Type·Validator | 내부 타입과 외부 입력 계약 정의 |
| Config | 환경변수와 데이터베이스 연결 설정 |

## 8. 기술 스택

| 영역 | 기술 | 사용 목적 |
| :--- | :--- | :--- |
| Runtime | Node.js 20.19.0 | 서버 실행 환경 |
| Framework | Express | REST API와 middleware 구성 |
| Language | TypeScript | API·서비스·데이터 타입 관리 |
| Database | PostgreSQL | 사용자, 토큰, 특허, IPC, 프리셋, 관심 특허 저장 |
| External API | KIPRIS Open API | 특허 원천 데이터 조회 |
| Parsing | `xml2js` | KIPRIS XML 응답 변환 |
| Validation | Zod | 요청 입력 검증 |
| Security | `bcryptjs`, `jsonwebtoken`, `helmet`, `cors` | 비밀번호, 인증, HTTP 보안 설정 |
| Traffic Control | `express-rate-limit` | 인증·일반·KIPRIS 요청 제한 |
| Deployment | Render | API와 PostgreSQL 운영 환경 |

## 9. 계층 구조

```text
src/
├── config/              # 환경변수와 PostgreSQL 연결
├── controllers/         # HTTP 요청·응답 처리
├── errors/              # 도메인 오류 타입
├── middlewares/         # 인증·검증·제한·공통 오류
├── repositories/        # PostgreSQL 접근
├── routes/              # 기능별 API 라우팅
├── services/            # 핵심 업무 규칙과 외부 API 조합
├── types/               # 도메인 타입
├── utils/               # IPC 등 공통 변환
├── validators/          # Zod 요청 schema
├── app.ts               # Express 앱과 route 등록
└── server.ts            # 서버 기동과 graceful shutdown
```

## 10. API 요약

| 영역 | 주요 Endpoint |
| :--- | :--- |
| 인증 | `POST /users/signup`, `/users/login`, `/users/refresh`, `/users/logout` |
| 특허 | `POST /patents/search/basic`, `POST /patents/search/advanced`, `GET /patents/:applicationNumber` |
| 분석 | `GET /summary`, `GET /summary/compare` |
| 프리셋 | `POST·GET /presets`, `GET·PATCH·DELETE /presets/:presetId` |
| 관심 특허 | `GET·POST /favorites`, `GET·PATCH·DELETE /favorites/:applicationNumber` |
| 상태 확인 | `GET /health` |

- 요청·응답 필드와 오류 계약은 [Docs 저장소의 API 명세서](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs/blob/main/specs/TechLens_API%EB%AA%85%EC%84%B8%EC%84%9CV1.1.md)에서 확인합니다.

## 11. 환경과 실행

### 11-1. 필수 환경변수

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: Access Token 서명 키
- `KIPRIS_API_KEY`: KIPRIS API 인증 키
- `KIPRIS_BASE_URL`: KIPRIS API 기본 주소
- `PORT`: 서버 포트
- `FRONTEND_URL_DEV`, `FRONTEND_URL_PROD`, `FRONTEND_URL_VERCEL`, `FRONTEND_URL_STAGING`: CORS 허용 출처

- 실제 키와 비밀번호는 `.env`에만 저장합니다.
- 환경변수 값은 커밋과 README에 포함하지 않습니다.

### 11-2. 로컬 실행

```bash
npm ci
npm run dev
```

- 서버 기본 주소: `http://localhost:4000`
- 상태 확인: `GET http://localhost:4000/health`
- 운영 시작: `npm run build && npm start`

## 12. 검증 방법

- 타입·빌드 검사:
  - `npm run build`
- 현재 테스트 스크립트:
  - `npm test`
  - 현재 저장소에는 자동화 테스트가 아직 연결되어 있지 않습니다.
- 수동 확인 범위:
  - 로그인·회원가입·로그아웃·토큰 재발급
  - 기본·고급 특허 검색과 KIPRIS 오류
  - 분석·비교 결과와 데이터 없음
  - 관심 특허·메모·프리셋의 사용자별 접근
  - 400·401·404·429·500 오류 응답

## 13. 상세 기술 문서

- [요구사항 정의서](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs/blob/main/specs/TechLens_%EC%9A%94%EA%B5%AC%EC%82%AC%ED%95%AD%EC%A0%95%EC%9D%98%EC%84%9CV1.1.md)
- [API 명세서](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs/blob/main/specs/TechLens_API%EB%AA%85%EC%84%B8%EC%84%9CV1.1.md)
- [DB 정의서](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs/blob/main/specs/TechLens_DB%EC%A0%95%EC%9D%98%EC%84%9CV1.1.md)
- [전체 Docs 저장소](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs)

## 14. 유지보수 원칙

- Controller에는 HTTP 처리만 두고 핵심 업무 규칙은 Service에서 관리합니다.
- Repository에는 PostgreSQL 접근만 두고 외부 API나 HTTP 응답을 넣지 않습니다.
- 새로운 API는 route, validator, controller, service, repository, 타입, 명세서 변경 여부를 함께 확인합니다.
- 외부 API 응답을 내부 모델로 변환한 뒤 프론트엔드에 전달해 외부 계약의 영향을 제한합니다.
- 기능 변경 전 기존 API 응답 형식과 DB 컬럼을 확인합니다.
- 오류를 무시하지 않고 로그와 클라이언트 응답의 책임을 구분합니다.

## 저작권 및 사용 조건

- 본 프로젝트는 더존ICT그룹·키컴 인턴십 프로젝트의 산출물입니다.
- 코드와 문서의 사용 범위는 관련 협업 및 내부 사용 조건을 우선합니다.
