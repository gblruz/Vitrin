/* =========================================================
   Vitrin — animações
   GSAP + ScrollTrigger (cdnjs) e Lenis (jsDelivr).
   Se as bibliotecas não carregarem, a página continua funcionando:
   o script.js mostra o conteúdo com uma entrada simples.
   ========================================================= */
(() => {
  const root = document.documentElement;
  const mq = (q) => window.matchMedia(q).matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const reduce = mq('(prefers-reduced-motion: reduce)');
  const fine = mq('(hover: hover) and (pointer: fine)'); // mouse de verdade (desktop)
  const small = mq('(max-width: 767px)');

  const EASE = 'expo.out';
  const DUR = small ? 0.7 : 1.1;
  const RISE = small ? 24 : 36;

  // Spotlight e borda iluminada não dependem do GSAP
  if (fine) initSpotlight();

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return; // fallback fica com o script.js

  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('anim');

  const lenis = reduce ? null : initLenis();
  initOdometer();
  window.VitrinAnim.lenis = lenis; // útil para depurar: VitrinAnim.lenis.scrollTo('#planos')
  initNav();
  const hasMarquee = initMarquee();
  initReveal(hasMarquee);
  initPlans();
  initGiants();
  initSteps();
  if (fine && !reduce) {
    initTilt();
    initMagnetic();
    initCursor();
  }

  document.addEventListener('vitrin:layout', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* ---------------------------------------------------------
     Rolagem suave (Lenis) integrada ao ScrollTrigger
     --------------------------------------------------------- */
  function initLenis() {
    if (!window.Lenis) return null;
    const l = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    l.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => l.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Links internos (#planos etc.) também rolam suave
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.classList.contains('skip-link')) return;
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      l.scrollTo(target, { offset: -90 });
    });
    return l;
  }

  /* ---------------------------------------------------------
     Entrada ao rolar: fade + subida + blur saindo, em sequência
     --------------------------------------------------------- */
  function fromState() {
    if (reduce) return { opacity: 0 };
    return small ? { opacity: 0, y: RISE } : { opacity: 0, y: RISE, filter: 'blur(10px)' };
  }
  function toState(extra) {
    const base = reduce
      ? { opacity: 1, duration: 0.4, ease: 'power1.out' }
      : { opacity: 1, y: 0, duration: DUR, ease: EASE };
    if (!reduce && !small) base.filter = 'blur(0px)';
    return { ...base, clearProps: 'transform,filter', overwrite: true, ...extra };
  }
  const markVisible = (els) => els.forEach((el) => el.classList.add('is-visible'));

  function initReveal(hasMarquee) {
    const desktopPlans = mq('(min-width: 960px)');
    const items = $$('.reveal').filter(
      (el) =>
        !el.classList.contains('giant') &&
        !(hasMarquee && el.closest('.chips')) &&
        !(desktopPlans && el.classList.contains('plan'))
    );
    gsap.set(items, fromState());
    ScrollTrigger.batch(items, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, toState({ stagger: 0.1, onComplete: () => markVisible(batch) })),
    });
  }

  /* ---------------------------------------------------------
     Planos: cards em sequência, o recomendado por último com scale
     --------------------------------------------------------- */
  function initPlans() {
    if (!mq('(min-width: 960px)')) return; // no celular, cada card entra ao rolar
    const grid = $('#plans-grid');
    const cards = $$('.plan', grid);
    if (!cards.length) return;
    const featured = cards.find((c) => c.classList.contains('plan--featured')) || cards[1];
    const others = cards.filter((c) => c !== featured);

    gsap.set(cards, fromState());
    if (!reduce) gsap.set(featured, { scale: 0.95 });

    ScrollTrigger.create({
      trigger: grid,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap
          .timeline({ onComplete: () => markVisible(cards) })
          .to(others, toState({ stagger: 0.12 }))
          .to(featured, toState(reduce ? {} : { scale: 1, duration: 1.2 }), reduce ? '<' : '-=0.7');
      },
    });
  }

  /* ---------------------------------------------------------
     Títulos gigantes: letter-spacing fechando + parallax
     --------------------------------------------------------- */
  function initGiants() {
    $$('.giant').forEach((g) => {
      const section = g.closest('section');
      if (reduce) {
        gsap.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.5, scrollTrigger: { trigger: g, start: 'top 90%', once: true } });
        return;
      }
      gsap.fromTo(
        g,
        { opacity: 0, letterSpacing: '0.03em' },
        { opacity: 1, letterSpacing: '-0.05em', duration: small ? 1 : 1.6, ease: EASE, scrollTrigger: { trigger: g, start: 'top 88%', once: true } }
      );
      // O título se move mais devagar que os cards: desce um pouco enquanto a página sobe.
      // No celular fica parado, senão desceria para trás dos cards.
      if (small) return;
      gsap.fromTo(
        g,
        { y: -30 },
        { y: 30, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    });
  }

  /* ---------------------------------------------------------
     Como funciona: linha 01→04 desenhada pelo scroll
     --------------------------------------------------------- */
  function initSteps() {
    const ol = $('.grid--steps');
    if (!ol) return;
    const nums = $$('.step__num', ol);
    if (nums.length < 2) return;

    const wrap = document.createElement('div');
    wrap.className = 'steps-lines';
    wrap.setAttribute('aria-hidden', 'true');
    const segs = nums.slice(1).map(() => {
      const s = document.createElement('span');
      s.className = 'steps-line';
      wrap.appendChild(s);
      return s;
    });
    ol.after(wrap);

    // posição relativa ao <ol>, ignorando transforms (cards ainda entrando)
    const pos = (el) => {
      let x = 0, y = 0, n = el;
      while (n && n !== ol) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    };

    let horizontal = false;
    const layout = () => {
      wrap.style.left = `${ol.offsetLeft}px`;
      wrap.style.top = `${ol.offsetTop}px`;
      const p = nums.map(pos);
      // A linha só aparece quando os 4 passos estão lado a lado (desktop)
      horizontal = p.every((q) => Math.abs(q.y - p[0].y) < 2);
      segs.forEach((s, i) => {
        s.style.display = horizontal ? '' : 'none';
        if (!horizontal) return;
        const a = p[i], b = p[i + 1];
        const x1 = a.x + a.w + 10;
        s.style.left = `${x1}px`;
        s.style.top = `${a.y + a.h / 2}px`;
        s.style.width = `${Math.max(0, b.x - 10 - x1)}px`;
      });
    };
    layout();
    ScrollTrigger.addEventListener('refreshInit', layout);

    if (reduce) {
      gsap.set(segs, { scaleX: 1 });
      nums.forEach((n) => n.classList.add('is-lit'));
      return;
    }

    const light = (p) =>
      nums.forEach((n, i) => n.classList.toggle('is-lit', p >= (i === 0 ? 0.001 : i / segs.length - 0.001)));

    const tl = gsap.timeline({
      scrollTrigger: { trigger: ol, start: 'top 72%', end: 'top 22%', scrub: 0.8 },
      onUpdate: () => { if (horizontal) light(tl.progress()); },
    });
    segs.forEach((s) => tl.to(s, { scaleX: 1, ease: 'none', duration: 1 }));

    // Sem linha (celular/tablet): cada número acende quando o card chega
    nums.forEach((n) =>
      ScrollTrigger.create({
        trigger: n,
        start: 'top 70%',
        onEnter: () => { if (!horizontal) n.classList.add('is-lit'); },
        onLeaveBack: () => { if (!horizontal) n.classList.remove('is-lit'); },
      })
    );
  }

  /* ---------------------------------------------------------
     Para quem é: marquee infinito em duas linhas
     --------------------------------------------------------- */
  function initMarquee() {
    const list = $('.chips');
    if (!list || reduce) return false;

    const chips = $$('li', list).map((li) => ({ text: li.textContent.trim(), muted: li.classList.contains('chip--muted') }));
    const marquee = document.createElement('div');
    marquee.className = 'marquee';
    marquee.setAttribute('aria-hidden', 'true'); // a lista original continua para leitores de tela

    const rows = [chips, [...chips].reverse()].map((row, r) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'marquee__row reveal';
      const track = document.createElement('div');
      track.className = 'marquee__track';
      const group = `<div class="marquee__group">${row
        .map((c) => `<span class="chip${c.muted ? ' chip--muted' : ''}">${c.text}</span>`)
        .join('')}</div>`;
      track.innerHTML = group.repeat(4);
      rowEl.appendChild(track);
      marquee.appendChild(rowEl);
      return { rowEl, track, reverse: r === 1, tween: null };
    });

    list.classList.add('sr-only');
    list.after(marquee);

    const build = (row) => {
      const w = row.track.firstElementChild.offsetWidth;
      const progress = row.tween ? row.tween.progress() : 0;
      if (row.tween) row.tween.kill();
      row.tween = gsap.fromTo(
        row.track,
        { x: row.reverse ? -w : 0 },
        { x: row.reverse ? 0 : -w, duration: w / 38, ease: 'none', repeat: -1 }
      );
      row.tween.progress(progress);
    };
    rows.forEach((row) => {
      build(row);
      if (fine) {
        row.rowEl.addEventListener('mouseenter', () => gsap.to(row.tween, { timeScale: 0.18, duration: 0.7, ease: 'power2.out' }));
        row.rowEl.addEventListener('mouseleave', () => gsap.to(row.tween, { timeScale: 1, duration: 0.7, ease: 'power2.in' }));
      }
    });

    let t;
    const rebuild = () => { clearTimeout(t); t = setTimeout(() => rows.forEach(build), 150); };
    window.addEventListener('resize', rebuild);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => rows.forEach(build));

    // Pausa quando está fora da tela (economiza bateria)
    ScrollTrigger.create({
      trigger: marquee,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => rows.forEach((row) => (self.isActive ? row.tween.resume() : row.tween.pause())),
    });
    return true;
  }

  /* ---------------------------------------------------------
     Navegação: encolhe ao rolar + indicador do link ativo
     --------------------------------------------------------- */
  function initNav() {
    const nav = $('#nav');
    const ind = $('.nav__indicator', nav);
    if (!nav) return;

    ScrollTrigger.create({
      start: 40,
      end: 'max',
      onToggle: (self) => nav.classList.toggle('is-scrolled', self.isActive),
    });

    let current = ($('[data-nav-link][aria-current="true"]', nav) || {}).dataset?.navLink || 'inicio';
    const move = (instant) => {
      const link = $(`[data-nav-link="${current}"]`, nav);
      if (!link || !link.offsetWidth) return gsap.set(ind, { opacity: 0 });
      const props = { x: link.offsetLeft, y: link.offsetTop, width: link.offsetWidth, height: link.offsetHeight, opacity: 1 };
      if (instant || reduce) gsap.set(ind, props);
      else gsap.to(ind, { ...props, duration: 0.6, ease: EASE, overwrite: true });
    };
    move(true);
    document.addEventListener('vitrin:nav', (e) => { current = e.detail; move(false); });
    window.addEventListener('resize', () => move(true));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => move(true));
  }

  /* ---------------------------------------------------------
     Planos: preços estilo odômetro
     --------------------------------------------------------- */
  function initOdometer() {
    const widths = {};
    const measure = () => {
      const probe = $('.price__value');
      if (!probe) return;
      const fs = parseFloat(getComputedStyle(probe).fontSize);
      const s = document.createElement('span');
      s.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
      probe.appendChild(s);
      for (let d = 0; d < 10; d++) {
        s.textContent = String(d);
        widths[d] = s.getBoundingClientRect().width / fs; // em em, acompanha o clamp()
      }
      s.remove();
    };
    const COL = '0123456789'.split('').map((n) => `<span>${n}</span>`).join('');

    const render = (el, text, animate) => {
      if (widths[0] === undefined) measure();
      const prev = el._digits || [];
      const chars = [...text];
      const count = chars.filter((c) => /\d/.test(c)).length;
      const digits = [];
      let di = 0;
      let html = `<span class="sr-only">${text}</span><span class="odo" aria-hidden="true">`;
      chars.forEach((c) => {
        if (!/\d/.test(c)) { html += `<span class="odo__char">${c}</span>`; return; }
        const d = Number(c);
        const fromRight = count - 1 - di;
        const old = prev[prev.length - 1 - fromRight];
        const start = animate ? (old === undefined ? 0 : old) : d;
        html += `<span class="odo__digit" style="width:${(widths[d] || 0.62).toFixed(4)}em"><span class="odo__col" data-to="${d}" style="--i:${di};transform:translateY(${-start * 1.1}em)">${COL}</span></span>`;
        digits.push(d);
        di++;
      });
      el.innerHTML = `${html}</span>`;
      el._digits = digits;
      if (animate) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            $$('.odo__col', el).forEach((col) => (col.style.transform = `translateY(${-col.dataset.to * 1.1}em)`))
          )
        );
      }
    };

    window.VitrinAnim = { odometer: (el, text) => render(el, text, !reduce) };

    const init = () => {
      measure();
      $$('.price__amount').forEach((el) => render(el, el.textContent.trim(), false));
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
    else init();
  }

  /* ---------------------------------------------------------
     Desktop: spotlight, tilt 3D, botões magnéticos e cursor
     --------------------------------------------------------- */
  function initSpotlight() {
    document.addEventListener(
      'pointermove',
      (e) => {
        const card = e.target.closest && e.target.closest('.glass');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - r.left}px`);
        card.style.setProperty('--y', `${e.clientY - r.top}px`);
      },
      { passive: true }
    );
  }

  function initTilt() {
    const hero = $('.hero');
    const phone = $('.hero__mockups') || $('.phone'); // inclina o conjunto celular + navegador
    if (!hero || !phone) return;
    const MAX = 8;
    const rx = gsap.quickTo(phone, 'rotationX', { duration: 0.9, ease: 'power3.out' });
    const ry = gsap.quickTo(phone, 'rotationY', { duration: 0.9, ease: 'power3.out' });
    hero.addEventListener('pointermove', (e) => {
      const r = phone.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      ry(gsap.utils.clamp(-MAX, MAX, nx * MAX));
      rx(gsap.utils.clamp(-MAX, MAX, -ny * MAX));
    });
    hero.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  function initMagnetic() {
    const els = $$('.hero__actions .btn, .nav__cta, .plan__cta, .cta .btn');
    const items = els.map((el) => ({ el, active: false }));
    const RANGE = 36, MAX = 6;
    let raf = 0, ev = null;

    const tick = () => {
      raf = 0;
      items.forEach((it) => {
        const r = it.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const near =
          ev.clientX > r.left - RANGE && ev.clientX < r.right + RANGE &&
          ev.clientY > r.top - RANGE && ev.clientY < r.bottom + RANGE;
        if (near) {
          const dx = ev.clientX - (r.left + r.width / 2);
          const dy = ev.clientY - (r.top + r.height / 2);
          gsap.to(it.el, {
            x: gsap.utils.clamp(-MAX, MAX, dx * 0.15),
            y: gsap.utils.clamp(-MAX, MAX, dy * 0.3),
            duration: 0.4,
            ease: 'power3.out',
            overwrite: 'auto',
          });
          it.active = true;
        } else if (it.active) {
          it.active = false;
          gsap.to(it.el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
        }
      });
    };
    window.addEventListener('pointermove', (e) => { ev = e; if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  }

  function initCursor() {
    const c = document.createElement('div');
    c.className = 'cursor';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="cursor__dot"></span>';
    document.body.appendChild(c);
    root.classList.add('has-cursor');

    const xTo = gsap.quickTo(c, 'x', { duration: 0.18, ease: 'power3.out' });
    const yTo = gsap.quickTo(c, 'y', { duration: 0.18, ease: 'power3.out' });
    let first = true;

    window.addEventListener(
      'pointermove',
      (e) => {
        if (first) { gsap.set(c, { x: e.clientX, y: e.clientY }); first = false; }
        xTo(e.clientX);
        yTo(e.clientY);
        c.classList.add('is-active');
        const t = e.target.closest && e.target.closest('a, button, [role="button"]');
        c.classList.toggle('is-hover', !!t);
      },
      { passive: true }
    );
    document.documentElement.addEventListener('mouseleave', () => c.classList.remove('is-active'));
    window.addEventListener('pointerdown', () => c.classList.add('is-down'));
    window.addEventListener('pointerup', () => c.classList.remove('is-down'));
  }
})();
