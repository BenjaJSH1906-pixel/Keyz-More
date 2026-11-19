/* =========================================================
1. NAVBAR: cambia de fondo al hacer scroll
   ========================================================= */
// Obtiene la referencia al encabezado principal del sitio
const header = document.getElementById('site-header');

// Activa o quita la clase 'scrolled' cuando el desplazamiento vertical supera los 40 px
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

/* =========================================================
2. MENÚ HAMBURGUESA (responsive)
   ========================================================= */
// Referencias al botón hamburguesa y al contenedor de navegación
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');

// Cierra el menú móvil y actualiza el atributo de accesibilidad aria-expanded
function closeMenu() {
  hamburger.classList.remove('open');
  mainNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

// Alterna la visibilidad del menú al pulsar el botón hamburguesa
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
// Arreglo con los porcentajes de habilidad musical para renderizar en la sección
const skills = [
  { name: 'Interpretación al piano', level: 90 },
  { name: 'Lectura a primera vista', level: 65 },
  { name: 'Teoría musical', level: 50 },
  { name: 'Improvisación', level: 30 },
  { name: 'Grabación y producción', level: 50 },
];

// Contenedor donde se insertarán los elementos de habilidad
const skillsList = document.getElementById('skills-list');

// Genera dinámicamente cada ítem de habilidad con su barra de progreso
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

// Observa cuándo entra cada habilidad en pantalla para animar su barra una sola vez
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target.querySelector('.skill-bar');
      bar.style.width = bar.dataset.level + '%';
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

// Registra todos los elementos de habilidad en el observador
document.querySelectorAll('.skill-item').forEach(item => skillObserver.observe(item));

/* =========================================================
4. PROYECTOS — banner hacia Instagram
   ========================================================= */
// Elementos del banner promocional de Instagram
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

  // Restaura la inclinación neutra al salir el cursor del banner
  igBanner.addEventListener('mouseleave', () => {
    igBanner.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  });
}

/* =========================================================
5. FORMULARIO DE CONTACTO — validación en tiempo real
   ========================================================= */
// Referencias a los campos, botón de envío y mensaje de estado del formulario
const form = document.getElementById('contact-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');
const formStatus = document.getElementById('form-status');

// Reglas de validación para cada campo (devuelven true o un mensaje de error)
const validators = {
  name: (value) => value.trim().length >= 3 || 'Escribe al menos 3 caracteres.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Ingresa un correo válido.',
  message: (value) => value.trim().length >= 10 || 'Cuéntame un poco más (mínimo 10 caracteres).',
};

// Evalúa un campo individual, actualiza estilos visuales y muestra/limpia su mensaje de error
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

// Habilita o deshabilita el botón enviar según si todos los campos son válidos
function updateSubmitState() {
  const allValid = [nameInput, emailInput, messageInput]
    .every(input => validators[input.id](input.value) === true);
  submitBtn.disabled = !allValid;
}

// Escucha la escritura en cada campo para validar en tiempo real
[nameInput, emailInput, messageInput].forEach(input => {
  // Validación en tiempo real mientras el usuario escribe
  input.addEventListener('input', () => {
    validateField(input);
    updateSubmitState();
  });
});

// Valida y envía el formulario mediante POST al endpoint /api/contact del backend
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
// Al cargar el DOM, oculta la cortina de transición y aplica salida animada a enlaces de navegación
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