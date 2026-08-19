import './style.css';
import { initScene } from './three-scene.js';

/* ---------------- 3D backdrop ---------------- */
const canvas = document.getElementById('scene');
const scene = canvas ? initScene(canvas) : null;

/* ---------------- footer year ---------------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------------- navigation ---------------- */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target && e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------------- scroll UI ---------------- */
const progressBar = document.getElementById('scroll-progress-bar');
const toTop = document.getElementById('to-top');

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${p})`;
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
  if (toTop) toTop.classList.toggle('show', window.scrollY > 620);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (toTop) {
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------- reveal on scroll ---------------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = Array.from(entry.target.parentElement?.children || []).filter((c) =>
          c.classList.contains('reveal'),
        );
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

/* ---------------- animated counters ---------------- */
function animateCounter(el) {
  const targetValue = Number(el.dataset.count) || 0;
  const duration = 1500;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(targetValue * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counters = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );
  counters.forEach((c) => counterObserver.observe(c));
}

/* ---------------- active section + scene mood ---------------- */
const sections = document.querySelectorAll('main section[id]');
const navAnchorLinks = document.querySelectorAll('.nav__links a[href^="#"]');

if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navAnchorLinks.forEach((a) =>
          a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`),
        );
        const index = Array.from(sections).indexOf(entry.target);
        if (scene) scene.setMood(index);
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  );
  sections.forEach((s) => sectionObserver.observe(s));
}

/* ---------------- hero title tilt ---------------- */
const heroTitle = document.querySelector('[data-tilt]');
const hero = document.getElementById('home');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroTitle && hero && finePointer && !reducedMotion) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroTitle.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
  });
  hero.addEventListener('mouseleave', () => {
    heroTitle.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

/* ---------------- contact form (demo) ---------------- */
const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');

if (form && note) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    note.textContent = "Thank you! Your message has been noted — we'll get back to you soon.";
    note.classList.add('ok');
    form.reset();
    window.setTimeout(() => {
      note.textContent = '';
      note.classList.remove('ok');
    }, 5000);
  });
}
