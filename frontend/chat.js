// Asistente con respuestas predeterminadas (sin IA ni backend).
// Para cambiar lo que responde, edita SOLO la lista TOPICS de abajo.

const TOPICS = [
  {
    label: '¿Quién es Benjamin?',
    keywords: ['quien', 'benjamin', 'pianista', 'sobre ti', 'sobre el'],
    answer: 'Benjamin es pianista y en esta página cuenta su camino con el piano: cómo empezó, lo que ha aprendido y los proyectos musicales en los que trabaja.',
  },
  {
    label: '¿Desde cuándo toca?',
    keywords: ['cuando', 'desde', 'empezo', 'empezar', 'anos', 'experiencia', 'edad', 'inicio'],
    answer: 'Toca piano desde 2014, cuando empezó a los 5 años. Son cerca de 12 años de práctica.',
  },
  {
    label: '¿Qué instrumento usa?',
    keywords: ['instrumento', 'piano', 'teclado', 'alesis', 'equipo', 'digital'],
    answer: 'Su instrumento principal es un piano digital Alesis.',
  },
  {
    label: '¿Qué música toca?',
    keywords: ['musica', 'genero', 'estilo', 'jazz', 'bossa', 'clasica', 'acordes', 'toca', 'canciones'],
    answer: 'Le gustan los acordes combinados, el jazz, la bossa nova y un poco de música clásica.',
  },
  {
    label: 'Clases y precios',
    keywords: ['clase', 'clases', 'precio', 'precios', 'cuesta', 'costo', 'cobra', 'ensenar', 'aprender', 'tarifa'],
    answer: 'Por ahora no tengo precios ni horarios publicados. Escríbele desde la sección Contacto y él te responde directamente.',
  },
  {
    label: 'Contactarlo',
    keywords: ['contacto', 'contactar', 'escribir', 'mensaje', 'correo', 'email', 'hablar', 'whatsapp', 'telefono'],
    answer: 'Puedes escribirle con el formulario de la sección Contacto, al final de la página. Llena tu nombre, correo y mensaje, y le llega directo.',
  },
  {
    label: 'Instagram',
    keywords: ['instagram', 'redes', 'insta', 'seguir', 'videos'],
    answer: 'Publica su avance en Instagram como @josuebenjamin190609. El enlace está al final de la página.',
  },
];

const GREETING = '¡Hola! Soy el asistente de Benjamin. Toca una pregunta o escríbeme lo que quieras saber.';
const GOODBYE = ['gracias', 'chao', 'adios', 'hasta luego', 'bye'];
const HELLO = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos'];
const FALLBACK = 'No estoy seguro de eso. Prueba con uno de los botones o escríbele a Benjamin desde la sección Contacto.';

// Quita tildes y mayúsculas para comparar: "Música" -> "musica"
const normalize = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function findAnswer(text) {
  const q = normalize(text);

  if (GOODBYE.some((w) => q.includes(w))) return '¡Con gusto! Que disfrutes la música. 🎹';

  // Gana el tema con más palabras clave coincidentes
  let best = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    const score = topic.keywords.filter((k) => q.includes(k)).length;
    if (score > bestScore) { best = topic; bestScore = score; }
  }
  if (best) return best.answer;

  if (HELLO.some((w) => q.includes(w))) return GREETING;
  return FALLBACK;
}

(() => {
  const fab = document.createElement('button');
  fab.className = 'chat-fab';
  fab.setAttribute('aria-label', 'Abrir asistente');
  fab.textContent = '🎹';

  const panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.innerHTML = `
    <div class="chat-head"><span>Asistente Keyz & More</span><button type="button" aria-label="Cerrar">×</button></div>
    <div class="chat-log" aria-live="polite"></div>
    <div class="chat-chips"></div>
    <form class="chat-form">
      <input type="text" maxlength="200" placeholder="Pregúntame sobre el piano..." aria-label="Tu pregunta" required>
      <button type="submit">Enviar</button>
    </form>`;
  document.body.append(fab, panel);

  const log = panel.querySelector('.chat-log');
  const chips = panel.querySelector('.chat-chips');
  const form = panel.querySelector('.chat-form');
  const input = form.querySelector('input');

  function addMsg(text, cls) {
    const div = document.createElement('div');
    div.className = `chat-msg ${cls}`;
    div.textContent = text; // textContent: nunca interpreta HTML
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  // Responde con una pequeña pausa para que se sienta natural
  function ask(text) {
    addMsg(text, 'user');
    const typing = addMsg('Escribiendo...', 'bot typing');
    setTimeout(() => {
      typing.remove();
      addMsg(findAnswer(text), 'bot');
    }, 500);
  }

  // Botones de preguntas rápidas
  TOPICS.forEach((topic) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = topic.label;
    b.addEventListener('click', () => ask(topic.label));
    chips.appendChild(b);
  });

  const toggle = (open) => {
    panel.classList.toggle('open', open);
    if (open && !log.children.length) addMsg(GREETING, 'bot');
    if (open) input.focus();
  };
  fab.addEventListener('click', () => toggle(!panel.classList.contains('open')));
  panel.querySelector('.chat-head button').addEventListener('click', () => toggle(false));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    ask(text);
  });
})();
