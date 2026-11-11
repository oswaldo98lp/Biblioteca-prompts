# Portal de Apoyo — Estudiantes Embajadores de Google Gemini 2026

Sitio web responsive en español diseñado para los talleres prácticos del programa **Estudiantes Embajadores de Google Gemini**, impartido por **Oswaldo Lucas** (*Universidad Politécnica de Texcoco*).

Permite a los estudiantes consultar la **Metodología PARTS**, copiar prompts con un clic desde el celular o computadora, participar en la **Práctica de prueba (Google Forms + Juego en Gemini Canvas)**, explorar guías de **NotebookLM**, **Canvas**, **Canvas + Base de datos** y **Gemini Live**, y descargar conjuntos de datos (`.csv`, `.xlsx`, `.pdf`). Incluye un **Panel de Administrador (`/admin`)** restringido a un único correo.

---

## 1. Requisitos Previos e Instalación Local

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
   - **Portal Público:** `http://localhost:5173/`
   - **Panel de Administrador:** `http://localhost:5173/admin.html` (o `/admin` al desplegar en Firebase Hosting)

> **Nota sobre los datos iniciales (Seed):** El portal incluye datos de ejemplo precargados en [`src/js/data/seedData.js`](src/js/data/seedData.js) y archivos reales en [`public/sample-files/`](public/sample-files/) para que funcione al 100% desde el primer momento, incluso antes de conectar Firebase.

---

## 2. Cómo Configurar Firebase Paso a Paso

1. Entra a [Firebase Console](https://console.firebase.google.com/) y haz clic en **Crear un proyecto** (ej. `taller-gemini-embajadores`).
2. **Habilitar Authentication (Inicio de sesión con Google):**
   - En el menú lateral ve a **Compilación > Authentication > Comenzar**.
   - En la pestaña **Sign-in method**, selecciona **Google**, actívalo, elige tu correo de soporte y haz clic en **Guardar**.
3. **Habilitar Cloud Firestore (Base de datos):**
   - Ve a **Compilación > Firestore Database > Crear base de datos**.
   - Elige la ubicación más cercana (ej. `us-central1`) y comienza en **Modo de producción**.
4. **Habilitar Cloud Storage (Opcional — para subida directa de archivos):**
   - Ve a **Compilación > Storage > Comenzar**.
   - *Alternativa gratuita sin Cloud Storage:* Si tu proyecto está en el plan gratuito (Spark) y no deseas activar Cloud Storage, el panel `/admin` permite pegar enlaces de **Google Drive** (con permiso *"Cualquiera con el enlace"*) y los convierte automáticamente en enlaces de descarga directa.
5. **Obtener las credenciales Web:**
   - En la página principal de tu proyecto de Firebase, haz clic en el ícono **`</>` (Web)** para registrar tu app.
   - Copia los valores de `firebaseConfig`.

---

## 3. Cómo Definir `ADMIN_EMAIL` y Variables de Entorno

1. En la raíz del proyecto, duplica el archivo `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Abre el archivo `.env` y coloca tu correo de Google en `VITE_ADMIN_EMAIL` junto con las llaves de tu proyecto de Firebase:
   ```env
   VITE_ADMIN_EMAIL=oswaldo1998.lp@gmail.com

   VITE_FIREBASE_API_KEY=AIzaSyTuApiKeyAqui
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
   ```
3. También verifica que tu correo esté indicado en [`firestore.rules`](firestore.rules) y [`storage.rules`](storage.rules) dentro de la función `isAdmin()`.

---

## 4. Cómo Desplegar en Firebase Hosting

1. Instala la herramienta CLI de Firebase si aún no la tienes:
   ```bash
   npm install -g firebase-tools
   ```
2. Inicia sesión en tu cuenta de Google:
   ```bash
   firebase login
   ```
3. Vincula tu carpeta local con tu proyecto de Firebase:
   ```bash
   firebase use --add
   ```
4. Genera la versión optimizada de producción (`dist/`):
   ```bash
   npm run build
   ```
5. Despliega el sitio, las reglas de Firestore y las reglas de Storage:
   ```bash
   firebase deploy
   ```

---

## 5. Cómo Agregar y Editar Contenido desde el Panel `/admin`

1. Ingresa a `/admin` (en local: `http://localhost:5173/admin.html`) e inicia sesión con tu cuenta de Google autorizada en `VITE_ADMIN_EMAIL`.
   - Si cualquier otra cuenta intenta ingresar, verá la pantalla **"Acceso denegado"**.
2. Una vez dentro, usa el botón superior **"Restaurar / Sincronizar Seed Inicial"** la primera vez para subir todos los datos de ejemplo a tu base de datos de Firestore.
3. Navega por las 7 pestañas del panel:
   - **Prompts:** Crea o edita prompts multilínea, asígnales categoría, etiquetas y el campo opcional *"¿Qué archivo usar con este prompt?"*. Usa **"Vista Previa antes de publicar"** para revisar cómo se verá la tarjeta.
   - **Archivos (PDF/Excel/CSV):** Arrastra y suelta archivos `.pdf`, `.xlsx` o `.csv` (máx. 10 MB) o pega un enlace compartido de Google Drive.
   - **Enlaces:** Administra los enlaces externos por categoría.
   - **Metodología PARTS:** Edita el título, pregunta guía, descripción y ejemplo de cada letra (**P - A - R - T - S**).
   - **Bloques por Sección:** Agrega explicaciones y stickers de `/assets` a las secciones **NotebookLM**, **Canvas**, **Canvas + Base de datos** y **Gemini Live**.
   - **FAQ:** Agrega o edita preguntas frecuentes.
   - **Inicio y Práctica:** Modifica los textos de bienvenida y configura la URL del **Google Forms** y del **Juego en Gemini Canvas**.
4. En todas las tablas puedes usar las flechas **↑ / ↓** para reordenar elementos, el botón de **ojo** para alternar entre **Publicado** y **Borrador**, el lápiz para editar o el bote de basura para eliminar.
