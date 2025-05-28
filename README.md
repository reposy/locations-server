# locations-server

## 프로젝트 소개

이 프로젝트는 **가족, 특히 어머니와 약속 장소에서 만날 때** 서로의 위치를 실시간으로 공유할 수 있도록 만든 위치 공유 서버입니다. 낯선 장소에서 서로를 쉽게 찾을 수 있도록, 그룹 단위의 위치 공유와 실시간 위치 업데이트 기능을 제공합니다.

> **홈서버로 운용 중이며, 아직 외부에 공개하지 않았습니다.**

---

## 주요 기능

- **그룹 기반 위치 공유**: 그룹을 생성하고, 그룹 멤버 간 실시간 위치를 공유할 수 있습니다.
- **실시간 위치 업데이트**: WebSocket(STOMP) 기반으로 위치 정보가 실시간으로 전송됩니다.
- **사용자 인증 및 세션 관리**: 회원가입, 로그인, 로그아웃, 세션 관리 기능 제공.
- **지도 연동**: 프론트엔드에서 네이버 지도를 활용하여 위치를 시각적으로 표시.
- **초대 및 그룹 관리**: 그룹 초대, 멤버 관리, 역할(OWNER/MEMBER) 구분.
- **REST API 및 웹 프론트엔드**: Spring Boot 기반 REST API와 Thymeleaf, JS 기반 웹 프론트엔드 제공.

---

## 기술 스택

- **백엔드**
  - Kotlin, Spring Boot 3.x
  - Spring Data JPA, Hibernate
  - WebSocket (STOMP)
  - H2/SQLite (테스트/운영 DB)
  - Gradle 빌드
- **프론트엔드**
  - Thymeleaf 템플릿
  - 네이버 지도 API
  - 바닐라 JS (모듈화, 상태관리)
- **배포/운영**
  - Docker, docker-compose
  - 환경별 YML 설정 (prod, test-h2, test-sqlite)
  - Config Server 연동

---

## 디렉토리 구조

```
.
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── springbootkotlin/
│   │   │       └── locationsserver/
│   │   │           ├── websocket/      # 실시간 위치 공유 서비스
│   │   │           ├── domain/         # 도메인(guest, group, user, auth 등)
│   │   │           └── infrastructure/ # 설정, 외부 연동
│   │   └── resources/
│   │       ├── static/                 # 정적 리소스(JS, 이미지 등)
│   │       └── application-*.yml       # 환경별 설정
├── build.gradle.kts
├── docker-compose.yml
└── ...
```

---

## 실행 방법

### 1. 개발 환경에서 실행

```bash
./gradlew bootRun
```

- 기본적으로 H2 또는 SQLite를 사용합니다.
- 환경 설정은 `src/main/resources/application-*.yml` 참고.

### 2. Docker로 실행

```bash
docker-compose up -d
```

- `docker-compose.yml`에 따라 config-server와 locations-server가 함께 실행됩니다.
- 운영 환경에서는 `locations-server.db`(SQLite)와 `keystore.p12`(SSL 인증서)가 필요합니다.
- 443, 80 포트가 컨테이너의 8443 포트로 매핑됩니다.

---

## 주요 엔드포인트 및 구조

- **WebSocket 엔드포인트**
  - `/group/location.update` : 그룹 내 위치 업데이트 메시지 송수신
  - `/topic/group.location.{groupId}` : 그룹별 위치 브로드캐스트
  - `/topic/group.members.{groupId}` : 그룹 멤버 목록 브로드캐스트

- **REST API**
  - `/api/users/me` : 현재 사용자 정보
  - `/api/auth/signup` : 회원가입
  - `/api/auth/signin` : 로그인
  - `/api/auth/signout` : 로그아웃
  - `/api/group/...` : 그룹 관리

- **프론트엔드**
  - `/js/user/` : 사용자 위치 지도, 상태 관리, 네비게이션 등
  - 네이버 지도 연동, 그룹/멤버/위치 마커 표시

---

## 개발/운영 참고

- Spring Boot 3.x, Kotlin 1.9.x, Java 21
- 환경 변수로 도메인, config server 정보, DB 파일 경로 등을 지정
- WebSocket, REST API, DB, 인증 등 모듈화 구조
- 자세한 개발 가이드는 `HELP.md` 참고

---

## 라이선스

> 개인 홈서버 및 가족용으로 개발.  
> 외부 공개/상업적 사용은 별도 문의 바랍니다. 