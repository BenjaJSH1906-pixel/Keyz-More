/* =========================================================
   1. NAVBAR: cambia de fondo al hacer scroll
   ========================================================= */
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

/* =========================================================
   2. MENÚ HAMBURGUESA (responsive)
   ========================================================= */
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');

function closeMenu() {
  hamburger.classList.remove('open');
  mainNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Cierra el menú al elegir una sección (mejor UX en móvil)
mainNav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

/* =========================================================
   3. HABILIDADES — datos + generación dinámica del DOM
   ========================================================= */
const skills = [
  { name: 'Interpretación al piano', level: 90 },
  { name: 'Lectura a primera vista', level: 65 },
  { name: 'Teoría musical', level: 50 },
  { name: 'Improvisación', level: 30 },
  { name: 'Grabación y producción', level: 50 },
];

const skillsList = document.getElementById('skills-list');

skills.forEach((skill, i) => {
  const li = document.createElement('li');
  li.className = 'skill-item';
  li.innerHTML = `
    <div class="skill-top">
      <span>${skill.name}</span>
      <span>${skill.level}%</span>
    </div>
    <div class="skill-track">
      <div class="skill-bar" data-level="${skill.level}"></div>
    </div>
  `;
  skillsList.appendChild(li);
});

// Anima las barras solo cuando entran en pantalla
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target.querySelector('.skill-bar');
      bar.style.width = bar.dataset.level + '%';
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.skill-item').forEach(item => skillObserver.observe(item));

/* =========================================================
   4. PROYECTOS — banner hacia Instagram
   ========================================================= */
const igBanner = document.getElementById('ig-banner');
const igHandle = document.getElementById('ig-handle');

if (igBanner) {
  // Toma el @usuario directamente del link, así solo editas el href una vez
  // y el texto se actualiza solo (manipulación del DOM).
  const href = igBanner.getAttribute('href');
  const match = href.match(/instagram\.com\/([^/?]+)/i);
  if (match && match[1]) {
    igHandle.textContent = '@' + match[1];
  }

  // Pequeño efecto de inclinación (tilt) que sigue el cursor
  igBanner.addEventListener('mousemove', (e) => {
    const rect = igBanner.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    igBanner.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
  });

  igBanner.addEventListener('mouseleave', () => {
    igBanner.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  });
}

/* =========================================================
   5. FORMULARIO DE CONTACTO — validación en tiempo real
   ========================================================= */
const form = document.getElementById('contact-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');
const formStatus = document.getElementById('form-status');

const validators = {
  name: (value) => value.trim().length >= 3 || 'Escribe al menos 3 caracteres.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Ingresa un correo válido.',
  message: (value) => value.trim().length >= 10 || 'Cuéntame un poco más (mínimo 10 caracteres).',
};

function validateField(input) {
  const field = input.closest('.field');
  const errorEl = document.getElementById(`${input.id}-error`);
  const result = validators[input.id](input.value);

  if (result === true) {
    field.classList.add('valid');
    field.classList.remove('invalid');
    errorEl.textContent = '';
    return true;
  } else {
    field.classList.add('invalid');
    field.classList.remove('valid');
    errorEl.textContent = result;
    return false;
  }
}

function updateSubmitState() {
  const allValid = [nameInput, emailInput, messageInput]
    .every(input => validators[input.id](input.value) === true);
  submitBtn.disabled = !allValid;
}

[nameInput, emailInput, messageInput].forEach(input => {
  // Validación en tiempo real mientras el usuario escribe
  input.addEventListener('input', () => {
    validateField(input);
    updateSubmitState();
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameOk = validateField(nameInput);
  const emailOk = validateField(emailInput);
  const messageOk = validateField(messageInput);

  if (!(nameOk && emailOk && messageOk)) {
    formStatus.textContent = 'Revisa los campos marcados en rojo.';
    return;
  }

  // Estado de carga: evita doble envío y avisa al usuario
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Enviando...';
  formStatus.textContent = '';

  try {
    const res = await fetch(`${window.API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: messageInput.value.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al enviar el mensaje.');

    formStatus.textContent = `Gracias, ${nameInput.value.trim()}. Tu mensaje quedó registrado.`;
    form.reset();
    [nameInput, emailInput, messageInput].forEach(input => {
      input.closest('.field').classList.remove('valid', 'invalid');
    });
  } catch (err) {
    // Error claro para el usuario (servidor caído, límite de envíos, etc.)
    formStatus.textContent = err.message === 'Failed to fetch'
      ? 'No pudimos conectar con el servidor. Intenta de nuevo en un momento.'
      : err.message;
  } finally {
    submitBtn.textContent = originalText;
    updateSubmitState(); // tras reset queda deshabilitado; tras error, habilitado
  }
});

/* =========================================================
   6. TRANSICIÓN SUAVE ENTRE PÁGINAS (enlaces externos)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const transitionEl = document.getElementById('page-transition');
  transitionEl.classList.add('hidden');

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    const isInternal = href.startsWith('#');
    const opensNewTab = link.target === '_blank';

    if (isInternal || opensNewTab || !href) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      transitionEl.classList.remove('hidden');
      transitionEl.classList.add('leaving');
      setTimeout(() => { window.location.href = href; }, 500);
    });
  });
});
