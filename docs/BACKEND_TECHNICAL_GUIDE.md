# TechLens Backend 주요 기술 문서

- 수정일자: 2026-07-31
- 작성자: 심우현
- 대상: TechLens 백엔드 저장소

## 목차

- [1. 문서 목적](#1-문서-목적)
- [2. 서버 구성](#2-서버-구성)
- [3. 계층별 책임](#3-계층별-책임)
- [4. 요청 처리 흐름](#4-요청-처리-흐름)
- [5. 외부 특허 데이터 처리](#5-외부-특허-데이터-처리)
- [6. 인증과 사용자 데이터](#6-인증과-사용자-데이터)
- [7. 입력 검증과 오류 처리](#7-입력-검증과-오류-처리)
- [8. 요청 제한과 운영 고려사항](#8-요청-제한과-운영-고려사항)
- [9. API와 데이터 계약](#9-api와-데이터-계약)
- [10. 실행 환경](#10-실행-환경)
- [11. 검증과 테스트](#11-검증과-테스트)
- [12. 유지보수 체크리스트](#12-유지보수-체크리스트)

## 1. 문서 목적

- 이 문서는 백엔드 README에서 생략한 계층별 책임과 데이터 흐름을 설명합니다.
- API나 분석 로직을 변경할 때 Controller·Service·Repository 중 어느 계층을 수정해야 하는지 판단하는 기준으로 사용합니다.
- 현재 코드에 존재하는 구조와 운영상 제약을 기준으로 작성하며, 확정되지 않은 성능 수치는 기재하지 않습니다.

## 2. 서버 구성

```text
Frontend
  ↓ REST API
Express + TypeScript
  ├── Middleware: 인증·검증·rate limit·오류 처리
  ├── Controller: HTTP 요청·응답
  ├── Service: 업무 규칙·외부 API 조합·분석
  ├── Repository: PostgreSQL 접근
  └── KIPRIS Open API: 특허 원천 데이터
```

- `src/server.ts`가 서버를 기동하고 종료 신호를 처리합니다.
- `src/app.ts`가 보안 설정, 공통 Middleware와 기능별 Route를 등록합니다.
- `src/config`가 환경변수와 PostgreSQL 연결을 관리합니다.
- `src/routes`는 인증·특허·요약·관심 특허·프리셋 단위로 API를 나눕니다.

## 3. 계층별 책임

| 계층 | 책임 | 두지 않는 것 |
| --- | --- | --- |
| Route | URL, HTTP method, Middleware 조합 | 업무 규칙, DB 쿼리 |
| Middleware | 인증, 입력 검증, 요청 제한, 공통 오류 | 도메인 응답 조합 |
| Controller | 요청값 추출, Service 호출, HTTP 응답 | 외부 XML 파싱, SQL |
| Service | 업무 규칙, 외부 API 조합, 분석 계산 | HTTP 객체 직접 처리 |
| Repository | PostgreSQL 조회·저장·수정·삭제 | HTTP 상태 코드, 사용자 메시지 |
| Validator·Type | 외부 입력과 내부 데이터 형태 정의 | 데이터 저장 로직 |

- 새로운 기능은 먼저 API 계약과 업무 흐름을 정의한 뒤 계층별 변경 범위를 나눕니다.
- Controller가 길어지면 조건 판단과 데이터 조합이 Service에 남아 있는지 확인합니다.
- Repository는 사용자 소유권이나 정책을 임의로 판단하지 않고 Service와 인증 정보에 필요한 데이터만 제공합니다.

## 4. 요청 처리 흐름

```text
HTTP 요청
  -> Route
  -> rate limit / 인증 / Zod 검증
  -> Controller
  -> Service
  -> Repository 또는 KIPRIS API
  -> 내부 타입으로 변환
  -> JSON 응답 또는 공통 오류 처리
```

### 4-1. 특허 검색

- 검색 조건을 `patentSchemas`에서 검증합니다.
- Patent Controller가 요청값을 Service에 전달합니다.
- Patent Service가 KIPRIS API를 호출하고 XML 응답을 내부 결과 구조로 변환합니다.
- 검색 결과와 페이지 정보를 JSON으로 반환합니다.
- 외부 API의 원본 필드와 화면용 필드의 차이는 Service·Type 계층에서 흡수합니다.

### 4-2. 요약 분석과 비교

- 기업·기간 조건을 검증하고 Summary Service에 전달합니다.
- 필요한 특허 데이터를 수집한 뒤 IPC 분포, 월별 출원 추이, 등록 상태를 계산합니다.
- 비교 요청은 기업별 결과를 구분해 반환합니다.
- 분석 규칙이 변경되면 프론트엔드 차트보다 Service의 집계 기준과 API 문서를 먼저 확인합니다.

### 4-3. 사용자 저장 데이터

- 인증 Middleware가 확인한 사용자 ID를 요청 흐름에 연결합니다.
- Favorite·Preset Service가 사용자 소유 데이터인지 확인한 뒤 Repository를 호출합니다.
- 생성·수정·삭제 결과는 프론트엔드가 관련 cache를 갱신할 수 있는 형태로 반환합니다.

## 5. 외부 특허 데이터 처리

- KIPRIS Open API는 외부 시스템이므로 네트워크 오류, 응답 지연, 호출 제한을 고려해야 합니다.
- Axios를 통해 외부 API를 호출하고 `xml2js`로 XML을 파싱합니다.
- XML의 단일 값·배열 값 차이를 내부 타입 변환 단계에서 정리합니다.
- IPC 분류와 특허 상태는 서버에서 일관된 기준으로 변환해 프론트엔드가 반복 해석하지 않도록 합니다.
- 외부 API의 원본 응답이나 인증 키를 로그와 클라이언트 응답에 그대로 노출하지 않습니다.
- 검색 인덱스나 대량 데이터 수집을 추가할 때는 API 호출량, 응답 지연, 갱신 주기를 별도 검토합니다.

## 6. 인증과 사용자 데이터

- 회원가입 시 비밀번호를 해시한 뒤 사용자 정보를 저장합니다.
- 로그인 성공 시 Access Token과 Refresh Token을 발급합니다.
- 일반 API는 Access Token을 검증하고, 만료된 경우 Refresh Token 재발급 흐름을 사용합니다.
- Refresh Token은 저장소에서 관리하며 재발급·로그아웃 시 기존 토큰을 교체하거나 삭제합니다.
- 관심 특허와 프리셋 조회·변경은 인증된 사용자 ID를 기준으로 제한합니다.
- 인증 실패는 401, 권한 또는 소유권 확인 실패는 도메인 규칙에 맞는 오류로 구분합니다.

## 7. 입력 검증과 오류 처리

- `validators`의 Zod schema가 Route 경계에서 요청 입력을 검증합니다.
- 잘못된 입력은 Controller에 도달하기 전에 거절해 업무 로직의 가정을 단순하게 유지합니다.
- `errors`의 도메인 오류 타입으로 잘못된 요청·인증 실패·리소스 없음 등을 구분합니다.
- 공통 Error Handler가 오류를 HTTP 상태 코드와 일관된 응답 구조로 변환합니다.
- 외부 KIPRIS 실패와 내부 서버 오류를 같은 성공 응답으로 숨기지 않습니다.
- 오류 응답에는 토큰, API 키, 비밀번호, 원본 외부 응답과 같은 민감정보를 포함하지 않습니다.

## 8. 요청 제한과 운영 고려사항

- `express-rate-limit`으로 인증·일반·외부 API 요청의 빈도를 제한합니다.
- `helmet`으로 기본 보안 헤더를 설정하고 `cors`로 허용된 프론트엔드 출처만 연결합니다.
- 외부 API 호출이 많은 검색·분석 기능은 요청 범위와 페이지 수를 확인해야 합니다.
- 운영 환경의 데이터베이스 연결 문자열, JWT 키, KIPRIS 키는 배포 환경변수로만 주입합니다.
- 운영 DB 스키마 변경은 문서와 마이그레이션을 확인한 뒤 별도 승인 절차로 진행합니다.
- 응답 시간이나 호출량을 개선할 때는 먼저 로그·측정값을 확보하고 임의의 캐시를 추가하지 않습니다.

## 9. API와 데이터 계약

- 인증: `POST /users/signup`, `/users/login`, `/users/refresh`, `/users/logout`
- 특허: `POST /patents/search/basic`, `POST /patents/search/advanced`, `GET /patents/:applicationNumber`
- 분석: `GET /summary`, `GET /summary/compare`
- 프리셋: `POST·GET /presets`, `GET·PATCH·DELETE /presets/:presetId`
- 관심 특허: `GET·POST /favorites`, `GET·PATCH·DELETE /favorites/:applicationNumber`
- 상태 확인: `GET /health`

- 정확한 필드명·상태 코드·오류 응답은 [TechLens API 명세서](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs/blob/main/specs/TechLens_API%EB%AA%85%EC%84%B8%EC%84%9CV1.1.md)를 기준으로 합니다.
- 테이블·컬럼·관계는 [TechLens DB 정의서](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs/blob/main/specs/TechLens_DB%EC%A0%95%EC%9D%98%EC%84%9CV1.1.md)를 기준으로 합니다.
- API 응답을 변경할 때는 Backend 코드, Frontend 타입·Hook, API 명세서를 함께 확인합니다.

## 10. 실행 환경

- Node.js: `20.19.0`
- Runtime: Express + TypeScript
- Database: PostgreSQL
- External API: KIPRIS Open API
- 주요 환경변수
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `KIPRIS_API_KEY`
  - `KIPRIS_BASE_URL`
  - `PORT`
  - 프론트엔드 허용 출처 환경변수

```bash
npm ci
npm run dev
npm run build
npm start
```

## 11. 검증과 테스트

- `npm run build`로 TypeScript 컴파일을 확인합니다.
- `npm test`는 현재 테스트 연결 상태를 확인하는 스크립트입니다.
- 자동화 테스트가 보강되기 전까지 다음 흐름을 수동으로 확인합니다.
  - 회원가입·로그인·로그아웃·토큰 재발급
  - 기본·고급 특허 검색과 외부 API 오류
  - 요약 분석·기업 비교와 데이터 없음
  - 관심 특허·메모·프리셋의 사용자별 접근
  - 400·401·404·429·500 오류 응답

## 12. 유지보수 체크리스트

- 새 API가 Route·Validator·Controller·Service·Repository 책임을 지키는가?
- 외부 XML과 프론트엔드 응답 사이의 변환 기준이 Service에 남아 있는가?
- 사용자 소유 데이터가 인증된 사용자 ID 기준으로 제한되는가?
- 성공·실패·외부 API 장애·데이터 없음이 구분되는가?
- API 명세서와 DB 정의서의 필드·컬럼이 코드와 일치하는가?
- 환경변수·토큰·API 키가 소스와 로그에 노출되지 않는가?
- 변경 후 `npm run build`와 관련 수동·자동 테스트를 실행했는가?
