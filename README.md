# TechLens Backend

- 수정일자: 2026-07-31
- 작성자: 심우현
- 프로젝트: 기업의 특허 검색과 기술 동향 분석을 지원하는 백엔드 API
- 프론트엔드: [TechLens Frontend](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Frontend)
- 공통 문서: [TechLens 기술 문서](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs)

> 외부 특허 데이터를 서비스에 필요한 형태로 가공하고, 인증·검색·분석·사용자 데이터를 일관된 API로 제공합니다.

## 목차

- [1. 프로젝트 개요](#1-프로젝트-개요)
- [2. 현황](#2-현황)
- [3. 문제 정의](#3-문제-정의)
- [4. 해결방안](#4-해결방안)
- [5. 기대효과](#5-기대효과)
- [6. 데모](#6-데모)
- [7. 주요 구현 포인트](#7-주요-구현-포인트)
- [8. 상세 기술 문서](#8-상세-기술-문서)
- [9. 라이선스](#9-라이선스)

## 1. 프로젝트 개요

- TechLens Backend는 KIPRIS Open API의 특허 원천 데이터를 서비스용 JSON API로 변환합니다.
- 회원 인증, 특허 검색·상세 조회, 요약 분석, 기업 비교, 관심 특허와 검색 프리셋을 제공합니다.
- 외부 API의 XML 구조와 호출 제약을 프론트엔드에 노출하지 않고 서버 계층에서 처리합니다.
- 백엔드의 상세 구현 기준은 [주요 기술 문서](docs/BACKEND_TECHNICAL_GUIDE.md)에서 확인할 수 있습니다.

## 2. 현황

- 특허 원천 데이터는 외부 KIPRIS API에서 XML 형태로 제공됩니다.
- 서비스는 원천 데이터를 그대로 전달하지 않고 검색 결과와 분석 지표로 가공합니다.
- 인증이 필요한 사용자 데이터와 특허 조회·분석 요청은 서로 다른 처리 경계를 가집니다.
- 특허 검색·분석과 사용자별 저장 기능을 하나의 REST API 계약으로 프론트엔드에 제공합니다.

## 3. 문제 정의

- 외부 XML 응답과 API 호출 제한을 프론트엔드가 직접 처리하면 클라이언트와 외부 시스템의 결합도가 높아집니다.
- IPC 분류와 특허 상태를 화면별로 해석하면 데이터 표현과 분석 결과가 일관되지 않을 수 있습니다.
- 관심 특허와 프리셋은 사용자별 소유권을 보장하지 않으면 다른 사용자의 데이터가 노출될 수 있습니다.
- Access Token 만료, 잘못된 입력, 외부 API 장애, 결과 없음은 서로 다른 대응이 필요합니다.
- 검색과 분석 요청이 집중되면 외부 API 호출량과 응답 시간이 증가할 수 있습니다.

## 4. 해결방안

- Route·Middleware·Controller·Service·Repository를 분리해 HTTP 처리, 정책, 데이터 접근의 책임을 나눕니다.
- KIPRIS 연동과 XML 파싱은 Service 계층에서 처리하고 내부 타입과 JSON 응답으로 변환합니다.
- Zod schema로 인증·검색·관심 특허·프리셋 입력을 API 경계에서 검증합니다.
- JWT Access Token과 저장된 Refresh Token을 사용해 일반 요청과 재발급 흐름을 분리합니다.
- 공통 Error Handler와 도메인 오류 클래스로 입력 오류·인증 오류·외부 연동 오류를 구분합니다.
- 인증·일반·외부 API 요청에 rate limit을 적용해 요청 폭주와 외부 호출 과다를 제어합니다.
- IPC·기간·등록 상태 분석을 서버에서 계산해 프론트엔드가 동일한 기준의 결과를 사용하도록 합니다.

## 5. 기대효과

- 프론트엔드는 외부 XML이 아닌 일관된 JSON API 계약을 사용합니다.
- 외부 데이터 변환과 분석 정책이 서버에 모여 화면과 저장 구조의 변경 영향을 줄일 수 있습니다.
- 사용자별 관심 특허와 프리셋의 접근 범위를 인증된 사용자 ID 기준으로 통제할 수 있습니다.
- 입력 검증·오류 처리·요청 제한을 서버 경계에서 수행해 운영 시 예측 가능성을 높입니다.
- Controller와 Repository의 책임이 분리되어 기능 변경과 테스트 범위를 파악하기 쉬워집니다.

## 6. 데모

- [TechLens 서비스 데모](https://techlens-app.vercel.app/login)
- 백엔드에서 확인되는 주요 서버 흐름
  - 로그인과 Access Token 재발급
  - 기본·고급 특허 검색
  - 특허 상세·IPC 정규화
  - 요약 분석과 기업 비교
  - 관심 특허와 검색 프리셋 관리
  - `GET /health` 상태 확인

## 7. 주요 구현 포인트

- API 계층
  - Route가 URL과 Middleware 조합을 구성합니다.
  - Middleware가 인증, 입력 검증, rate limit, 공통 오류 처리를 담당합니다.
  - Controller는 요청값을 추출하고 Service 결과를 HTTP 응답으로 반환합니다.
  - Service는 특허 검색·분석·인증·사용자 기능의 업무 흐름을 조합합니다.
  - Repository는 PostgreSQL 조회·저장·수정·삭제만 담당합니다.
- 외부 특허 연동
  - Axios로 KIPRIS API를 호출합니다.
  - `xml2js`로 XML 응답을 파싱하고 내부 타입으로 정규화합니다.
  - IPC·기간·등록 상태 기준의 분석 결과를 API 응답으로 제공합니다.
- 인증과 보안
  - `bcryptjs`로 비밀번호를 처리하고 `jsonwebtoken`으로 토큰을 발급합니다.
  - Refresh Token 저장·조회·삭제를 Repository로 분리합니다.
  - `helmet`, `cors`, `express-rate-limit`으로 HTTP 보안과 요청량을 관리합니다.
- 검증 기준
  - `npm run build`로 TypeScript 컴파일을 확인합니다.
  - 현재 자동화 테스트 스크립트는 연결되어 있지 않아 인증·검색·분석·사용자 데이터 흐름을 별도로 보강해야 합니다.
  - API 요청·응답 필드와 데이터베이스 기준은 [공통 API·DB 문서](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs)와 함께 확인합니다.

## 8. 상세 기술 문서

- [Backend 주요 기술 문서](docs/BACKEND_TECHNICAL_GUIDE.md)
  - 서버 계층과 요청 처리 흐름
  - KIPRIS XML 변환과 분석 책임
  - 인증·토큰·사용자 데이터 접근
  - 오류 응답과 rate limit
  - 환경변수, 실행, 테스트와 유지보수 기준
- [Backend API·DB·아키텍처 문서](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Docs)
  - API 명세, DB 정의서·ERD, 시스템 아키텍처와 실행 환경
- [Frontend 저장소](https://github.com/Douzone-Keycom-Internship-woohyun-2025/Frontend)
  - 사용자 화면, 서버 상태관리, 반응형 UI와 프론트엔드 테스트

## 9. 라이선스

- 본 프로젝트의 코드와 문서는 심우현의 포트폴리오 및 기술 검토 목적으로 관리합니다.
- 기업 협업 산출물의 권리와 사용 범위는 별도 협의와 원본 계약을 우선합니다.
