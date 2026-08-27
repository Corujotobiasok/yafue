// ============ PRELOADER ============
(function () {
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloaderFill');
  if (!preloader) return;

  document.body.style.overflow = 'hidden';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let progress = 0;

  function hide() {
    document.body.style.overflow = '';
    preloader.classList.add('is-hidden');
    setTimeout(() => preloader.remove(), 650);
  }

  if (reduceMotion) {
    fill.style.width = '100%';
    hide();
    return;
  }

  const ticker = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 90) {
      progress = 90;
      clearInterval(ticker);
    }
    fill.style.width = progress + '%';
  }, 140);

  window.addEventListener('load', () => {
    clearInterval(ticker);
    fill.style.width = '100%';
    setTimeout(hide, 350);
  });

  // Failsafe: never block the site for more than a few seconds.
  setTimeout(() => {
    clearInterval(ticker);
    fill.style.width = '100%';
    hide();
  }, 4000);
})();

// ============ NAV SCROLL STATE ============
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ============ MOBILE MENU ============
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ============ CRUMB CURSOR (desktop only) ============
const crumbCursor = document.getElementById('crumbCursor');
if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    crumbCursor.style.opacity = '1';
    crumbCursor.style.left = e.clientX + 'px';
    crumbCursor.style.top = e.clientY + 'px';
  });
  window.addEventListener('mouseleave', () => {
    crumbCursor.style.opacity = '0';
  });
}

// ============ HERO PRODUCT TILT ON MOUSE ============
const heroProduct = document.getElementById('heroProduct');
const heroImg = document.getElementById('heroImg');
if (window.matchMedia('(pointer: fine)').matches && heroProduct) {
  heroProduct.addEventListener('mousemove', (e) => {
    const rect = heroProduct.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroImg.style.transform = `rotate(${x * 10}deg) translateY(${y * -10}px)`;
  });
  heroProduct.addEventListener('mouseleave', () => {
    heroImg.style.transform = '';
  });
}

// ============ CONVERSATIONAL WHOLESALE FORM ============
const form = document.getElementById('wholesaleForm');
const steps = Array.from(form.querySelectorAll('.form-step'));
const progressBar = document.getElementById('progressBar');
let currentStep = 0;
const answers = {};

function goToStep(index) {
  steps[currentStep].classList.remove('active');
  currentStep = index;
  steps[currentStep].classList.add('active');
  progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;

  if (currentStep === steps.length - 1) {
    const doneName = document.getElementById('doneName');
    doneName.textContent = (answers.nombre || 'CRACK').toUpperCase();
  }
}

// text-input steps: advance on "Siguiente"
form.querySelectorAll('.step-next').forEach(btn => {
  btn.addEventListener('click', () => {
    const stepEl = btn.closest('.form-step');
    const input = stepEl.querySelector('input');
    if (input && !input.value.trim()) {
      input.focus();
      input.style.borderColor = 'var(--red)';
      return;
    }
    if (input) answers[input.name] = input.value.trim();
    goToStep(currentStep + 1);
  });
});

// choice-button steps: advance immediately on click
form.querySelectorAll('.choice-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.form-step').querySelectorAll('.choice-btn');
    group.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    answers[btn.dataset.field] = btn.textContent.trim();
    setTimeout(() => goToStep(currentStep + 1), 220);
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = '✅ ¡Listo, te escribimos pronto!';
  submitBtn.disabled = true;
  // Datos recolectados en `answers` — conectar a un backend/CRM real aquí.
  console.log('Nuevo lead mayorista YA FUE:', answers);
});

// ============ MAPA DE ARGENTINA INTERACTIVO ============
const mapVisual = document.getElementById('mapVisual');
const mapTooltip = document.getElementById('mapTooltip');
const provinceList = document.getElementById('provinceList');

const provinceNames = {
  'AR-B': 'Buenos Aires (AMBA y provincia)',
  'AR-C': 'Ciudad de Buenos Aires',
  'AR-E': 'Entre Ríos',
  'AR-S': 'Santa Fe',
  'AR-K': 'Catamarca',
  'AR-R': 'Río Negro',
  'AR-T': 'Tucumán',
  'AR-X': 'Córdoba',
  'AR-U': 'Chubut',
};
const activeCodes = new Set(Object.keys(provinceNames));

function showTooltip(code, name, clientX, clientY) {
  if (!mapVisual) return;
  const rect = mapVisual.getBoundingClientRect();
  const isActive = activeCodes.has(code);
  mapTooltip.innerHTML = `${name}<span class="tt-status">${isActive ? '✅ Ya vendemos acá' : '🔜 Próximamente'}</span>`;
  mapTooltip.style.left = `${clientX - rect.left}px`;
  mapTooltip.style.top = `${clientY - rect.top}px`;
  mapTooltip.classList.add('visible');
}
function hideTooltip() {
  mapTooltip.classList.remove('visible');
}
function setHoveredState(code, on) {
  const el = document.getElementById(code);
  const pin = document.querySelector(`.pin[data-code="${code}"]`);
  const li = provinceList ? provinceList.querySelector(`li[data-code="${code}"]`) : null;
  if (el) el.classList.toggle('hovered', on);
  if (pin) pin.classList.toggle('hovered', on);
  if (li) li.classList.toggle('hovered', on);
}

if (mapVisual) {
  const provinces = mapVisual.querySelectorAll('.province');
  const pins = mapVisual.querySelectorAll('.pin');

  provinces.forEach(el => {
    const code = el.id;
    const name = el.dataset.name;
    el.addEventListener('mouseenter', (e) => { setHoveredState(code, true); showTooltip(code, name, e.clientX, e.clientY); });
    el.addEventListener('mousemove', (e) => { showTooltip(code, name, e.clientX, e.clientY); });
    el.addEventListener('mouseleave', () => { setHoveredState(code, false); hideTooltip(); });
  });

  pins.forEach(pin => {
    const code = pin.dataset.code;
    const name = provinceNames[code];
    pin.addEventListener('mouseenter', (e) => { setHoveredState(code, true); showTooltip(code, name, e.clientX, e.clientY); });
    pin.addEventListener('mousemove', (e) => { showTooltip(code, name, e.clientX, e.clientY); });
    pin.addEventListener('mouseleave', () => { setHoveredState(code, false); hideTooltip(); });
  });
}

// Lista de provincias <-> mapa: hover sincronizado en ambos sentidos
if (provinceList) {
  provinceList.querySelectorAll('li').forEach(li => {
    const code = li.dataset.code;
    li.addEventListener('mouseenter', () => setHoveredState(code, true));
    li.addEventListener('mouseleave', () => setHoveredState(code, false));
    li.addEventListener('click', () => {
      const el = document.getElementById(code);
      if (el && el.scrollIntoView) {
        el.classList.add('hovered');
        setTimeout(() => el.classList.remove('hovered'), 1200);
      }
    });
  });
}

// ============ SCROLL REVEALS ============
const revealTargets = document.querySelectorAll('.product-card, .ed-block, .benefit-card, .corte-visual, .corte-text');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'none';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .7s cubic-bezier(.16,.84,.32,1), transform .7s cubic-bezier(.16,.84,.32,1)';
  io.observe(el);
});
