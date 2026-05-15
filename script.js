document.addEventListener('DOMContentLoaded', () => {

  // ── Hero entrance
  const heroEls = [
    document.querySelector('.hero-name'),
    document.querySelector('.hero-bio'),
    document.querySelector('.hero-tags'),
    document.querySelector('.cta'),
  ];
  heroEls.forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.7s ease ${i * 0.13}s, transform 0.7s ease ${i * 0.13}s`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
  document.querySelectorAll('.stat').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transition = `opacity 0.5s ease ${0.5 + i * 0.08}s`;
    requestAnimationFrame(() => { el.style.opacity = '1'; });
  });

  // ── Staggered scroll reveal for bento cards
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cards = [...entry.target.parentElement.querySelectorAll('.reveal')];
        const idx = cards.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  // ── Animated counters
  function animateCounter(el, target, isDecimal = false) {
    const duration = 1600;
    const start = performance.now();
    const run = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = ease * target;
      el.textContent = isDecimal ? val.toFixed(1) : Math.floor(val);
      if (progress < 1) requestAnimationFrame(run);
      else el.textContent = isDecimal ? target.toFixed(1) : target;
    };
    requestAnimationFrame(run);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const isDecimal = el.dataset.target.includes('.');
        animateCounter(el, target, isDecimal);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  // ── Animated competitor bars
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const w = bar.dataset.width;
        setTimeout(() => { bar.style.width = w + '%'; }, 200);
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.comp-bar').forEach(bar => {
    bar.style.width = '0';
    bar.style.transition = 'width 1s ease';
    barObserver.observe(bar);
  });

  // ── Terminal typing animation
  const terminalLines = [
    { el: 't-line1', text: 'echelon --init agent --client=[REDACTED] --clearance=ALPHA', delay: 0 },
    { el: 't-line4', text: 'echelon --load workflow-modules', delay: 1800, block: 't-block1' },
    { el: 't-line5', text: 'echelon --connect integrations --encrypt', delay: 3800, block: 't-block2' },
    { el: 't-line6', text: 'echelon --deploy --mode=silent --schedule=async', delay: 5800, block: 't-block3', progress: true },
  ];

  function typeText(elId, text, cb) {
    const el = document.getElementById(elId);
    if (!el) return;
    let i = 0;
    const iv = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(iv); if (cb) cb(); }
    }, 28);
  }

  let terminalTimerIv = null;
  let terminalTimeouts = [];

  function resetTerminal() {
    // Clear any running animations
    terminalTimeouts.forEach(clearTimeout);
    terminalTimeouts = [];
    clearInterval(terminalTimerIv);

    // Reset typed lines
    terminalLines.forEach(({ el, block }) => {
      const lineEl = document.getElementById(el);
      if (lineEl) lineEl.textContent = '';
      if (block) {
        const b = document.getElementById(block);
        if (b) b.classList.remove('t-visible');
      }
    });

    // Reset progress bar
    const p = document.getElementById('t-progress');
    if (p) p.style.width = '0%';
  }

  function runTerminal() {
    resetTerminal();

    terminalLines.forEach(({ el, text, delay, block, progress }) => {
      const t = setTimeout(() => {
        typeText(el, text, () => {
          if (block) {
            const b = document.getElementById(block);
            if (b) b.classList.add('t-visible');
          }
          if (progress) {
            const t2 = setTimeout(() => {
              const p = document.getElementById('t-progress');
              if (p) p.style.width = '73%';
            }, 400);
            terminalTimeouts.push(t2);
          }
        });
      }, delay);
      terminalTimeouts.push(t);
    });

    // Live countdown timer
    let secs = 47 * 3600 + 23 * 60 + 11;
    const timerEl = document.getElementById('deploy-timer');
    terminalTimerIv = setInterval(() => {
      if (!timerEl || secs <= 0) { clearInterval(terminalTimerIv); return; }
      secs--;
      const h = String(Math.floor(secs / 3600)).padStart(2, '0');
      const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      timerEl.textContent = `${h}:${m}:${s}`;
    }, 1000);
  }

  const terminalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runTerminal();
      } else {
        resetTerminal();
      }
    });
  }, { threshold: 0.3 });

  const terminal = document.querySelector('.terminal');
  if (terminal) terminalObserver.observe(terminal);

  // ── Hamburger toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('nav-open');
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Formspree AJAX
  const form = document.getElementById('inquire-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        status.textContent = res.ok
          ? '✓ INQUIRY RECEIVED — YOU WILL HEAR BACK WITHIN 48 HOURS.'
          : '✗ SUBMISSION FAILED. PLEASE EMAIL DIRECTLY.';
        if (res.ok) form.reset();
      } catch {
        status.textContent = '✗ NETWORK ERROR. PLEASE TRY AGAIN.';
      } finally {
        btn.textContent = 'Submit Inquiry →';
        btn.disabled = false;
      }
    });
  }

});
