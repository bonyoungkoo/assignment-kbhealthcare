# Assignment – Task Management App

프론트엔드 과제 구현 프로젝트입니다.  
인증/토큰 갱신 플로우, 무한 스크롤 목록, 가상 스크롤링, 모달 시스템 등을 중심으로 구현했습니다.

---

## 🔗 배포 주소

과제는 개인 서버에 배포되어 있으며, 아래 주소에서 바로 확인할 수 있습니다.

- https://dugout.dev/assignment/kbhealthcare

---

## 📌 주요 기능 요약

- 인증 / 토큰 갱신 / 로그아웃 플로우
- 선언형 모달 시스템 (`modal.alert`, `modal.confirm`)
- Task 목록 조회
- 무한 스크롤
- 가상 스크롤링 (`@tanstack/react-virtual`)
- Task 상세 조회 / 삭제
- Dashboard 요약 지표
- 인증 상태에 따른 라우팅 제어

---

## 🛠️ 사용 기술 스택

- React 19
- React Router v7
- MUI v7
- React Hook Form + Zod
- TanStack Query v5
- TanStack Virtual
- MSW
- TypeScript

---

## 📁 프로젝트 폴더 구조

본 프로젝트는 **역할 기반 구조(FSD 스타일을 참고)**로 구성되어 있으며,  
인증 / 전역 상태 / 페이지 / API / mock 영역을 명확히 분리하는 것을 목표로 했습니다.

```text
src
├── app                     # 애플리케이션 전역 설정 영역
│   ├── providers            # 전역 Provider 모음
│   │   ├── auth             # 인증 상태 관리
│   │   │   ├── AuthContext.ts
│   │   │   ├── AuthProvider.tsx
│   │   │   └── useAuth.ts
│   │   ├── modal            # 선언형 모달 시스템
│   │   │   ├── ModalContext.ts
│   │   │   ├── ModalProvider.tsx
│   │   │   ├── modal.type.ts
│   │   │   └── useModal.ts
│   │   └── AppProviders.tsx # 모든 Provider를 조합
│   ├── router
│   │   └── Router.tsx       # 라우팅 설정
│   ├── routes
│   │   └── ProtectedRoute.tsx # 인증 보호 라우트
│   ├── App.tsx
│   └── theme.ts             # MUI theme 설정
│
├── assets                   # 정적 리소스
│
├── entities                 # (확장 대비) 도메인 엔티티 영역
│
├── features                 # 기능 단위 API / 로직
│   ├── auth
│   │   └── api
│   │       └── auth.api.ts
│   ├── dashboard
│   │   └── dashboard.api.ts
│   ├── profile
│   │   └── profile.api.ts
│   └── task
│       └── api
│           └── task.api.ts
│
├── mocks                    # MSW 기반 mock 서버
│   ├── browser.ts
│   ├── db.ts                # mock 데이터
│   ├── handlers.ts          # API 핸들러
│   └── session.store.ts     # refreshToken 세션 관리
│
├── pages                    # 실제 페이지 단위 UI
│   ├── dashboard
│   │   └── ui
│   │       └── Dashboard.tsx
│   ├── login
│   │   ├── model
│   │   │   └── login.schema.ts
│   │   └── ui
│   │       └── Login.tsx
│   ├── profile
│   │   └── ui
│   │       └── Profile.tsx
│   └── tasks
│       └── ui
│           ├── DeleteConfirmComponent.tsx
│           ├── TaskDetail.tsx
│           └── Tasks.tsx
│
├── shared                   # 공통 유틸 / 인프라 코드
│   ├── api
│   │   ├── ApiError.ts
│   │   ├── http.ts
│   │   ├── token.ts
│   │   └── types.ts
│   ├── auth
│   └── theme
│       └── colors.ts
│
├── widgets                  # 레이아웃 / 네비게이션 UI
│   ├── layout
│   │   ├── AppLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── GNB.tsx
│   └── LNB.tsx
│
├── index.css
└── main.tsx
```

## 🧪 테스트를 위한 설계 포인트

### 1. 토큰 갱신 테스트를 위한 TTL 설정 UI 추가

토큰 만료 및 refresh 흐름을 검토자가 직접 쉽게 확인할 수 있도록  
**로그인 시 accessToken / refreshToken의 TTL을 설정할 수 있는 UI를 추가**했습니다.

- accessToken 만료 → `/api/auth/refresh` 호출
- refreshToken 만료 → 로그인 페이지로 리다이렉트
- 짧은 TTL로도 토큰 갱신 시나리오를 빠르게 재현 가능

> 실제 서비스에서는 존재하지 않을 UI이지만,  
> **과제 검토 및 시나리오 재현을 위해 의도적으로 추가했습니다.**

---

### 2. MSW 환경에서의 토큰 관리 방식

로컬 개발 환경에서 **MSW(Mock Service Worker)** 를 사용해 인증 API를 mocking 하다 보니,  
서버와 동일한 HttpOnly 쿠키 전략을 그대로 재현하는 데 한계가 있었습니다.

이에 따라 다음과 같이 설계했습니다.

- **accessToken**
  - 메모리에서 관리
  - 모든 API 요청 시 `Authorization: Bearer <token>` 헤더로 전송
- **refreshToken**
  - `document.cookie` 기반으로 관리
  - `/api/auth/refresh` 요청 시 쿠키를 통해 전달

> 이 방식은 **보안 목적이 아닌 로컬 과제 환경에서의 동작 재현을 위한 선택**이며,  
> 실제 운영 환경에서는 HttpOnly 쿠키 기반으로 구현하는 것이 적절합니다.

---

### 3. 로그인 유효성 검증

로그인 폼의 입력 검증은 다음 스택을 사용했습니다.

- **React Hook Form**
- **Zod Schema**
- `onChange` 기반 실시간 유효성 검증

---

### 4. Task 데이터 구성

- Task 데이터는 **Mock 데이터 120개를 일괄 생성**하여 사용했습니다.
- 페이지당 10개씩 로딩

---

## 🤔 구현하면서 어려웠던 점

이번 과제에서 가장 고민이 많았던 부분은 **백엔드 API mocking의 적정 수준을 판단하는 것**이었습니다.

- 과제 특성상 프론트엔드 구현이 목적이지만,
- 인증 / 토큰 갱신 / 에러 케이스(401, 400)를 실제처럼 테스트하려면  
  어느 정도의 서버 상태를 흉내 낼 필요가 있었기 때문입니다.

특히 아래 항목들이 고민 지점이었습니다.

- refreshToken 세션 관리
- 토큰 만료 시점 제어
- 페이지 범위 초과 시 400 에러 처리

이 부분은 너무 과하게 구현해도 과제 의도에서 벗어나고,  
반대로 너무 단순하게 구현하면 프론트엔드 로직을 충분히 검증하기 어렵다고 판단했습니다.

그래서 다음 기준을 두고 구현했습니다.

- 실제 백엔드 구조를 완벽히 재현하지는 않는다
- 하지만 프론트엔드에서 겪게 될 **실제 사용 시나리오는 최대한 자연스럽게 재현한다**
- 검토자가 동작을 이해하고 직접 테스트할 수 있어야 한다


