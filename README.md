# 🎹 Keyz & More — Portafolio Full Stack

Portafolio web interactivo y plataforma de presentación musical desarrollado con arquitectura cliente–servidor (`frontend` + `backend`) y persistencia en **MongoDB Atlas**[cite: 1, 2]. Combina una interfaz visual inspirada en el piano (negro, marfil y bronce) con un asistente de preguntas rápidas, un formulario de contacto con validación en tiempo real y un panel de administración protegido con JWT[cite: 1, 2].

---

## ✨ Características principales

* **Interfaz del portafolio (`frontend/`):** Encabezado adaptable al scroll, menú hamburguesa móvil, animación de barras de habilidades al entrar en pantalla, banner interactivo hacia Instagram y transición suave entre vistas.
* **Asistente interactivo (`chat.js`):** Widget flotante con respuestas predefinidas por palabras clave y botones rápidos para resolver dudas sobre trayectoria, instrumento, estilos musicales, clases y contacto, sin depender de IA ni llamadas al servidor.
* **Formulario de contacto (`POST /api/contact`):** Validación en tiempo real de nombre, correo y mensaje, con estados visuales y envío de registros hacia la base de datos.
* **Panel de administración (`admin.js`):** Modal protegido mediante autenticación y token `JWT` (almacenado en `sessionStorage`) para consultar los mensajes recibidos y eliminar registros.

---

## 🧱 Arquitectura y flujo del sistema

```mermaid
flowchart LR
    subgraph Cliente["Frontend (Navegador / GitHub Pages)"]
        UI["HTML + CSS + JS\n(Portafolio y Formulario)"]
        Chat["Asistente Local\n(chat.js)"]
        AdminUI["Modal Admin\n(admin.js + JWT)"]
    end

    subgraph Servidor["Backend (Node.js + Express / Render)"]
        API["API REST\n(/api/contact, /api/admin/*)"]
    end

    subgraph BD["Base de Datos en la Nube"]
        Mongo[("MongoDB Atlas\nColección: mensajes")]
    end

    UI -->|"POST /api/contact"| API
    AdminUI -->|"Login / GET / DELETE\n(Bearer Token)"| API
    API -->|"Leer / Guardar / Borrar"| Mongo
    Chat -.->|"Respuestas locales\n(TOPICS)"| UI