/* ============================================================
   MotoStore — JavaScript Principal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Cursor personalizado ──────────────────────────────────
  const cursor     = document.querySelector('.cursor');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursor && cursorRing) {
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
    });

    function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cursorRing.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .cat-card, .moto-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform += ' scale(2)';
        cursorRing.style.borderColor = 'transparent';
        cursor.style.opacity = '0.6';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = cursor.style.transform.replace(' scale(2)', '');
        cursorRing.style.borderColor = 'var(--verde)';
        cursor.style.opacity = '1';
      });
    });
  }

  // ── Header scroll ──────────────────────────────────────────
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ── Mobile menu ────────────────────────────────────────────
  const menuToggle = document.querySelector('.menu-toggle');
  const nav        = document.querySelector('nav');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const spans = menuToggle.querySelectorAll('span');
      if (nav.classList.contains('open')) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  // ── Hero slider ────────────────────────────────────────────
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  let current  = 0, timer;

  function goToSlide(n) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goToSlide(current + 1), 5500);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { goToSlide(i); startTimer(); }));
  if (slides.length) { slides[0].classList.add('active'); dots[0]?.classList.add('active'); startTimer(); }

  // ── Contador animado (stats) ───────────────────────────────
  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const isFloat = el.dataset.float === 'true';
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;
    const t = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(t); }
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    }, step);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.animated) {
        e.target.dataset.animated = 'true';
        animateCount(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-target]').forEach(el => statsObserver.observe(el));

  // ── Filtros de motos ───────────────────────────────────────
  const filtros   = document.querySelectorAll('.filtro-btn');
  const motoCards = document.querySelectorAll('.moto-card[data-cat]');

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filtro;
      motoCards.forEach(card => {
        if (cat === 'todo' || card.dataset.cat === cat) {
          card.style.display = '';
          card.style.animation = 'fadeUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ── Comparar motos ─────────────────────────────────────────
  const compareBar   = document.querySelector('.compare-bar');
  const compareMotos = document.querySelector('.compare-motos');
  const compareCount = document.querySelector('.compare-count');
  let comparing = [];

  document.querySelectorAll('.btn-compare').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.moto-card');
      const name  = card.querySelector('.moto-nombre').textContent;
      const id    = card.dataset.id;

      if (comparing.find(m => m.id === id)) {
        comparing = comparing.filter(m => m.id !== id);
        btn.textContent = '+ Comparar';
        btn.classList.remove('added');
      } else if (comparing.length < 3) {
        comparing.push({ id, name });
        btn.textContent = '✓ Añadido';
        btn.classList.add('added');
      }
      updateCompareBar();
    });
  });

  function updateCompareBar() {
    if (comparing.length === 0) {
      compareBar?.classList.remove('visible');
      return;
    }
    compareBar?.classList.add('visible');
    if (compareCount) compareCount.textContent = comparing.length;
    if (compareMotos) {
      compareMotos.innerHTML = comparing.map(m =>
        `<div class="compare-moto-chip">
          ${m.name}
          <button onclick="removeCompare('${m.id}')">✕</button>
        </div>`
      ).join('');
    }
  }

  window.removeCompare = (id) => {
    const btn = document.querySelector(`.moto-card[data-id="${id}"] .btn-compare`);
    if (btn) { btn.textContent = '+ Comparar'; btn.classList.remove('added'); }
    comparing = comparing.filter(m => m.id !== id);
    updateCompareBar();
  };

  // ── Reveal on scroll ──────────────────────────────────────
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ── Formulario contacto ────────────────────────────────────
  const form = document.querySelector('.contacto-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = '✓ Mensaje enviado';
      btn.style.background = '#2bc710';
      setTimeout(() => { btn.textContent = 'Enviar Consulta'; btn.style.background = ''; form.reset(); }, 3200);
    });
  }

  // ── Smooth anchor links ────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
        nav?.classList.remove('open');
      }
    });
  });

});
