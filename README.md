# 최영미 개인 홈페이지 프로젝트

> 건양대학교 인권센터 연구전문교수 최영미의 개인 강의 의뢰 홈페이지

---

## 프로젝트 개요

- **목적**: 강의 의뢰 접수 및 프로필 소개
- **기술 스택**: 순수 HTML / CSS / JavaScript (빌드 도구 없음)
- **Firebase**: Firestore (문의 저장) + Authentication (관리자 로그인)
- **배포 예정**: Vercel + GitHub

---

## 파일 구조

```
homepage/
├── index.html              # 메인 홈페이지 (7개 섹션)
├── style.css               # 전체 스타일 (반응형)
├── script.js               # 메인 JS (폼 제출, 애니메이션)
├── firebase-config.js      # Firebase 초기화 및 export
├── admin.html              # 관리자 대시보드
├── admin.js                # 관리자 로직
├── 최영미 캐리커쳐.jpg.png   # 프로필 캐리커처 이미지
├── .gitignore              # Git 제외 파일 목록
└── README.md               # 이 문서
```

### 각 파일 설명

| 파일 | 역할 |
|------|------|
| `index.html` | Hero · About · 전문분야 · 강의프로그램 · 자격/경력 · 문의 · Footer 7개 섹션 |
| `style.css` | 딥 네이비 + 골드 컬러, 반응형 3단계(1050·900·600px), 스크롤 페이드인 애니메이션 |
| `script.js` | 강의 의뢰 폼 → Firestore 저장, 스크롤 애니메이션, 숫자 카운터 |
| `firebase-config.js` | Firebase SDK 초기화, auth / db / provider export |
| `admin.html` | 구글 로그인 + 문의 관리 대시보드 (상태 변경, 필터, 통계) |
| `admin.js` | Firestore 실시간 구독(`onSnapshot`), 상태 업데이트, XSS 방지 |

---

## 디자인 시스템

```css
--navy:      #1a3a5c   /* 주 색상 - 딥 네이비 */
--gold:      #c8a96e   /* 강조 색상 - 골드 */
--navy-dark: #0f2540   /* 진한 네이비 */
```

**폰트**: Noto Sans KR (Google Fonts CDN)
**Firebase SDK 버전**: 12.10.0 (CDN ES Module 방식)

---

## Firebase 설정

### firebase-config.js (실제 설정값 적용 완료)

```js
const firebaseConfig = {
  apiKey:            "AIzaSyAFOb75rlr0GQQs5EX_6XvQZayi4ya3ago",
  authDomain:        "choiyoungmi-homepage.firebaseapp.com",
  projectId:         "choiyoungmi-homepage",
  storageBucket:     "choiyoungmi-homepage.firebasestorage.app",
  messagingSenderId: "44112463493",
  appId:             "1:44112463493:web:e0898c56fa95380f3f0bec",
  measurementId:     "G-4MW22J2082"
};
```

### Firebase Console에서 해야 할 설정

1. **Authentication 활성화**
   - Firebase Console → Authentication → Sign-in method
   - Google 제공업체 활성화
   - 승인된 도메인에 배포 도메인 추가 (예: `choiyoungmi.vercel.app`)

2. **Firestore 보안 규칙**
   - Firebase Console → Firestore Database → 규칙
   - 아래 규칙 적용:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 문의 폼: 누구나 쓰기 가능, 읽기는 로그인 사용자만
    match /inquiries/{docId} {
      allow create: if true;
      allow read, update: if request.auth != null;
    }
  }
}
```

3. **Firestore 컬렉션**: `inquiries`
   - 문서 필드: `org`, `name`, `phone`, `email`, `lecture`, `date`, `message`, `status`, `createdAt`
   - status 값: `pending`(대기) / `done`(완료) / `canceled`(취소)

---

## 관리자 페이지

- **접속**: 홈페이지 Footer 하단 "관리자" 링크 클릭 (매우 작게 표시됨)
- **URL**: `/admin.html`
- **로그인**: Google 계정으로 로그인
- **기능**:
  - 문의 목록 실시간 조회 (최신순)
  - 상태 필터 (전체/대기/완료/취소)
  - 통계 카드 (전체/대기중/완료/이번달)
  - 상세 모달에서 완료/취소 처리

---

## 로컬 개발 서버 실행

```bash
cd c:/claude/homepage
python -m http.server 3000
```

브라우저에서 `http://localhost:3000` 접속

> ⚠️ Firebase ES Module은 반드시 HTTP 서버를 통해 실행해야 합니다 (file:// 불가)

---

## GitHub 업로드 방법

### 1. GitHub Personal Access Token (PAT) 발급
1. GitHub.com 로그인 → 우상단 프로필 → Settings
2. 좌측 하단 **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)** 클릭
4. Note: `homepage-deploy`, Expiration: 90days, Scope: `repo` 체크
5. 생성된 토큰 복사 (다시 볼 수 없음!)

### 2. GitHub 레포지토리 생성
1. GitHub.com → **New repository**
2. Repository name: `homepage`
3. Public 선택 → **Create repository**

### 3. 터미널에서 Push

```bash
cd c:/claude/homepage

# remote 추가 (사용자명 변경 필요)
git remote add origin https://github.com/[GitHub사용자명]/homepage.git

# push (비밀번호 입력 시 PAT 토큰 붙여넣기)
git push -u origin master
```

---

## Vercel 배포 방법

### 방법 A: 웹사이트에서 직접 배포 (권장)
1. [vercel.com](https://vercel.com) 접속 → GitHub 계정으로 로그인
2. **Add New → Project**
3. GitHub 레포지토리 `homepage` 선택
4. Framework: **Other** (빌드 도구 없음)
5. **Deploy** 클릭

### 방법 B: Vercel 토큰 이용 CLI 배포
```bash
# Vercel 대시보드 → Settings → Tokens → Create Token
npx vercel deploy --token [발급받은_토큰]
```

> ⚠️ 컴퓨터 이름이 한글("영미노트북")이면 CLI 로그인이 안됩니다. 방법 A 권장.

---

## 현재 개발 현황

### 완료된 작업
- [x] 전체 홈페이지 HTML/CSS/JS 개발
- [x] 반응형 디자인 (모바일/태블릿/데스크탑)
- [x] 캐리커처 이미지 연동 (`최영미 캐리커쳐.jpg.png`)
- [x] 스크롤 애니메이션 (페이드인, 숫자 카운터)
- [x] Hero 섹션 입장 애니메이션 + 부유 효과 + 회전 링
- [x] Firebase 실제 설정값 연동
- [x] Firestore 강의 의뢰 폼 저장
- [x] 관리자 대시보드 (Google 로그인 + 문의 관리)
- [x] Git 초기화 및 첫 커밋 (cc521eb)

### 남은 작업
- [ ] Firebase Console: Google 로그인 활성화
- [ ] Firebase Console: Firestore 보안 규칙 적용
- [ ] GitHub 레포지토리 생성 및 push
- [ ] Vercel 배포
- [ ] (선택) 커스텀 도메인 연결

---

## 섹션 구성 (index.html)

| 섹션 | 내용 |
|------|------|
| Hero | 캐리커처 + 이름 + 직함 + 통계 (경력 30년, 전문분야 7+, 자격증 3, 수상 6) |
| About | 인사말 + 프로필 + 수상 이력 |
| 전문분야 | 고충상담·성폭력예방·갈등해결·인권교육·진로상담 5개 카드 |
| 강의 프로그램 | 8개 강의 분야 카드 |
| 자격 & 경력 | 타임라인 형식 경력 + 자격증 그리드 |
| 강의 의뢰 | Firestore 연동 문의 폼 |
| Footer | 연락처 + SNS + 관리자 링크 |

---

## 주요 연락처 정보

- 전화: 010-6417-8070
- 이메일: mama8070@hanmail.net
- 소속: 건양대학교 인권센터 연구전문교수
