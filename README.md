# Keyz & More — portafolio full stack

```
portafolio_final/
├── frontend/   # La página (HTML, CSS, JS, imágenes). Es lo que se publica en GitHub Pages.
└── backend/    # API Node + Express + MongoDB (formulario de contacto y panel admin)
```

## Correr en local
1. `cd backend`
2. `npm install`
3. Copia `.env.example` a `.env` y complétalo (MONGODB_URI, ADMIN_USER, ADMIN_PASSWORD, JWT_SECRET).
4. `npm run dev`  → debe decir "API lista" y "Base de datos conectada".
5. Abre http://localhost:3000 → el admin está en el enlace "Admin" del footer.

## Qué se guarda y dónde
- Mensajes del formulario de Contacto → MongoDB, colección `mensajes`.
- El chat del sitio responde con mensajes predeterminados (frontend/chat.js), sin servidor ni IA.

## Seguridad
- `.env` NUNCA se sube a GitHub (ya está en `.gitignore`).
