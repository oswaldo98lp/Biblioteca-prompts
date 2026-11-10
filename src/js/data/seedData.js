/**
 * Datos iniciales (Seed) para el portal del taller "Estudiantes Embajadores de Google Gemini"
 * Todos estos elementos son editables, reordenables y ocultables desde el panel /admin.
 */

export const SECTIONS_META = [
  { id: 'inicio', label: 'Inicio', icon: 'home' },
  { id: 'practica', label: 'Práctica de prueba', icon: 'sports_esports' },
  { id: 'parts', label: 'Metodología PARTS', icon: 'extension' },
  { id: 'notebooklm', label: 'NotebookLM', icon: 'menu_book' },
  { id: 'canvas', label: 'Canvas', icon: 'dashboard_customize' },
  { id: 'canvas-db', label: 'Canvas + Base de datos', icon: 'database' },
  { id: 'gemini-live', label: 'Gemini Live', icon: 'graphic_eq' },
  { id: 'biblioteca', label: 'Biblioteca de Prompts', icon: 'terminal' },
  { id: 'recursos', label: 'Recursos descargables', icon: 'folder_zip' },
  { id: 'faq', label: 'FAQ y Apoyo', icon: 'help' },
];

export const INITIAL_SEED_DATA = {
  // Configuración general de Inicio y Práctica de prueba
  siteSettings: {
    welcomeTitle: '¡QUÉ GUSTO TENERTE POR AQUÍ!',
    welcomeParagraph1:
      'El Programa Estudiantes Embajadores de Google Gemini 2026 es una experiencia práctica de capacitación digital y liderazgo que busca transformar a estudiantes universitarios apasionados por la tecnología en referentes locales de IA. Aprenderás a integrar herramientas avanzadas de IA generativa para optimizar tus estudios, desarrollar proyectos de impacto y crear un currículum destacado para el mercado laboral.',
    welcomeParagraph2:
      'A lo largo del Programa, formarás parte de una comunidad de estudiantes de diferentes carreras, universidades y regiones de México, conectados por un objetivo en común: aprender, intercambiar experiencias y explorar nuevas posibilidades con Google Gemini.',
    welcomeParagraph3:
      'Este portal es el punto de encuentro de todo lo que forma parte de este taller práctico. Por aquí encontrarás las guías, la metodología PARTS, prompts listos para copiar, conjuntos de datos descargables y actividades interactivas para llevar tu aprendizaje al máximo.',
    geminiButtonText: 'Accede Google Gemini',
    geminiButtonUrl: 'https://gemini.google.com/',
    headerImage: '/assets/Stickers/imagen de encabezado.png',
    welcomeSticker: '/assets/Stickers/Gemini_Generated_Image_297rci297rci297r.png',
    profileImage: '/assets/Stickers/Mi perfil.png',
    ambassadorName: 'Oswaldo Lucas',
    ambassadorUni: 'Universidad Politécnica de Texcoco',
    ambassadorMajor: 'Ingeniería en Sistemas Computacionales · 9º Cuatrimestre',
    ambassadorInstagram: 'https://instagram.com/oswaldo.0',
    ambassadorInstagramHandle: '@oswaldo.0',
    ambassadorLinkedin: 'https://linkedin.com/in/oswaldo-lucas',
    ambassadorLinkedinHandle: 'linkedin.com/in/oswaldo-lucas',

    // Configuración de Sección 2: Práctica de prueba
    practiceTitle: 'PRÁCTICA EN VIVO: FORMULARIO + JUEGO EN GEMINI CANVAS',
    practiceSubtitle:
      'Vive en tiempo real cómo tus respuestas en un Google Forms alimentan una experiencia interactiva construida directamente con Gemini Canvas.',
    practiceStep1:
      'Completa el formulario de registro rápido con tu nombre o apodo, carrera y tu superpoder tecnológico.',
    practiceStep2:
      'Envía tus respuestas. Los datos se conectan con la hoja de cálculo vinculada al taller.',
    practiceStep3:
      'Abre el tablero del Juego en Gemini Canvas y observa tu perfil aparecer en la dinámica grupal en tiempo real.',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_example_workshop_form/viewform?embedded=true',
    googleFormExternalUrl: 'https://forms.google.com/',
    canvasGameUrl: 'https://gemini.google.com/share/example-canvas-game',
    canvasGameTitle: 'Arena Interactiva Universitaria en Gemini Canvas',
    canvasGameDescription:
      'Visualiza los perfiles registrados por los asistentes del taller, compite en el quiz en vivo y explora cómo se construyó esta aplicación con un solo prompt en Gemini Canvas.',
  },

  // Sección 3: Metodología PARTS (Basada exactamente en la imagen proporcionada "ANATOMÍA DEL COMANDO AVANZADO")
  partsCards: [
    {
      id: 'parts-p',
      letter: 'P',
      title: 'PERSONA',
      icon: 'person_add',
      subtitle: '¿En qué debe "convertirse" Gemini para la tarea?',
      description:
        'Define el rol, identidad, nivel de conocimiento y especialidad que debe adoptar la IA.',
      example:
        '"Actúa como un profesor senior de Ingeniería de Software y mentor de hackathons universitarios..."',
      order: 1,
      published: true,
    },
    {
      id: 'parts-a',
      letter: 'A',
      title: 'ACCIÓN',
      icon: 'track_changes',
      subtitle: 'La tarea principal que Gemini debe ejecutar.',
      description:
        'Sin una tarea clara, el modelo puede generar una respuesta genérica o que no se adapte a tus necesidades.',
      example:
        '"Analiza el archivo CSV adjunto e identifica los 3 principales cuellos de botella en el proyecto..."',
      order: 2,
      published: true,
    },
    {
      id: 'parts-r',
      letter: 'R',
      title: 'RESULTADO',
      icon: ' burst_mode',
      subtitle: 'Cómo debe estructurarse la respuesta.',
      description:
        'Evita recibir un texto enorme cuando necesitas una lista o tabla, garantizando que la respuesta sea fácil de usar.',
      example:
        '"Entrégame el resultado en una tabla comparativa en Markdown seguida de un plan de 5 pasos accionables."',
      order: 3,
      published: true,
    },
    {
      id: 'parts-t',
      letter: 'T',
      title: 'TONO',
      icon: 'groups',
      subtitle: 'De qué forma debe responder Gemini.',
      description:
        'Especifica el estilo de comunicación (formal, empático, técnico) que debe tener la respuesta.',
      example:
        '"Usa un tono didáctico, claro, motivador y técnico pero accesible para estudiantes de 5º semestre."',
      order: 4,
      published: true,
    },
    {
      id: 'parts-s',
      letter: 'S',
      title: 'SOPORTE',
      icon: 'checklist',
      subtitle: 'El escenario, contexto o ejemplos.',
      description:
        'Proporciona reglas, contexto o un buen ejemplo. Esto "calibra" el modelo, garantizando que no se desvíe de lo que realmente necesitas.',
      example:
        '"Toma como contexto la rúbrica del PDF adjunto. No inventes citas fuera del documento."',
      order: 5,
      published: true,
    },
  ],

  // Bloques de contenido por sección (Secciones 4 a 7 y bloques adicionales)
  blocks: [
    {
      id: 'block-nb-1',
      section: 'notebooklm',
      title: '¿Qué es NotebookLM y cómo acelera tu estudio universitario?',
      content:
        'NotebookLM es tu asistente de investigación personalizado impulsado por Gemini. A diferencia de un chat tradicional, trabaja exclusivamente sobre tus propias fuentes (apuntes en PDF, artículos científicos, presentaciones, enlaces web o videos de YouTube), citando cada afirmación con precisión exacta.',
      sticker: '/assets/Stickers/Gemini_Generated_Image_941lkv941lkv941l.png',
      order: 1,
      published: true,
    },
    {
      id: 'block-nb-2',
      section: 'notebooklm',
      title: 'Flujo práctico en 3 pasos para el taller',
      content:
        '1. Descarga el archivo "Guía Metodología PARTS (PDF)" en la sección de Recursos.\n2. Entra a notebooklm.google.com, crea un cuaderno nuevo y sube el PDF.\n3. Genera un Resumen de Audio (Podcast de estudio) o usa los prompts de abajo para crear cuestionarios tipo examen con citas verificadas.',
      sticker: '/assets/Stickers/Gemini_Generated_Image_ (2) (1).png',
      order: 2,
      published: true,
    },
    {
      id: 'block-canvas-1',
      section: 'canvas',
      title: 'Gemini Canvas: De una idea a código y documentos interactivos en segundos',
      content:
        'Gemini Canvas es un espacio de trabajo colaborativo lateral donde puedes redactar documentos largos o programar aplicaciones web completas (HTML/CSS/JS, React, juegos, simuladores) y ver su vista previa ejecutándose en vivo sin salir de Gemini.',
      sticker: '/assets/Stickers/Gemini_Generated_Image_ (8).png',
      order: 1,
      published: true,
    },
    {
      id: 'block-canvas-2',
      section: 'canvas',
      title: 'Consejos clave al iterar en Canvas',
      content:
        '• Activa la herramienta "Canvas" debajo del cuadro de texto en Gemini.\n• Selecciona cualquier fragmento de texto o línea de código para pedir cambios puntuales.\n• Usa el botón "Vista previa" para interactuar con tu app y el botón "Compartir" para generar un enlace público como el de nuestra Práctica de Prueba.',
      sticker: '/assets/Stickers/Gemini_Generated_Image_9rooq29rooq29roo.png',
      order: 2,
      published: true,
    },
    {
      id: 'block-canvasdb-1',
      section: 'canvas-db',
      title: 'Conecta tus archivos Excel / CSV con aplicaciones en Gemini Canvas',
      content:
        'Una de las funciones más potentes para proyectos universitarios es cargar una base de datos en formato .CSV o .XLSX directamente en el chat de Gemini y pedirle que construya en Canvas un Dashboard interactivo con filtros, gráficas y métricas calculadas al instante.',
      sticker: '/assets/Stickers/Gemini_Generated_Image_ (10).png',
      order: 1,
      published: true,
    },
    {
      id: 'block-canvasdb-2',
      section: 'canvas-db',
      title: 'Ejercicio guiado con datos reales',
      content:
        '1. Descarga "Dataset Proyectos Universitarios (.CSV)" o "Finanzas Estudiantiles (.CSV)" de este portal.\n2. Adjunta el archivo en Gemini con el botón (+).\n3. Activa "Canvas" y pega el prompt de Dashboard Interactivo para transformar la tabla plana en una aplicación visual.',
      sticker: '/assets/Stickers/Gemini_Generated_Image_q3tclbq3tclbq3tc.png',
      order: 2,
      published: true,
    },
    {
      id: 'block-live-1',
      section: 'gemini-live',
      title: 'Gemini Live: Conversación fluida por voz y cámara en tiempo real',
      content:
        'Gemini Live en dispositivos móviles te permite conversar de forma natural, interrumpir para cambiar de tema, practicar entrevistas técnicas en inglés o español y compartir la cámara o pantalla de tu celular para recibir retroalimentación sobre diagramas, código o circuitos.',
      sticker: '/assets/Stickers/Gemini_Generated_Image_ (75).png',
      order: 1,
      published: true,
    },
    {
      id: 'block-live-2',
      section: 'gemini-live',
      title: 'Dinámica del Taller con Gemini Live',
      content:
        'Abre la app de Google Gemini en tu teléfono, toca el ícono de ondas de Gemini Live en la esquina inferior derecha y lee o pega antes uno de los prompts de simulación para ensayar tu defensa de proyecto final o entrevista de prácticas profesionales.',
      sticker: '/assets/Stickers/Gemini_Generated_Image_ (7).png',
      order: 2,
      published: true,
    },
  ],

  // Biblioteca de Prompts (Sección 8 y filtrados en secciones 3 a 7)
  prompts: [
    {
      id: 'prompt-1',
      title: 'Plantilla Maestra con Metodología PARTS',
      category: 'parts',
      tags: ['PARTS', 'Estructura', 'Productividad', 'Académico'],
      recommendedFile: 'Guía Rápida Metodología PARTS (guia-metodologia-parts-gemini.pdf)',
      promptText: `[PERSONA]: Actúa como un especialista senior en [TU ÁREA O CARRERA] y asesor académico universitario con 10 años de experiencia guiando proyectos aplicados.

[ACCIÓN]: Desarrolla una propuesta estructurada y paso a paso para resolver el siguiente reto universitario: [DESCRIBE TU PROYECTO O TAREA].

[RESULTADO]: Organiza la respuesta en:
1. Resumen ejecutivo (máximo 4 líneas).
2. Tabla comparativa con 3 enfoques de solución (Ventajas, Complejidad, Herramientas).
3. Ruta de implementación dividida en 4 semanas con entregables medibles.

[TONO]: Profesional, técnico, directo y motivador para estudiantes universitarios.

[SOPORTE]: Considera que contamos con recursos gratuitos para estudiantes, tiempo límite de 4 semanas y debemos priorizar herramientas de código abierto o del ecosistema Google.`,
      order: 1,
      published: true,
    },
    {
      id: 'prompt-2',
      title: 'Guía de Estudio y Examen Simulado desde mis PDFs',
      category: 'notebooklm',
      tags: ['NotebookLM', 'Exámenes', 'Citas', 'Estudio'],
      recommendedFile: 'Tus apuntes en PDF o guia-metodologia-parts-gemini.pdf',
      promptText: `Actúa como un profesor universitario exigente pero pedagógico. Basándote EXCLUSIVAMENTE en los documentos cargados en este cuaderno:

1. Extrae los 5 conceptos fundamentales que todo estudiante debe dominar para el examen y explícalos con una analogía práctica de la vida real.
2. Diseña un examen de práctica de 5 preguntas de opción múltiple (con 4 incisos cada una) de nivel intermedio-avanzado.
3. Al final, incluye una sección de "Clave de Respuestas" explicando por qué la opción correcta es verdadera y citando la fuente exacta del documento.`,
      order: 2,
      published: true,
    },
    {
      id: 'prompt-3',
      title: 'Detector de Vacíos y Mapa de Conexiones para Tesis',
      category: 'notebooklm',
      tags: ['NotebookLM', 'Investigación', 'Tesis', 'Artículos'],
      recommendedFile: 'Artículos científicos en PDF cargados en tu cuaderno',
      promptText: `Analiza todas las fuentes cargadas en este cuaderno de investigación y realiza una síntesis crítica:

- ¿En qué puntos coinciden los autores de los distintos documentos?
- ¿Qué contradicciones, limitaciones metodológicas o preguntas sin resolver se mencionan entre las fuentes?
- Propón 3 temas de proyecto integrador o tesis universitaria que aprovechen esos vacíos detectados. Presenta el resultado en una tabla clara con citas a las fuentes.`,
      order: 3,
      published: true,
    },
    {
      id: 'prompt-4',
      title: 'Creador de Simulador / Juego Educativo en Gemini Canvas',
      category: 'canvas',
      tags: ['Canvas', 'Juego', 'Interactivo', 'Web App'],
      recommendedFile: '',
      promptText: `[PERSONA]: Actúa como un desarrollador frontend senior especializado en experiencias educativas interactivas.

[ACCIÓN]: Construye en Gemini Canvas una aplicación web interactiva tipo "Quiz Arcade Universitario" de una sola página sobre el tema: [ESCRIBE TU MATERIA O TEMA, EJ. REDES DE COMPUTADORAS / FINANZAS / TERMODINÁMICA].

[RESULTADO]: Una aplicación HTML/CSS/JS completa y funcional que incluya:
- Pantalla de inicio donde el alumno ingresa su nombre y carrera.
- 5 retos prácticos con temporizador visual, barra de progreso y retroalimentación inmediata explicando cada respuesta.
- Contador de racha, puntaje final e insignia descargable o copiable al terminar.

[TONO]: Visualmente moderno, limpio, inspirado en los colores de Google (#4285F4, #EA4335, #FBBC04, #34A853) y adaptable a celular.

[SOPORTE]: No uses librerías externas que puedan fallar al cargar; todo debe funcionar de forma autónoma en la vista previa de Canvas.`,
      order: 4,
      published: true,
    },
    {
      id: 'prompt-5',
      title: 'Generador de Portafolio Web Universitario en Canvas',
      category: 'canvas',
      tags: ['Canvas', 'Portafolio', 'CV', 'Empleabilidad'],
      recommendedFile: '',
      promptText: `Actúa como un diseñador UI/UX senior y reclutador Tech. Crea en Gemini Canvas una página web de Portafolio Profesional para un estudiante de [TU CARRERA] en la [TU UNIVERSIDAD].

Incluye:
1. Hero con presentación de alto impacto y botones a LinkedIn y GitHub.
2. Sección de 3 proyectos destacados con etiquetas de tecnologías utilizadas y métricas de impacto.
3. Filtro interactivo de habilidades técnicas y blandas.
4. Modo claro/oscuro funcional y diseño 100% responsive listo para publicar.`,
      order: 5,
      published: true,
    },
    {
      id: 'prompt-6',
      title: 'Dashboard Interactivo desde Archivo CSV / Excel en Canvas',
      category: 'canvas-db',
      tags: ['Canvas + Base de datos', 'CSV', 'Excel', 'Dashboard'],
      recommendedFile: 'dataset-proyectos-universitarios.csv',
      promptText: `[PERSONA]: Actúa como un Ingeniero de Datos y Desarrollador Full-Stack experto en visualización de información.

[ACCIÓN]: Analiza los datos del archivo "dataset-proyectos-universitarios.csv" adjunto y construye en Gemini Canvas un Dashboard Interactivo completo que incorpore todos los registros del archivo.

[RESULTADO]: Una aplicación web interactiva en Canvas que contenga:
1. 4 tarjetas KPI superiores (Total de estudiantes, Promedio general, Total de horas ahorradas por semana con IA y Herramienta más utilizada).
2. Filtros dinámicos por Carrera y por Herramienta Favorita (NotebookLM, Gemini Canvas, Gemini Live).
3. Gráficas visuales en barras/donas hechas con CSS/SVG o Canvas nativo y buscador en tiempo real sobre la tabla de proyectos.
4. Formulario modal para agregar un nuevo registro en memoria y recalcular los indicadores al instante.

[TONO]: Ejecutivo, limpio y con paleta Google (#4285F4, #34A853, #FBBC04, #EA4335).`,
      order: 6,
      published: true,
    },
    {
      id: 'prompt-7',
      title: 'Analizador de Presupuesto y Finanzas Estudiantiles con Alertas',
      category: 'canvas-db',
      tags: ['Canvas + Base de datos', 'Finanzas', 'CSV', 'Simulador'],
      recommendedFile: 'finanzas-estudiantiles-plantilla.csv',
      promptText: `Con base en el archivo adjunto "finanzas-estudiantiles-plantilla.csv", genera en Gemini Canvas una calculadora y tablero de salud financiera para estudiantes universitarios.

Debe incluir:
- Balance entre ingresos (becas/apoyos) y egresos por categoría (Transporte, Alimentación, Material Académico, Hardware).
- Simulador con controles deslizantes (sliders) para ajustar gastos mensuales y proyectar cuánto ahorraría el estudiante al final del cuatrimestre.
- 3 recomendaciones personalizadas generadas a partir de los patrones de gasto del archivo.`,
      order: 7,
      published: true,
    },
    {
      id: 'prompt-8',
      title: 'Simulador de Entrevista Técnica / Prácticas con Gemini Live',
      category: 'gemini-live',
      tags: ['Gemini Live', 'Voz', 'Entrevista', 'Empleabilidad'],
      recommendedFile: '',
      promptText: `[Usa este prompt antes de activar el micrófono en Gemini Live]:

Actúa como un Líder Técnico (Tech Lead) realizando una entrevista para una vacante de becario o recién egresado de [TU CARRERA]. Vamos a conversar por voz en Gemini Live.

Reglas de la dinámica:
1. Hazme UNA sola pregunta a la vez y espera mi respuesta hablada.
2. Empieza pidiéndome que me presente en 1 minuto y luego hazme 3 preguntas sobre mis proyectos universitarios y resolución de problemas.
3. Después de cada una de mis respuestas, dame una retroalimentación breve (qué dije bien y cómo podría sonar más seguro y estructurado con el método STAR) antes de pasar a la siguiente pregunta.`,
      order: 8,
      published: true,
    },
    {
      id: 'prompt-9',
      title: 'Defensa de Proyecto Integrador / Sínodo de Tesis en Vivo',
      category: 'gemini-live',
      tags: ['Gemini Live', 'Exposición', 'Oratoria', 'Defensa'],
      recommendedFile: '',
      promptText: `Actúa como un jurado académico universitario amable pero riguroso. Te voy a exponer en voz alta mi proyecto de fin de cuatrimestre durante 2 minutos usando Gemini Live.

Escúchame y, cuando termine, hazme 2 preguntas clave sobre la viabilidad técnica, el impacto real de mi proyecto y cómo validé los resultados. Al final de la sesión, califica mi claridad al hablar del 1 al 10 y dame 3 consejos prácticos de oratoria.`,
      order: 9,
      published: true,
    },
  ],

  // Enlaces útiles por categoría
  links: [
    {
      id: 'link-1',
      title: 'Google Gemini (Web App Oficial)',
      url: 'https://gemini.google.com/',
      description: 'Accede directamente a Google Gemini para ejecutar tus prompts, abrir Canvas y analizar archivos.',
      category: 'inicio',
      order: 1,
      published: true,
    },
    {
      id: 'link-2',
      title: 'Google NotebookLM',
      url: 'https://notebooklm.google.com/',
      description: 'Crea cuadernos de investigación inteligentes con tus PDFs, apuntes, videos de YouTube y diapositivas.',
      category: 'notebooklm',
      order: 2,
      published: true,
    },
    {
      id: 'link-3',
      title: 'Espacio de trabajo Gemini Canvas',
      url: 'https://gemini.google.com/',
      description: 'Activa la opción "Canvas" en la barra de herramientas de Gemini para programar apps y editar documentos en vivo.',
      category: 'canvas',
      order: 3,
      published: true,
    },
    {
      id: 'link-4',
      title: 'Google AI Studio (Para Desarrolladores)',
      url: 'https://aistudio.google.com/',
      description: 'Prototipa con la API de Gemini y obtén tu API Key gratuita para proyectos de Ingeniería en Sistemas.',
      category: 'canvas-db',
      order: 4,
      published: true,
    },
    {
      id: 'link-5',
      title: 'Gemini en Android / iOS (Gemini Live)',
      url: 'https://gemini.google.com/advanced',
      description: 'Descarga la app móvil de Google Gemini para usar Gemini Live con voz y cámara en tiempo real.',
      category: 'gemini-live',
      order: 5,
      published: true,
    },
  ],

  // Recursos descargables (Sección 9 y vinculados a las categorías)
  files: [
    {
      id: 'file-1',
      title: 'Dataset de Proyectos Universitarios con IA',
      description:
        'Base de datos en formato CSV con registros de estudiantes, carreras, cuatrimestres, horas ahorradas y calificaciones. Ideal para crear tu primer Dashboard en Gemini Canvas + Base de datos.',
      category: 'canvas-db',
      fileType: 'CSV',
      fileSize: '1.8 KB',
      url: '/sample-files/dataset-proyectos-universitarios.csv',
      fileName: 'dataset-proyectos-universitarios.csv',
      order: 1,
      published: true,
    },
    {
      id: 'file-2',
      title: 'Plantilla de Finanzas Estudiantiles Semestrales',
      description:
        'Archivo CSV con movimientos de ingresos (becas) y gastos estudiantiles por categoría y prioridad para practicar visualización financiera en Gemini Canvas.',
      category: 'canvas-db',
      fileType: 'CSV',
      fileSize: '1.4 KB',
      url: '/sample-files/finanzas-estudiantiles-plantilla.csv',
      fileName: 'finanzas-estudiantiles-plantilla.csv',
      order: 2,
      published: true,
    },
    {
      id: 'file-3',
      title: 'Guía Rápida: Anatomía del Comando Avanzado (PARTS)',
      description:
        'Documento PDF resumen con las 5 llaves de la metodología PARTS (Persona, Acción, Resultado, Tono y Soporte). Descárgalo y súbelo a NotebookLM o Gemini.',
      category: 'notebooklm',
      fileType: 'PDF',
      fileSize: '4.2 KB',
      url: '/sample-files/guia-metodologia-parts-gemini.pdf',
      fileName: 'guia-metodologia-parts-gemini.pdf',
      order: 3,
      published: true,
    },
  ],

  // Preguntas Frecuentes (Sección 10: FAQ y Apoyo)
  faqs: [
    {
      id: 'faq-1',
      question: '¿Necesito pagar una suscripción para seguir los ejercicios del taller?',
      answer:
        'No. Todos los ejercicios de este portal están diseñados para funcionar con una cuenta gratuita de Google en Gemini (gemini.google.com), NotebookLM (notebooklm.google.com) y la app móvil con Gemini Live.',
      order: 1,
      published: true,
    },
    {
      id: 'faq-2',
      question: '¿Cómo cargo los archivos descargables (.CSV, .XLSX o .PDF) en Gemini?',
      answer:
        'Descarga el archivo desde la sección "Recursos descargables" a tu celular o computadora. Luego abre Gemini, toca el botón "+" junto al cuadro donde escribes tu prompt, selecciona "Subir archivos" y pega el prompt recomendado.',
      order: 2,
      published: true,
    },
    {
      id: 'faq-3',
      question: '¿Por qué usamos la metodología PARTS en lugar de hacer preguntas cortas?',
      answer:
        'Cuando defines Persona, Acción, Resultado, Tono y Soporte (PARTS), eliminas la ambigüedad. Gemini entiende exactamente el nivel técnico requerido, el formato en el que necesitas la respuesta (tabla, código, lista) y el contexto específico de tu carrera.',
      order: 3,
      published: true,
    },
    {
      id: 'faq-4',
      question: '¿Cómo puedo contactar al Estudiante Embajador si tengo dudas sobre mi proyecto?',
      answer:
        'Puedes acercarte directamente durante la sesión práctica o contactar a Oswaldo Lucas (Estudiante Embajador de Google Gemini en la Universidad Politécnica de Texcoco) por Instagram (@oswaldo.0) o LinkedIn (linkedin.com/in/oswaldo-lucas).',
      order: 4,
      published: true,
    },
  ],
};
