/* ============================================
   최영미 개인 홈페이지 - JavaScript
============================================ */
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// ---------- Header scroll effect ----------
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-label', navMenu.classList.contains('open') ? '메뉴 닫기' : '메뉴 열기');
});

// Close menu when a link is clicked
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMenu.classList.remove('open'));
});

// ---------- Active nav link on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-menu a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.nav-menu a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(sec => observer.observe(sec));

// ---------- Scroll fade-in animation ----------
const fadeEls = document.querySelectorAll(
  '.expertise-card, .lecture-card, .tl-item, .cert-item, .about-grid, .contact-item'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => fadeObserver.observe(el));

// ---------- Stagger delay for grid items ----------
document.querySelectorAll('.expertise-grid .expertise-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
});
document.querySelectorAll('.lectures-grid .lecture-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 70}ms`;
});
document.querySelectorAll('.cert-list .cert-item').forEach((item, i) => {
  item.style.transitionDelay = `${i * 60}ms`;
});

// ---------- Contact form ----------
const form = document.getElementById('contactForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = form.querySelector('button[type="submit"]');
  const original = btn.textContent;

  // Simple validation
  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#ef4444';
      valid = false;
    }
  });

  if (!valid) {
    showToast('필수 항목을 모두 입력해주세요.', 'error');
    return;
  }

  btn.textContent = '전송 중...';
  btn.disabled = true;

  try {
    await addDoc(collection(db, 'inquiries'), {
      org:       form.org.value.trim(),
      name:      form.name.value.trim(),
      phone:     form.phone.value.trim(),
      email:     form.email.value.trim(),
      lecture:   form.lecture.options[form.lecture.selectedIndex].text,
      date:      form.date.value.trim(),
      message:   form.message.value.trim(),
      status:    'pending',
      createdAt: serverTimestamp(),
    });
    form.reset();
    showToast('문의가 접수되었습니다. 빠르게 연락드리겠습니다!', 'success');
  } catch (err) {
    console.error(err);
    showToast('전송 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
});

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: type === 'success' ? '#1a3a5c' : '#ef4444',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '0.93rem',
    fontWeight: '600',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    fontFamily: "'Noto Sans KR', sans-serif",
  });

  if (type === 'success') {
    toast.style.borderLeft = '4px solid #c8a96e';
  }

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---------- Stats counter animation ----------
function animateCounter(el, target, suffix, duration = 1600) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    statsObserver.unobserve(entry.target);
    const stats = entry.target.querySelectorAll('.stat strong');
    const data  = [{ val: 30, suffix: '+' }, { val: 7, suffix: '+' }, { val: 3, suffix: '' }, { val: 6, suffix: '' }];
    stats.forEach((el, i) => {
      if (data[i]) setTimeout(() => animateCounter(el, data[i].val, data[i].suffix), i * 120);
    });
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ---------- Smooth scroll for anchor links ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
