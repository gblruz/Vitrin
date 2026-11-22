/* =========================================================
   Vitrin — CONFIG
   Edite aqui contatos, preços, itens dos planos e dúvidas.
   ========================================================= */
const CONFIG = {
  brand: 'Vitrin',
  tagline: 'Sua vitrine na internet, pronta em poucos dias.',
  area: 'Atendemos todo o Brasil',

  // WhatsApp: só números, com 55 + DDD + número
  whatsapp: '5535984733354',
  whatsappDisplay: '(35) 9 8473-3354',
  instagram: 'vitrinlnpage', // sem @
  email: 'vitrinlnpage@gmail.com',

  // Mensagens pré-preenchidas do WhatsApp
  messages: {
    default: 'Olá! Vim pelo site da Vitrin e quero minha página.',
    plan: (planName, modeLabel) =>
      `Olá! Vim pelo site da Vitrin e tenho interesse no plano ${planName} (${modeLabel}).`,
  },

  // Planos (a ordem aqui é a ordem no computador; no celular o "featured" aparece primeiro)
  plans: [
    {
      id: 'essencial',
      name: 'Essencial',
      tagline: 'Para sair só do Instagram',
      cash: 247,
      installments: { count: 2, value: 123.5 },
      features: [
        'Modelo pronto adaptado às suas cores e logo',
        'Seus serviços e contatos',
        'Botão de WhatsApp e Instagram',
        '1 rodada de ajustes',
        'Entrega em até 3 dias úteis',
      ],
      cta: 'Começar com o Essencial',
    },
    {
      id: 'profissional',
      name: 'Profissional',
      tagline: 'Para passar mais confiança',
      featured: true,
      badge: 'Recomendado', // troque por 'Mais escolhido' quando isso for verdade
      cash: 447,
      installments: { count: 3, value: 149 },
      features: [
        'Design personalizado',
        'Tudo do Essencial',
        'Galeria de trabalhos, mapa, horários e tabela de serviços',
        'Otimização para aparecer no Google',
        'Textos escritos por nós',
        '2 rodadas de ajustes',
        'Entrega em até 5 dias úteis',
      ],
      cta: 'Quero o Profissional',
    },
    {
      id: 'completo',
      name: 'Completo',
      tagline: 'Para quem quer tudo pronto',
      cash: 697,
      installments: { count: 4, value: 174.25 },
      features: [
        'Tudo do Profissional',
        'Link de agendamento online',
        'Seção de depoimentos',
        'Configuração do seu perfil no Google (Google Meu Negócio)',
        'Domínio .com.br incluso no 1º ano',
        '3 rodadas de ajustes + 15 dias de suporte',
        'Entrega em até 7 dias úteis',
      ],
      cta: 'Quero o Completo',
    },
  ],

  plansNote:
    'Manutenção opcional: R$ 29/mês (hospedagem, domínio a partir do 2º ano e pequenas alterações como preços, fotos e horários). Pagamento via Pix ou cartão.',

  faq: [
    {
      q: 'Preciso ter um domínio?',
      a: 'No plano Completo, o 1º ano do domínio .com.br já está incluso. Nos outros planos, a gente te ajuda a registrar, com o custo à parte.',
    },
    {
      q: 'Quanto tempo demora?',
      a: 'De 3 a 7 dias úteis, conforme o plano, depois que você envia o material.',
    },
    {
      q: 'Tem mensalidade?',
      a: 'A manutenção é opcional: R$ 29/mês. Ela cobre hospedagem, domínio a partir do 2º ano e pequenas alterações, como preços, fotos e horários.',
    },
    {
      q: 'Posso pedir alterações depois?',
      a: 'Sim. Com a manutenção opcional (R$ 29/mês), pequenas alterações como preços, fotos e horários estão incluídas.',
    },
    {
      q: 'Preciso entender de computador?',
      a: 'Não. A gente cuida de tudo. Você só manda as informações pelo WhatsApp.',
    },
    {
      q: 'Como funciona o pagamento?',
      a: 'Via Pix ou cartão. Você pode pagar à vista ou parcelado: 2x no Essencial, 3x no Profissional e 4x no Completo.',
    },
  ],
};

/* =========================================================
   Utilidades
   ========================================================= */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const waLink = (message) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;

const brl = (value) => {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CHECK_ICON =
  '<span class="check" aria-hidden="true"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>';

const MODES = {
  cash: { label: 'à vista', status: 'Mostrando preços à vista' },
  installments: { label: 'parcelado', status: 'Mostrando preços parcelados' },
};
let mode = 'cash';

/* =========================================================
   Contatos e links do WhatsApp
   ========================================================= */
function fillContacts() {
  $$('[data-wa="default"]').forEach((a) => (a.href = waLink(CONFIG.messages.default)));

  const values = {
    tagline: CONFIG.tagline,
    area: CONFIG.area,
    whatsappDisplay: CONFIG.whatsappDisplay,
    instagramDisplay: '@' + CONFIG.instagram,
    email: CONFIG.email,
    fromPrice: 'R$ ' + brl(Math.min(...CONFIG.plans.map((p) => p.cash))),
  };
  $$('[data-config]').forEach((el) => {
    const v = values[el.dataset.config];
    if (v) el.textContent = v;
  });
  $$('[data-config-href="instagram"]').forEach((a) => (a.href = `https://instagram.com/${CONFIG.instagram}`));
  $$('[data-config-href="email"]').forEach((a) => (a.href = `mailto:${CONFIG.email}`));

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
}

/* =========================================================
   Planos
   ========================================================= */
function priceHtml(plan) {
  const n = plan.installments.count;
  if (mode === 'cash') {
    return {
      label: 'À vista',
      amount: brl(plan.cash),
      alt: `ou ${n}x de R$ ${brl(plan.installments.value)}`,
    };
  }
  return {
    label: `Em ${n}x de`,
    amount: brl(plan.installments.value),
    alt: `ou R$ ${brl(plan.cash)} à vista`,
  };
}

function renderPlans() {
  const grid = $('#plans-grid');
  if (!grid) return;

  grid.innerHTML = CONFIG.plans
    .map((plan) => {
      const p = priceHtml(plan);
      return `
      <article class="plan glass reveal${plan.featured ? ' plan--featured' : ''}" aria-labelledby="plan-${plan.id}" data-plan="${plan.id}">
        <div class="plan__head">
          <h3 class="plan__name" id="plan-${plan.id}">${escapeHtml(plan.name)}</h3>
          ${plan.featured ? `<span class="plan__badge">${escapeHtml(plan.badge || 'Mais escolhido')}</span>` : ''}
        </div>
        <div class="price">
          <span class="price__label">${p.label}</span>
          <span class="price__value"><small>R$</small><span class="price__amount">${p.amount}</span></span>
          <span class="price__alt">${p.alt}</span>
        </div>
        <p class="plan__tagline">${escapeHtml(plan.tagline)}</p>
        <ul class="plan__features">
          ${plan.features.map((f) => `<li>${CHECK_ICON}<span>${escapeHtml(f)}</span></li>`).join('')}
        </ul>
        <a class="btn btn--block plan__cta ${plan.featured ? 'btn--primary' : 'btn--ghost'}" target="_blank" rel="noopener" href="${waLink(CONFIG.messages.plan(plan.name, MODES[mode].label))}">${escapeHtml(plan.cta)}</a>
      </article>`;
    })
    .join('');

  const note = $('#plans-note');
  if (note) note.textContent = CONFIG.plansNote;
}

function updatePrices() {
  // O animations.js registra window.VitrinAnim.odometer (números rolando).
  const odometer = window.VitrinAnim && window.VitrinAnim.odometer;

  CONFIG.plans.forEach((plan) => {
    const card = $(`[data-plan="${plan.id}"]`);
    if (!card) return;
    const box = $('.price', card);
    const cta = $('.plan__cta', card);
    const p = priceHtml(plan);
    cta.href = waLink(CONFIG.messages.plan(plan.name, MODES[mode].label));

    const swapTexts = () => {
      $('.price__label', box).textContent = p.label;
      $('.price__alt', box).textContent = p.alt;
    };

    if (odometer) {
      const fades = [$('.price__label', box), $('.price__alt', box)];
      fades.forEach((el) => el.classList.add('is-out'));
      odometer($('.price__amount', box), p.amount);
      setTimeout(() => {
        swapTexts();
        fades.forEach((el) => el.classList.remove('is-out'));
      }, 220);
      return;
    }

    const apply = () => {
      swapTexts();
      $('.price__amount', box).textContent = p.amount;
    };
    if (reduceMotion) return apply();
    box.classList.add('is-switching');
    setTimeout(() => {
      apply();
      box.classList.remove('is-switching');
    }, 200);
  });
  const status = $('#plans-status');
  if (status) status.textContent = MODES[mode].status;
}

function initToggle() {
  const toggle = $('.toggle');
  if (!toggle) return;
  const thumb = $('.toggle__thumb', toggle);
  const buttons = $$('.toggle__btn', toggle);

  const moveThumb = () => {
    const active = buttons.find((b) => b.dataset.mode === mode);
    if (!active) return;
    thumb.style.setProperty('--w', `${active.offsetWidth}px`);
    thumb.style.setProperty('--x', `${active.offsetLeft}px`);
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.mode === mode) return;
      mode = btn.dataset.mode;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      moveThumb();
      updatePrices();
    });
  });

  moveThumb();
  window.addEventListener('resize', moveThumb);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveThumb);
}

/* =========================================================
   FAQ (accordion acessível)
   ========================================================= */
function renderFaq() {
  const list = $('#faq-list');
  if (!list) return;

  list.innerHTML = CONFIG.faq
    .map(
      (item, i) => `
      <div class="faq__item glass reveal">
        <h3>
          <button class="faq__q" type="button" id="faq-q-${i}" aria-expanded="false" aria-controls="faq-a-${i}">
            <span>${escapeHtml(item.q)}</span>
            <span class="faq__icon" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="faq__a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}">
          <div><p>${escapeHtml(item.a)}</p></div>
        </div>
      </div>`
    )
    .join('');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq__q');
    if (!btn) return;
    const item = btn.closest('.faq__item');
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    item.classList.toggle('is-open', !open);
    // avisa o animations.js que a altura da página mudou
    setTimeout(() => document.dispatchEvent(new CustomEvent('vitrin:layout')), 450);
  });
}

/* =========================================================
   Navegação: menu mobile + link ativo
   ========================================================= */
function initNav() {
  const nav = $('#nav');
  const btn = $('.nav__menu-btn', nav);
  const panel = $('#nav-panel');

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  $$('a', panel).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      btn.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
  });

  // Link ativo conforme a seção visível
  const links = $$('[data-nav-link]');
  const setActive = (key) => {
    links.forEach((l) => {
      if (l.dataset.navLink === key) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
    document.dispatchEvent(new CustomEvent('vitrin:nav', { detail: key }));
  };
  setActive('inicio');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.dataset.nav);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    $$('section[data-nav]').forEach((s) => io.observe(s));
  }
}

/* =========================================================
   Entrada simples (fallback)
   Só roda se o animations.js/GSAP não carregar (ex.: CDN fora do ar).
   ========================================================= */
function initReveal() {
  if (document.documentElement.classList.contains('anim')) return;
  $$('[data-stagger]').forEach((group) => {
    $$(':scope > .reveal', group).forEach((el, i) => el.style.setProperty('--d', `${Math.min(i, 6) * 80}ms`));
  });

  const items = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
}

/* =========================================================
   Tema escuro / claro
   O <head> já aplicou o tema salvo; aqui fica só o botão.
   ========================================================= */
function initTheme() {
  const btn = $('#theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  let timer;

  const apply = (theme, animate) => {
    if (animate && !reduceMotion) {
      root.classList.add('theme-anim');
      clearTimeout(timer);
      timer = setTimeout(() => root.classList.remove('theme-anim'), 500);
    }
    root.setAttribute('data-theme', theme);
    const next = theme === 'dark' ? 'claro' : 'escuro';
    $('.theme-toggle__text', btn).textContent = `Modo ${next}`;
    $('.theme-toggle__tip', btn).textContent = `Mudar a aparência do site para o modo ${next}`;
    btn.setAttribute('aria-label', `Mudar para o modo ${next}`);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#050507' : '#faf9ff');
  };

  apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);

  btn.addEventListener('click', () => {
    const theme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    apply(theme, true);
    try { localStorage.setItem('vitrin-theme', theme); } catch (e) { /* modo privado: só não salva */ }
  });
}

/* =========================================================
   Início
   ========================================================= */
initTheme();
fillContacts();
renderPlans();
renderFaq();
initToggle();
initNav();
// Os scripts com "defer" já rodaram quando "load" dispara; se o GSAP não veio, usa o fallback.
window.addEventListener('load', initReveal);
