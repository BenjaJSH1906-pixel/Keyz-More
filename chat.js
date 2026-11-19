// Asistente con respuestas predeterminadas (sin IA ni backend).
// Para cambiar lo que responde, edita SOLO la lista TOPICS de abajo.

// Lista de temas predefinidos: cada objeto tiene la etiqueta del botón, palabras clave y la respuesta
const TOPICS = [
  {
    // Texto visible del botón de pregunta rápida
    label: '¿Quién es Benjamin?',
    // Palabras clave (sin tildes y en minúscula) usadas para detectar si la pregunta trata de este tema
    keywords: ['quien', 'benjamin', 'pianista', 'sobre ti', 'sobre el'],
    // Respuesta que devolverá el asistente cuando coincida este tema
    answer: 'Benjamin es pianista y en esta página cuenta su camino con el piano: cómo empezó, lo que ha aprendido y los proyectos musicales en los que trabaja.',
  },
  {
    // Pregunta rápida sobre trayectoria y años tocando
    label: '¿Desde cuándo toca?',
    // Términos relacionados con edad, inicio o tiempo de experiencia
    keywords: ['cuando', 'desde', 'empezo', 'empezar', 'anos', 'experiencia', 'edad', 'inicio'],
    // Respuesta con el año y edad de inicio
    answer: 'Toca piano desde 2014, cuando empezó a los 5 años. Son cerca de 12 años de práctica.',
  },
  {
    // Pregunta rápida sobre el teclado o piano utilizado
    label: '¿Qué instrumento usa?',
    // Palabras asociadas al tipo de instrumento o marca
    keywords: ['instrumento', 'piano', 'teclado', 'alesis', 'equipo', 'digital'],
    // Respuesta indicando el instrumento principal
    answer: 'Su instrumento principal es un piano digital Alesis.',
  },
  {
    // Pregunta rápida sobre estilos y repertorio musical
    label: '¿Qué música toca?',
    // Géneros, conceptos musicales y verbos asociados a tocar música
    keywords: ['musica', 'genero', 'estilo', 'jazz', 'bossa', 'clasica', 'acordes', 'toca', 'canciones'],
    // Respuesta con sus estilos e intereses musicales
    answer: 'Le gustan los acordes combinados, el jazz, la bossa nova y un poco de música clásica.',
  },
  {
    // Pregunta rápida sobre clases y tarifas
    label: 'Clases y precios',
    // Palabras vinculadas a enseñanza, costos o contratación de clases
    keywords: ['clase', 'clases', 'precio', 'precios', 'cuesta', 'costo', 'cobra', 'ensenar', 'aprender', 'tarifa'],
    // Respuesta aclarando cómo consultar disponibilidad y precios
    answer: 'Por ahora no tengo precios ni horarios publicados. Escríbele desde la sección Contacto y él te responde directamente.',
  },
  {
    // Pregunta rápida sobre medios de contacto directo
    label: 'Contactarlo',
    // Palabras relacionadas con mensajes, correo o vías de comunicación
    keywords: ['contacto', 'contactar', 'escribir', 'mensaje', 'correo', 'email', 'hablar', 'whatsapp', 'telefono'],
    // Respuesta guiando al usuario al formulario de contacto
    answer: 'Puedes escribirle con el formulario de la sección Contacto, al final de la página. Llena tu nombre, correo y mensaje, y le llega directo.',
  },
  {
    // Pregunta rápida sobre redes sociales
    label: 'Instagram',
    // Términos asociados a Instagram y publicaciones en redes
    keywords: ['instagram', 'redes', 'insta', 'seguir', 'videos'],
    // Respuesta con el usuario de Instagram y ubicación del enlace
    answer: 'Publica su avance en Instagram como @josuebenjamin190609. El enlace está al final de la página.',
  },
];

// Mensaje inicial de bienvenida del asistente
const GREETING = '¡Hola! Soy el asistente de Benjamin. Toca una pregunta o escríbeme lo que quieras saber.';
// Frases o palabras que indican despedida o agradecimiento
const GOODBYE = ['gracias', 'chao', 'adios', 'hasta luego', 'bye'];
// Saludos comunes para responder con el saludo inicial si no hay tema específico
const HELLO = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos'];
// Respuesta por defecto cuando no se encuentra coincidencia clara
const FALLBACK = 'No estoy seguro de eso. Prueba con uno de los botones o escríbele a Benjamin desde la sección Contacto.';

// Quita tildes y mayúsculas para comparar: "Música" -> "musica"
const normalize = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Busca la mejor respuesta según el texto ingresado por el usuario
function findAnswer(text) {
  // Normaliza el texto del usuario para comparar sin tildes ni mayúsculas
  const q = normalize(text);

  // Si el usuario se despide o agradece, responde con un mensaje de cierre
  if (GOODBYE.some((w) => q.includes(w))) return '¡Con gusto! Que disfrutes la música. 🎹';

  // Gana el tema con más palabras clave coincidentes
  let best = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    // Cuenta cuántas palabras clave del tema aparecen en la pregunta
    const score = topic.keywords.filter((k) => q.includes(k)).length;
    // Actualiza el tema ganador si supera el puntaje máximo actual
    if (score > bestScore) { best = topic; bestScore = score; }
  }
  // Si hubo al menos una coincidencia de palabra clave, devuelve su respuesta
  if (best) return best.answer;

  // Si el mensaje contiene un saludo, devuelve el mensaje de bienvenida
  if (HELLO.some((w) => q.includes(w))) return GREETING;
  // Si no hubo coincidencia, devuelve la respuesta alternativa
  return FALLBACK;
}

// Función autoejecutable (IIFE) para aislar variables y montar el widget en la página
(() => {
  // Crea el botón flotante (FAB) que abre o cierra el chat
  const fab = document.createElement('button');
  // Asigna la clase CSS para estilizar el botón flotante
  fab.className = 'chat-fab';
  // Agrega etiqueta accesible para lectores de pantalla
  fab.setAttribute('aria-label', 'Abrir asistente');
  // Coloca el ícono del botón flotante
  fab.textContent = '🎹';

  // Crea el contenedor principal del panel del chat
  const panel = document.createElement('div');
  // Asigna la clase CSS del panel
  panel.className = 'chat-panel';
  // Define la estructura HTML interna: cabecera, historial de mensajes, botones rápidos y formulario
  panel.innerHTML = `
    <div class="chat-head"><span>Asistente Keyz & More</span><button type="button" aria-label="Cerrar">×</button></div>
    <div class="chat-log" aria-live="polite"></div>
    <div class="chat-chips"></div>
    <form class="chat-form">
      <input type="text" maxlength="200" placeholder="Pregúntame sobre el piano..." aria-label="Tu pregunta" required>
      <button type="submit">Enviar</button>
    </form>`;
  // Inserta el botón flotante y el panel dentro del <body> de la página
  document.body.append(fab, panel);

  // Referencias a los elementos clave dentro del panel
  const log = panel.querySelector('.chat-log');
  const chips = panel.querySelector('.chat-chips');
  const form = panel.querySelector('.chat-form');
  const input = form.querySelector('input');

  // Agrega un mensaje visual al historial del chat y hace scroll automático hacia abajo
  function addMsg(text, cls) {
    // Crea el elemento contenedor del mensaje
    const div = document.createElement('div');
    // Aplica clases base y de tipo de mensaje ('user', 'bot', 'typing')
    div.className = `chat-msg ${cls}`;
    div.textContent = text; // textContent: nunca interpreta HTML
    // Añade el mensaje al historial
    log.appendChild(div);
    // Desplaza el scroll hasta el último mensaje
    log.scrollTop = log.scrollHeight;
    return div;
  }

  // Responde con una pequeña pausa para que se sienta natural
  function ask(text) {
    // Muestra el mensaje enviado por el usuario
    addMsg(text, 'user');
    // Muestra un indicador temporal de que el asistente está escribiendo
    const typing = addMsg('Escribiendo...', 'bot typing');
    // Espera 500 ms antes de reemplazar el indicador por la respuesta final
    setTimeout(() => {
      typing.remove();
      addMsg(findAnswer(text), 'bot');
    }, 500);
  }

  // Botones de preguntas rápidas
  TOPICS.forEach((topic) => {
    // Crea un botón por cada tema de TOPICS
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = topic.label;
    // Al hacer clic, envía la etiqueta del tema como si el usuario la hubiera preguntado
    b.addEventListener('click', () => ask(topic.label));
    // Agrega el botón al contenedor de sugerencias rápidas
    chips.appendChild(b);
  });

  // Abre o cierra el panel del chat y muestra el saludo inicial la primera vez que se abre
  const toggle = (open) => {
    panel.classList.toggle('open', open);
    if (open && !log.children.length) addMsg(GREETING, 'bot');
    if (open) input.focus();
  };
  // Alterna el estado abierto/cerrado al pulsar el botón flotante
  fab.addEventListener('click', () => toggle(!panel.classList.contains('open')));
  // Cierra el panel al pulsar el botón "×" de la cabecera
  panel.querySelector('.chat-head button').addEventListener('click', () => toggle(false));

  // Maneja el envío del formulario de texto
  form.addEventListener('submit', (e) => {
    // Evita que la página se recargue al enviar el formulario
    e.preventDefault();
    // Obtiene el texto del input sin espacios extremos
    const text = input.value.trim();
    if (!text) return;
    // Limpia el campo de texto y procesa la pregunta
    input.value = '';
    ask(text);
  });
})();