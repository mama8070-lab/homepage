/* ============================================
   관리자 대시보드 - JavaScript
============================================ */
import { auth, provider, db } from './firebase-config.js';
import {
  signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  collection, onSnapshot, doc, updateDoc, orderBy, query
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// ---------- 상태 ----------
let allInquiries = [];
let currentFilter = 'all';
let currentDocId   = null;
let unsubscribe    = null;

// ---------- DOM ----------
const loginScreen  = document.getElementById('loginScreen');
const dashboard    = document.getElementById('dashboard');
const googleBtn    = document.getElementById('googleLoginBtn');
const logoutBtn    = document.getElementById('logoutBtn');
const userAvatar   = document.getElementById('userAvatar');
const userName     = document.getElementById('userName');
const inquiryBody  = document.getElementById('inquiryBody');
const inquiryTable = document.getElementById('inquiryTable');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState   = document.getElementById('emptyState');
const modalOverlay = document.getElementById('modalOverlay');
const modalBody    = document.getElementById('modalBody');
const modalDoneBtn = document.getElementById('modalDoneBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalCloseBtn  = document.getElementById('modalCloseBtn');

// ---------- 인증 ----------
googleBtn.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert('로그인에 실패했습니다: ' + e.message);
  }
});

logoutBtn.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user) {
    showDashboard(user);
  } else {
    showLogin();
  }
});

function showLogin() {
  loginScreen.style.display  = 'flex';
  dashboard.style.display    = 'none';
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
}

function showDashboard(user) {
  loginScreen.style.display = 'none';
  dashboard.style.display   = 'block';

  // 사용자 정보 표시
  userName.textContent = user.displayName || user.email;
  if (user.photoURL) {
    userAvatar.innerHTML = `<img src="${user.photoURL}" alt="프로필" />`;
  } else {
    userAvatar.textContent = (user.displayName || user.email)[0].toUpperCase();
  }

  loadInquiries();
}

// ---------- Firestore 실시간 구독 ----------
function loadInquiries() {
  loadingSpinner.style.display = 'block';
  inquiryTable.style.display   = 'none';
  emptyState.style.display     = 'none';

  const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));

  unsubscribe = onSnapshot(q, (snapshot) => {
    allInquiries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    loadingSpinner.style.display = 'none';
    updateStats();
    renderTable();
  }, (err) => {
    loadingSpinner.textContent = '데이터를 불러오지 못했습니다. Firestore 규칙을 확인하세요.';
    console.error(err);
  });
}

// ---------- 통계 ----------
function updateStats() {
  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  const pending = allInquiries.filter(i => i.status === 'pending').length;
  const done    = allInquiries.filter(i => i.status === 'done').length;
  const thisMonth = allInquiries.filter(i => {
    if (!i.createdAt) return false;
    const d = i.createdAt.toDate();
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;

  document.getElementById('statTotal').textContent   = allInquiries.length;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statDone').textContent    = done;
  document.getElementById('statMonth').textContent   = thisMonth;
}

// ---------- 테이블 렌더 ----------
function renderTable() {
  const filtered = currentFilter === 'all'
    ? allInquiries
    : allInquiries.filter(i => i.status === currentFilter);

  if (filtered.length === 0) {
    inquiryTable.style.display = 'none';
    emptyState.style.display   = 'block';
    return;
  }

  inquiryTable.style.display = '';
  emptyState.style.display   = 'none';

  inquiryBody.innerHTML = filtered.map(item => {
    const date = item.createdAt
      ? item.createdAt.toDate().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', year: '2-digit' })
      : '-';
    const statusMap = {
      pending:  '<span class="status-badge status-pending">대기</span>',
      done:     '<span class="status-badge status-done">완료</span>',
      canceled: '<span class="status-badge status-canceled">취소</span>',
    };
    return `
      <tr>
        <td>
          <strong>${escHtml(item.org || '-')}</strong>
          <span class="sub">${escHtml(item.name || '-')}</span>
        </td>
        <td>
          <strong>${escHtml(item.phone || '-')}</strong>
          <span class="sub">${escHtml(item.email || '-')}</span>
        </td>
        <td class="col-hide">${escHtml(item.lecture || '-')}</td>
        <td class="col-hide">${escHtml(item.date || '-')}</td>
        <td>${statusMap[item.status] || statusMap.pending}</td>
        <td>${date}</td>
        <td>
          <button class="action-btn" onclick="openModal('${item.id}')">상세</button>
        </td>
      </tr>`;
  }).join('');
}

// ---------- 필터 탭 ----------
document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTable();
  });
});

// ---------- 상태 업데이트 ----------
async function updateStatus(id, status) {
  if (!id) return;
  try {
    await updateDoc(doc(db, 'inquiries', id), { status });
  } catch (e) {
    alert('상태 업데이트에 실패했습니다: ' + e.message);
  }
}

// ---------- 상세 모달 ----------
window.openModal = function(id) {
  const item = allInquiries.find(i => i.id === id);
  if (!item) return;
  currentDocId = id;

  const date = item.createdAt
    ? item.createdAt.toDate().toLocaleString('ko-KR')
    : '-';

  modalBody.innerHTML = `
    <div class="modal-row"><span class="modal-label">기관</span>   <span class="modal-val">${escHtml(item.org || '-')}</span></div>
    <div class="modal-row"><span class="modal-label">담당자</span> <span class="modal-val">${escHtml(item.name || '-')}</span></div>
    <div class="modal-row"><span class="modal-label">연락처</span> <span class="modal-val"><a href="tel:${item.phone}">${escHtml(item.phone || '-')}</a></span></div>
    <div class="modal-row"><span class="modal-label">이메일</span> <span class="modal-val"><a href="mailto:${item.email}">${escHtml(item.email || '-')}</a></span></div>
    <div class="modal-row"><span class="modal-label">강의</span>   <span class="modal-val">${escHtml(item.lecture || '-')}</span></div>
    <div class="modal-row"><span class="modal-label">일정</span>   <span class="modal-val">${escHtml(item.date || '-')}</span></div>
    <div class="modal-row"><span class="modal-label">문의</span>   <span class="modal-val">${escHtml(item.message || '-')}</span></div>
    <div class="modal-row"><span class="modal-label">접수</span>   <span class="modal-val">${date}</span></div>
  `;
  modalOverlay.classList.add('open');
};

modalDoneBtn.addEventListener('click', async () => {
  await updateStatus(currentDocId, 'done');
  modalOverlay.classList.remove('open');
});
modalCancelBtn.addEventListener('click', async () => {
  await updateStatus(currentDocId, 'canceled');
  modalOverlay.classList.remove('open');
});
modalCloseBtn.addEventListener('click', () => modalOverlay.classList.remove('open'));
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('open');
});

// ---------- XSS 방지 ----------
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
