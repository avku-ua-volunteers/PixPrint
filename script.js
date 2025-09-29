// Убираем no-js класс
document.documentElement.classList.remove('no-js');

/* ---------- Helpers ---------- */
function safeLSGet(key){
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function safeLSSet(key, val){
  try { window.localStorage.setItem(key, val); } catch {}
}

/* ---------- Год в футере ---------- */
(function setYear() {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- Sticky offset (точный отступ для якорей) ---------- */
(function setStickyOffset(){
  const header = document.querySelector('header');
  const set = () => {
    if (!header) return;
    const px = Math.round(header.offsetHeight + 12);
    document.documentElement.style.setProperty('--sticky-offset', px + 'px');
  };
  set();
  window.addEventListener('resize', set, { passive: true });
})();

/* ---------- Кнопки действий ---------- */
(function initActions(){
  const printBtn = document.querySelector('[data-action="print"]');
  printBtn && printBtn.addEventListener('click', () => window.print());

  document.querySelectorAll('[data-action="goto"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (target) {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', target);
      }
    });
  });
})();

/* ---------- Навигация: стрелки, градиенты, hint, bottom-sheet, scroll-spy ---------- */
(function initNav() {
  const wrap = document.querySelector('.nav-viewport');
  const nav = document.getElementById('topnav');
  const sheet = document.getElementById('navSheet');
  const hint = document.getElementById('navHint');

  if (!wrap || !nav) return;

  const left = wrap.querySelector('.nav-arrow.left');
  const right = wrap.querySelector('.nav-arrow.right');
  const fadeL = wrap.querySelector('.nav-fade.left');
  const fadeR = wrap.querySelector('.nav-fade.right');
  const moreBtn = document.querySelector('.nav-more');

  // Показ/скрытие стрелок и градиентов
  function updateOverflowUI() {
    const canScroll = nav.scrollWidth > nav.clientWidth + 2;
    const atStart = nav.scrollLeft <= 2;
    const atEnd = nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 2;

    [left, right, fadeL, fadeR].forEach(el => el && (el.hidden = !canScroll));
    if (!canScroll) return;

    if (fadeL) fadeL.style.opacity = atStart ? '0' : '1';
    if (fadeR) fadeR.style.opacity = atEnd ? '0' : '1';
    if (left) left.style.opacity = atStart ? '.3' : '1';
    if (right) right.style.opacity = atEnd ? '.3' : '1';
  }

  ['load', 'resize'].forEach(e => window.addEventListener(e, updateOverflowUI));
  nav.addEventListener('scroll', updateOverflowUI, { passive: true });

  // Стрелки
  left && left.addEventListener('click', () => {
    nav.scrollBy({ left: -nav.clientWidth * 0.7, behavior: 'smooth' });
  });
  right && right.addEventListener('click', () => {
    nav.scrollBy({ left: nav.clientWidth * 0.7, behavior: 'smooth' });
  });

  // Bottom-sheet «Усі розділи»
  if (moreBtn && sheet) {
    moreBtn.addEventListener('click', () => {
      if (typeof sheet.showModal === 'function') {
        sheet.showModal();
      } else {
        sheet.setAttribute('open', '');
      }
    });

    sheet.addEventListener('click', (e) => {
      if (e.target === sheet) {
        sheet.close ? sheet.close() : sheet.removeAttribute('open');
      }
    });

    sheet.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (sheet.close) sheet.close(); else sheet.removeAttribute('open');
      });
    });
  }

  // Хинт: показать один раз (безопасный localStorage)
  if (hint) {
    const shown = safeLSGet('navHintShown');
    if (shown) {
      hint.remove();
    } else {
      const dismiss = () => {
        hint.remove();
        safeLSSet('navHintShown', '1');
      };
      setTimeout(dismiss, 2500);
      nav.addEventListener('scroll', dismiss, { once: true });
    }
  }

  // Scroll-spy (подсветка активного раздела)
  const links = Array.from(nav.querySelectorAll('a'));
  function setActive(href) {
    links.forEach(a => {
      const match = a.getAttribute('href') === href;
      a.classList.toggle('active', match);
      if (match) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((ents) => {
      ents.forEach(ent => {
        if (ent.isIntersecting) {
          const href = '#' + ent.target.id;
          setActive(href);
        }
      });
    }, { rootMargin: '-60% 0px -35% 0px', threshold: 0.01 });

    document.querySelectorAll('main section[id]').forEach(sec => obs.observe(sec));
  } else {
    const setByHash = () => setActive(location.hash || '#docs');
    setByHash();
    window.addEventListener('hashchange', setByHash);
  }

  // Инициализация
  updateOverflowUI();
})();
