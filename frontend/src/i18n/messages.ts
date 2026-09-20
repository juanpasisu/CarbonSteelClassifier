export type Locale = 'es' | 'en'
export type Theme = 'light' | 'dark'

export type MessageKey =
  | 'nav.home'
  | 'nav.analyze'
  | 'nav.levels'
  | 'nav.howItWorks'
  | 'nav.microstructures'
  | 'nav.about'
  | 'nav.menu'
  | 'nav.close'
  | 'hero.university'
  | 'hero.degree'
  | 'hero.eyebrow'
  | 'hero.tagline'
  | 'hero.headline'
  | 'hero.subtitle'
  | 'hero.cta'
  | 'hero.ctaExplore'
  | 'hero.school'
  | 'hero.feat1'
  | 'hero.feat2'
  | 'hero.feat3'
  | 'hero.feat4'
  | 'hero.featSlogan'
  | 'hero.demoTitle'
  | 'hero.demoConfidence'
  | 'hero.demoNote'
  | 'hero.headerDegree'
  | 'logo.uisAlt'
  | 'analyze.title'
  | 'analyze.kicker'
  | 'analyze.subtitle'
  | 'analyze.cardTitle'
  | 'analyze.cardHint'
  | 'uploader.dropTitle'
  | 'uploader.dropHint'
  | 'uploader.select'
  | 'uploader.analyzeOne'
  | 'uploader.analyzeMany'
  | 'uploader.analyzing'
  | 'uploader.preview'
  | 'uploader.removeAll'
  | 'uploader.remove'
  | 'uploader.skipped'
  | 'uploader.error.unsupported'
  | 'uploader.error.size'
  | 'uploader.error.batchLimit'
  | 'how.title'
  | 'how.subtitle'
  | 'how.step'
  | 'how.s1.title'
  | 'how.s1.desc'
  | 'how.s2.title'
  | 'how.s2.desc'
  | 'how.s3.title'
  | 'how.s3.desc'
  | 'learning.title'
  | 'learning.body'
  | 'about.title'
  | 'about.degree'
  | 'about.body'
  | 'about.pill1'
  | 'about.pill2'
  | 'about.pill3'
  | 'about.pill4'
  | 'about.pill5'
  | 'classes.title'
  | 'classes.question'
  | 'classes.subtitle'
  | 'classes.loadError'
  | 'classes.seeMore'
  | 'classes.seeLess'
  | 'batch.summary'
  | 'batch.processedOne'
  | 'batch.processedMany'
  | 'batch.success'
  | 'batch.failed'
  | 'batch.avgConfidence'
  | 'batch.classDistribution'
  | 'batch.file'
  | 'batch.class'
  | 'batch.confidence'
  | 'batch.error'
  | 'batch.detail'
  | 'batch.resultOf'
  | 'batch.analysisFailed'
  | 'result.identified'
  | 'result.confidence'
  | 'result.file'
  | 'result.model'
  | 'result.image'
  | 'result.probabilities'
  | 'result.previewUnavailable'
  | 'result.infoTitle'
  | 'result.infoNote'
  | 'result.phasesTitle'
  | 'result.phasePresent'
  | 'result.phaseAbsent'
  | 'error.invalidImage'
  | 'error.modelUnavailable'
  | 'error.analyzeFailed'
  | 'error.apiUnreachable'
  | 'error.unexpected'
  | 'error.catalog'
  | 'error.allFailed'
  | 'error.someFailed'
  | 'progress.analyzing'
  | 'footer.school'
  | 'footer.project'
  | 'footer.authors'
  | 'footer.direction'
  | 'footer.director'
  | 'footer.coDirector'
  | 'footer.public'
  | 'footer.quote'
  | 'footer.quoteAuthor'
  | 'footer.location'
  | 'footer.credit'
  | 'theme.toDark'
  | 'theme.toLight'
  | 'lang.toEnglish'
  | 'lang.toSpanish'
  | 'logo.alt'
  | 'levels.kicker'
  | 'levels.title'
  | 'levels.subtitle'
  | 'levels.progress'
  | 'levels.step'
  | 'levels.back'
  | 'levels.basic.badge'
  | 'levels.basic.title'
  | 'levels.basic.subtitle'
  | 'levels.basic.points'
  | 'levels.basic.cta'
  | 'levels.beginner.badge'
  | 'levels.beginner.title'
  | 'levels.beginner.subtitle'
  | 'levels.beginner.points'
  | 'levels.beginner.cta'
  | 'levels.expert.badge'
  | 'levels.expert.title'
  | 'levels.expert.subtitle'
  | 'levels.expert.points'
  | 'levels.expert.cta'
  | 'basic.hint'
  | 'basic.tabLearn'
  | 'basic.tabQuiz'
  | 'basic.morphology'
  | 'basic.science'
  | 'basic.startQuiz'
  | 'basic.quizPrompt'
  | 'basic.quizProgress'
  | 'basic.quizDone'
  | 'basic.quizFeedback'
  | 'basic.quizRetry'
  | 'basic.backToLearn'
  | 'beginner.hint'
  | 'beginner.uploadHint'
  | 'beginner.continue'
  | 'beginner.yourImage'
  | 'beginner.questionProgress'
  | 'beginner.q.morphology'
  | 'beginner.q.class'
  | 'beginner.q.trait'
  | 'beginner.q.magnification'
  | 'beginner.revealCnn'
  | 'beginner.compareTitle'
  | 'beginner.yourAnswer'
  | 'beginner.cnnAnswer'
  | 'beginner.match'
  | 'beginner.mismatch'
  | 'beginner.savedMorphology'
  | 'beginner.savedTrait'
  | 'beginner.savedMag'
  | 'beginner.tryAnother'
  | 'expert.hint'
  | 'basic.shuffleImage'
  | 'basic.nextQuestion'
  | 'basic.seeScore'
  | 'basic.streak'
  | 'mascot.alt'
  | 'mascot.welcome'
  | 'mascot.learn'
  | 'mascot.quiz'
  | 'mascot.correct'
  | 'mascot.wrong'
  | 'mascot.quizWin'
  | 'mascot.quizRetry'

type Dictionary = Record<MessageKey, string>

const es: Dictionary = {
  'nav.home': 'Inicio',
  'nav.analyze': 'Analizar',
  'nav.levels': 'Niveles',
  'nav.howItWorks': '¿Cómo funciona?',
  'nav.microstructures': 'Microestructuras',
  'nav.about': 'Sobre el proyecto',
  'nav.menu': 'Abrir menú',
  'nav.close': 'Cerrar menú',
  'hero.university': 'Universidad Industrial de Santander',
  'hero.degree': 'Proyecto de grado',
  'hero.eyebrow':
    'Ingeniería Metalúrgica · Universidad Industrial de Santander',
  'hero.tagline': 'Inteligencia artificial al servicio de la metalografía.',
  'hero.headline':
    'Identificación inteligente de microestructuras en aceros al carbono',
  'hero.subtitle':
    'Aprende, practica y analiza micrografías de aceros al carbono en tres niveles didácticos, con apoyo de una red neuronal convolucional.',
  'hero.cta': 'Elegir un nivel',
  'hero.ctaExplore': 'Conocer más',
  'hero.school':
    'Escuela de Ingeniería Metalúrgica y Ciencia de los Materiales',
  'hero.feat1': 'Redes neuronales convolucionales',
  'hero.feat2': '7 microestructuras',
  'hero.feat3': 'Acceso directo sin registro',
  'hero.feat4': 'Herramienta didáctica',
  'hero.featSlogan':
    'Ciencia de los materiales para un mejor futuro',
  'hero.demoTitle': 'Resultado de análisis',
  'hero.demoConfidence': 'Confianza: {value}',
  'hero.demoNote':
    'Ejemplo visual ilustrativo. No representa una predicción en vivo del modelo.',
  'hero.headerDegree': 'Proyecto de grado · Ingeniería Metalúrgica',
  'logo.uisAlt': 'Logo Universidad Industrial de Santander',
  'levels.kicker': 'Ruta de aprendizaje',
  'levels.title': 'Elige tu nivel y empieza',
  'levels.subtitle':
    'Tres plataformas grandes: aprende morfología, practica tu criterio o pide la predicción directa de la CNN.',
  'levels.progress': 'Progresión sugerida: Básica → Principiante → Experto',
  'levels.step': 'Nivel {n}',
  'levels.back': 'Volver a niveles',
  'levels.basic.badge': 'Básica',
  'levels.basic.title': 'Aprende a identificar',
  'levels.basic.subtitle':
    'Explora el banco de micrografías, la morfología característica y el efecto del aumento.',
  'levels.basic.points':
    'Tarjetas visuales por microestructura|Comparación interactiva de aumentos|Post-saberes con imágenes reales',
  'levels.basic.cta': 'Entrar a Básica',
  'levels.beginner.badge': 'Principiante',
  'levels.beginner.title': 'Identifica y comprueba',
  'levels.beginner.subtitle':
    'Sube una micrografía, responde preguntas visuales y luego compara tu criterio con la CNN.',
  'levels.beginner.points':
    'Preguntas por tarjetas y selección|Registro de tu respuesta|Comparación con la predicción CNN',
  'levels.beginner.cta': 'Entrar a Principiante',
  'levels.expert.badge': 'Experto',
  'levels.expert.title': 'Predicción CNN',
  'levels.expert.subtitle':
    'Modo directo: carga una o varias imágenes y obtén clase, confianza e información complementaria.',
  'levels.expert.points':
    'Sin preguntas previas|Análisis individual o por lote|Resultados listos para revisión',
  'levels.expert.cta': 'Entrar a Experto',
  'basic.hint':
    'Estudia cada microestructura con ejemplos visuales y comprueba lo aprendido con un breve post-saberes.',
  'basic.tabLearn': 'Aprender',
  'basic.tabQuiz': 'Post-saberes',
  'basic.morphology': 'Morfología característica',
  'basic.science': 'Ficha científica',
  'basic.startQuiz': 'Pasar al post-saberes',
  'basic.quizPrompt': '¿Qué microestructura muestra esta micrografía?',
  'basic.quizProgress': 'Pregunta {current} de {total}',
  'basic.quizDone': 'Comprobación completada',
  'basic.quizFeedback':
    'Usa el resultado para reforzar las diferencias morfológicas. Puedes repetir el ejercicio con nuevas imágenes del banco.',
  'basic.quizRetry': 'Intentar de nuevo',
  'basic.backToLearn': 'Volver a aprender',
  'beginner.hint':
    'Primero interpreta la micrografía; después la CNN revelará su predicción para comparar.',
  'beginner.uploadHint':
    'Sube una micrografía. Antes de ver la CNN, responderás preguntas visuales sobre morfología, clase, rasgos y aumento.',
  'beginner.continue': 'Continuar a las preguntas',
  'beginner.yourImage': 'Tu micrografía',
  'beginner.questionProgress': 'Pregunta {current} de {total}',
  'beginner.q.morphology': '¿Qué morfología predominante observas?',
  'beginner.q.class': '¿Cuál crees que es la microestructura?',
  'beginner.q.trait': '¿Qué rasgo visual destaca más?',
  'beginner.q.magnification': '¿Aproximadamente a qué aumento parece estar tomada?',
  'beginner.revealCnn': 'Ver predicción de la CNN',
  'beginner.compareTitle': 'Tu criterio vs. la CNN',
  'beginner.yourAnswer': 'Tu identificación',
  'beginner.cnnAnswer': 'Predicción CNN',
  'beginner.match': 'Coincidieron. Buen criterio metalográfico.',
  'beginner.mismatch':
    'No coincidieron. Revisa la morfología y la explicación breve debajo.',
  'beginner.savedMorphology': 'Morfología elegida',
  'beginner.savedTrait': 'Rasgo elegido',
  'beginner.savedMag': 'Aumento estimado',
  'beginner.tryAnother': 'Analizar otra imagen',
  'expert.hint':
    'Modo directo de predicción: la CNN responde de inmediato con clase, confianza y detalle.',
  'basic.shuffleImage': 'Otra micrografía',
  'basic.nextQuestion': 'Siguiente',
  'basic.seeScore': 'Ver puntaje',
  'basic.streak': 'Racha ×{n}',
  'mascot.alt': 'Babilla, mascota de MetalVision AI',
  'mascot.welcome':
    '¡Hola! Soy Babi. Elige un nivel y aprendamos a leer microestructuras juntos.',
  'mascot.learn': 'Mira varias fotos de la misma clase: el patrón se repite.',
  'mascot.quiz': '¡A jugar! Elige la microestructura correcta.',
  'mascot.correct': '¡Bien! Esa morfología encaja.',
  'mascot.wrong': 'Casi. Revisa láminas, agujas o bordes de grano.',
  'mascot.quizWin': '¡Excelente ronda! Ya dominas varias clases.',
  'mascot.quizRetry': 'Buen intento. Repite el post-saberes con nuevas fotos.',
  'analyze.title': 'Analizar',
  'analyze.kicker': 'Herramienta científica',
  'analyze.subtitle':
    'Selecciona o arrastra una o varias micrografías. El modelo CNN devolverá la clase estimada y su confianza.',
  'analyze.cardTitle': 'Analiza tu microestructura',
  'analyze.cardHint': 'Sube una imagen metalográfica para comenzar.',
  'uploader.dropTitle':
    'Arrastra una o varias imágenes, o selecciónalas desde tu equipo',
  'uploader.dropHint':
    'Formatos: JPG, PNG, WEBP, TIFF · máx. 25 MB c/u · hasta {max} por lote · sin almacenamiento permanente',
  'uploader.select': 'Seleccionar imagen',
  'uploader.analyzeOne': 'Analizar microestructura',
  'uploader.analyzeMany': 'Analizar {count} microestructuras',
  'uploader.analyzing': 'Analizando…',
  'uploader.preview': 'Previsualización · {count} {unit}',
  'uploader.removeAll': 'Quitar todas',
  'uploader.remove': 'Quitar',
  'uploader.skipped': 'Se omitieron {count} archivo(s). {details}',
  'uploader.error.unsupported':
    'Formato no soportado. Usa JPG, PNG, WEBP o TIFF.',
  'uploader.error.size': 'Cada archivo debe pesar entre 1 byte y 25 MB.',
  'uploader.error.batchLimit': 'límite de {max} imágenes por lote',
  'how.title': '¿Cómo funciona?',
  'how.subtitle': 'Una ruta didáctica en tres niveles',
  'how.step': 'Paso 0{n}',
  'how.s1.title': 'Aprende',
  'how.s1.desc':
    'Estudia morfología y aumentos con el banco de micrografías en el nivel Básica.',
  'how.s2.title': 'Practica',
  'how.s2.desc':
    'En Principiante respondes primero y luego contrastas tu criterio con la CNN.',
  'how.s3.title': 'Predice',
  'how.s3.desc':
    'En Experto obtienes de inmediato la clase estimada y su confianza.',
  'learning.title': 'Una herramienta para el aprendizaje',
  'learning.body':
    'MetalVision AI es una herramienta didáctica desarrollada para apoyar a los estudiantes en el reconocimiento de microestructuras de aceros al carbono, complementando su formación en metalografía. No sustituye el criterio del ingeniero ni el análisis metalográfico tradicional.',
  'about.title': 'Sobre el proyecto',
  'about.degree': 'Trabajo de grado · MetalVision AI',
  'about.body':
    'Proyecto académico de la Universidad Industrial de Santander que integra metalurgia, metalografía, procesamiento de imágenes e inteligencia artificial mediante redes neuronales convolucionales.',
  'about.pill1': 'Metalurgia',
  'about.pill2': 'Metalografía',
  'about.pill3': 'Procesamiento de imágenes',
  'about.pill4': 'Inteligencia Artificial',
  'about.pill5': 'Redes Neuronales Convolucionales',
  'classes.title': 'Microestructuras reconocidas',
  'classes.question': '¿Qué puede identificar MetalVision AI?',
  'classes.subtitle':
    'El modelo ha sido entrenado para reconocer fases y microconstituyentes presentes en aceros al carbono.',
  'classes.loadError': 'No se pudo cargar el catálogo.',
  'classes.seeMore': 'Ver más',
  'classes.seeLess': 'Ver menos',
  'batch.summary': 'Resumen del lote',
  'batch.processedOne': '{count} imagen procesada',
  'batch.processedMany': '{count} imágenes procesadas',
  'batch.success': 'Exitosas',
  'batch.failed': 'Con error',
  'batch.avgConfidence': 'Confianza media',
  'batch.classDistribution': 'Distribución de clases predichas',
  'batch.file': 'Archivo',
  'batch.class': 'Clase',
  'batch.confidence': 'Confianza',
  'batch.error': 'Error',
  'batch.detail': 'Detalle por imagen',
  'batch.resultOf': 'Resultado {index} de {total}',
  'batch.analysisFailed': 'No se pudo completar el análisis.',
  'result.identified': 'Microestructura identificada',
  'result.confidence': 'Nivel de confianza: {value}',
  'result.file': 'Archivo: {name}',
  'result.model': 'Modelo {name} · v{version}',
  'result.image': 'Imagen analizada',
  'result.probabilities': 'Distribución de probabilidades',
  'result.previewUnavailable': 'Vista previa no disponible.',
  'result.infoTitle': 'Información sobre la microestructura',
  'result.infoNote':
    'Texto educativo de referencia. No forma parte de la predicción de la CNN.',
  'result.phasesTitle': 'Fases y constituyentes (ferrita, perlita, cementita)',
  'result.phasePresent': 'Presente',
  'result.phaseAbsent': 'No identificada',
  'error.invalidImage':
    'La imagen no es válida. Verifica el formato, el tamaño (máx. 25 MB) y que el archivo no esté dañado.',
  'error.modelUnavailable':
    'El análisis aún no está disponible. El modelo CNN se integrará en una fase posterior.',
  'error.analyzeFailed':
    'No se pudo completar el análisis. Intenta de nuevo en unos momentos.',
  'error.apiUnreachable':
    'No se pudo conectar con la API. Comprueba que el backend esté en marcha en http://127.0.0.1:8000.',
  'error.unexpected': 'Ocurrió un error inesperado.',
  'error.catalog': 'No se pudo cargar el catálogo.',
  'error.allFailed':
    'No se pudo completar el análisis de ninguna imagen del lote.',
  'error.someFailed':
    '{count} imagen(es) no pudieron analizarse. Revisa el detalle del lote.',
  'progress.analyzing': 'Analizando {current}/{total}…',
  'footer.school':
    'Escuela de Ingeniería Metalúrgica y Ciencia de los Materiales',
  'footer.project':
    'Proyecto académico de identificación de microestructuras en aceros al carbono mediante redes neuronales convolucionales.',
  'footer.authors': 'Autores',
  'footer.direction': 'Dirección',
  'footer.director': 'Director',
  'footer.coDirector': 'Co-directora',
  'footer.public': 'Plataforma de acceso público · Uso académico y científico',
  'footer.quote':
    'Cuando crear se vuelve fácil, tener una idea propia se vuelve lo difícil.',
  'footer.quoteAuthor': 'Juan P. Fajardo',
  'footer.location': 'Bucaramanga, Colombia',
  'footer.credit':
    'MetalVision AI · Proyecto de grado · Ingeniería Metalúrgica · UIS',
  'theme.toDark': 'Activar modo nocturno',
  'theme.toLight': 'Activar modo claro',
  'lang.toEnglish': 'Switch to English',
  'lang.toSpanish': 'Cambiar a español',
  'logo.alt':
    'Logo Escuela de Ingeniería Metalúrgica y Ciencia de los Materiales',
}

const en: Dictionary = {
  'nav.home': 'Home',
  'nav.analyze': 'Analyze',
  'nav.levels': 'Levels',
  'nav.howItWorks': 'How it works',
  'nav.microstructures': 'Microstructures',
  'nav.about': 'About the project',
  'nav.menu': 'Open menu',
  'nav.close': 'Close menu',
  'hero.university': 'Universidad Industrial de Santander',
  'hero.degree': 'Degree project',
  'hero.eyebrow':
    'Metallurgical Engineering · Universidad Industrial de Santander',
  'hero.tagline': 'Artificial intelligence at the service of metallography.',
  'hero.headline':
    'Intelligent identification of microstructures in carbon steels',
  'hero.subtitle':
    'Learn, practice, and analyze carbon-steel micrographs across three educational levels, supported by a convolutional neural network.',
  'hero.cta': 'Choose a level',
  'hero.ctaExplore': 'Learn more',
  'hero.school':
    'School of Metallurgical Engineering and Materials Science',
  'hero.feat1': 'Convolutional neural networks',
  'hero.feat2': '7 microstructures',
  'hero.feat3': 'Direct access, no sign-up',
  'hero.feat4': 'Educational tool',
  'hero.featSlogan': 'Materials science for a better future',
  'hero.demoTitle': 'Analysis result',
  'hero.demoConfidence': 'Confidence: {value}',
  'hero.demoNote':
    'Illustrative visual example. Not a live prediction from the model.',
  'hero.headerDegree': 'Degree project · Metallurgical Engineering',
  'logo.uisAlt': 'Universidad Industrial de Santander logo',
  'levels.kicker': 'Learning path',
  'levels.title': 'Choose your level and start',
  'levels.subtitle':
    'Three big platforms: learn morphology, practice your judgment, or request a direct CNN prediction.',
  'levels.progress': 'Suggested path: Basic → Beginner → Expert',
  'levels.step': 'Level {n}',
  'levels.back': 'Back to levels',
  'levels.basic.badge': 'Basic',
  'levels.basic.title': 'Learn to identify',
  'levels.basic.subtitle':
    'Explore the micrograph bank, characteristic morphology, and how magnification changes identification.',
  'levels.basic.points':
    'Visual cards per microstructure|Interactive magnification comparison|Post-check with real images',
  'levels.basic.cta': 'Enter Basic',
  'levels.beginner.badge': 'Beginner',
  'levels.beginner.title': 'Identify and check',
  'levels.beginner.subtitle':
    'Upload a micrograph, answer visual questions, then compare your judgment with the CNN.',
  'levels.beginner.points':
    'Card and multiple-choice questions|Your answers are recorded|Side-by-side CNN comparison',
  'levels.beginner.cta': 'Enter Beginner',
  'levels.expert.badge': 'Expert',
  'levels.expert.title': 'CNN prediction',
  'levels.expert.subtitle':
    'Direct mode: upload one or more images and get class, confidence, and complementary details.',
  'levels.expert.points':
    'No prior questions|Single or batch analysis|Results ready for review',
  'levels.expert.cta': 'Enter Expert',
  'basic.hint':
    'Study each microstructure with visual examples and check what you learned in a short post-quiz.',
  'basic.tabLearn': 'Learn',
  'basic.tabQuiz': 'Post-check',
  'basic.morphology': 'Characteristic morphology',
  'basic.science': 'Scientific card',
  'basic.startQuiz': 'Go to post-check',
  'basic.quizPrompt': 'Which microstructure does this micrograph show?',
  'basic.quizProgress': 'Question {current} of {total}',
  'basic.quizDone': 'Check completed',
  'basic.quizFeedback':
    'Use the score to reinforce morphological differences. You can retry with a new set from the image bank.',
  'basic.quizRetry': 'Try again',
  'basic.backToLearn': 'Back to learning',
  'beginner.hint':
    'Interpret the micrograph first; then the CNN reveals its prediction for comparison.',
  'beginner.uploadHint':
    'Upload a micrograph. Before seeing the CNN, you will answer visual questions on morphology, class, traits, and magnification.',
  'beginner.continue': 'Continue to questions',
  'beginner.yourImage': 'Your micrograph',
  'beginner.questionProgress': 'Question {current} of {total}',
  'beginner.q.morphology': 'Which morphology do you mainly see?',
  'beginner.q.class': 'Which microstructure do you think it is?',
  'beginner.q.trait': 'Which visual trait stands out most?',
  'beginner.q.magnification': 'About what magnification does it look like?',
  'beginner.revealCnn': 'Show CNN prediction',
  'beginner.compareTitle': 'Your judgment vs. the CNN',
  'beginner.yourAnswer': 'Your identification',
  'beginner.cnnAnswer': 'CNN prediction',
  'beginner.match': 'They matched. Solid metallographic judgment.',
  'beginner.mismatch':
    'They did not match. Review the morphology and the short explanation below.',
  'beginner.savedMorphology': 'Chosen morphology',
  'beginner.savedTrait': 'Chosen trait',
  'beginner.savedMag': 'Estimated magnification',
  'beginner.tryAnother': 'Analyze another image',
  'expert.hint':
    'Direct prediction mode: the CNN responds immediately with class, confidence, and detail.',
  'basic.shuffleImage': 'Another micrograph',
  'basic.nextQuestion': 'Next',
  'basic.seeScore': 'See score',
  'basic.streak': 'Streak ×{n}',
  'mascot.alt': 'Babilla, MetalVision AI mascot',
  'mascot.welcome':
    'Hi! I’m Babi. Pick a level and let’s learn to read microstructures together.',
  'mascot.learn': 'Browse several photos of the same class—the pattern repeats.',
  'mascot.quiz': 'Let’s play! Pick the correct microstructure.',
  'mascot.correct': 'Nice! That morphology fits.',
  'mascot.wrong': 'Close. Check lamellae, needles, or grain boundaries.',
  'mascot.quizWin': 'Great round! You’re covering several classes well.',
  'mascot.quizRetry': 'Good try. Replay the post-check with new photos.',
  'analyze.title': 'Analyze',
  'analyze.kicker': 'Scientific tool',
  'analyze.subtitle':
    'Select or drag one or more micrographs. The CNN model will return the estimated class and its confidence.',
  'analyze.cardTitle': 'Analyze your microstructure',
  'analyze.cardHint': 'Upload a metallographic image to get started.',
  'uploader.dropTitle':
    'Drag one or more images, or select them from your device',
  'uploader.dropHint':
    'Formats: JPG, PNG, WEBP, TIFF · max 25 MB each · up to {max} per batch · no permanent storage',
  'uploader.select': 'Select image',
  'uploader.analyzeOne': 'Analyze microstructure',
  'uploader.analyzeMany': 'Analyze {count} microstructures',
  'uploader.analyzing': 'Analyzing…',
  'uploader.preview': 'Preview · {count} {unit}',
  'uploader.removeAll': 'Remove all',
  'uploader.remove': 'Remove',
  'uploader.skipped': 'Skipped {count} file(s). {details}',
  'uploader.error.unsupported':
    'Unsupported format. Use JPG, PNG, WEBP, or TIFF.',
  'uploader.error.size': 'Each file must be between 1 byte and 25 MB.',
  'uploader.error.batchLimit': 'limit of {max} images per batch',
  'how.title': 'How it works',
  'how.subtitle': 'An educational path in three levels',
  'how.step': 'Step 0{n}',
  'how.s1.title': 'Learn',
  'how.s1.desc':
    'Study morphology and magnification with the micrograph bank in Basic.',
  'how.s2.title': 'Practice',
  'how.s2.desc':
    'In Beginner you answer first, then compare your judgment with the CNN.',
  'how.s3.title': 'Predict',
  'how.s3.desc':
    'In Expert you immediately get the estimated class and its confidence.',
  'learning.title': 'A tool for learning',
  'learning.body':
    'MetalVision AI is an educational tool developed to help students recognize carbon-steel microstructures, supporting their metallography training. It does not replace engineering judgment or traditional metallographic analysis.',
  'about.title': 'About the project',
  'about.degree': 'Degree project · MetalVision AI',
  'about.body':
    'An academic project at Universidad Industrial de Santander that integrates metallurgy, metallography, image processing, and artificial intelligence through convolutional neural networks.',
  'about.pill1': 'Metallurgy',
  'about.pill2': 'Metallography',
  'about.pill3': 'Image processing',
  'about.pill4': 'Artificial Intelligence',
  'about.pill5': 'Convolutional Neural Networks',
  'classes.title': 'Recognized microstructures',
  'classes.question': 'What can MetalVision AI identify?',
  'classes.subtitle':
    'The model has been trained to recognize phases and microconstituents present in carbon steels.',
  'classes.loadError': 'Could not load the catalog.',
  'classes.seeMore': 'See more',
  'classes.seeLess': 'See less',
  'batch.summary': 'Batch summary',
  'batch.processedOne': '{count} image processed',
  'batch.processedMany': '{count} images processed',
  'batch.success': 'Successful',
  'batch.failed': 'With errors',
  'batch.avgConfidence': 'Average confidence',
  'batch.classDistribution': 'Predicted class distribution',
  'batch.file': 'File',
  'batch.class': 'Class',
  'batch.confidence': 'Confidence',
  'batch.error': 'Error',
  'batch.detail': 'Per-image detail',
  'batch.resultOf': 'Result {index} of {total}',
  'batch.analysisFailed': 'The analysis could not be completed.',
  'result.identified': 'Identified microstructure',
  'result.confidence': 'Confidence level: {value}',
  'result.file': 'File: {name}',
  'result.model': 'Model {name} · v{version}',
  'result.image': 'Analyzed image',
  'result.probabilities': 'Probability distribution',
  'result.previewUnavailable': 'Preview unavailable.',
  'result.infoTitle': 'About this microstructure',
  'result.infoNote':
    'Educational reference text. It is not part of the CNN prediction.',
  'result.phasesTitle': 'Phases and constituents (ferrite, pearlite, cementite)',
  'result.phasePresent': 'Present',
  'result.phaseAbsent': 'Not identified',
  'error.invalidImage':
    'The image is not valid. Check the format, size (max 25 MB), and that the file is not damaged.',
  'error.modelUnavailable':
    'Analysis is not available yet. The CNN model will be integrated in a later phase.',
  'error.analyzeFailed':
    'The analysis could not be completed. Please try again shortly.',
  'error.apiUnreachable':
    'Could not reach the API. Make sure the backend is running at http://127.0.0.1:8000.',
  'error.unexpected': 'An unexpected error occurred.',
  'error.catalog': 'Could not load the catalog.',
  'error.allFailed': 'None of the images in the batch could be analyzed.',
  'error.someFailed':
    '{count} image(s) could not be analyzed. Check the batch details.',
  'progress.analyzing': 'Analyzing {current}/{total}…',
  'footer.school':
    'School of Metallurgical Engineering and Materials Science',
  'footer.project':
    'Academic project for identifying microstructures in carbon steels using convolutional neural networks.',
  'footer.authors': 'Authors',
  'footer.direction': 'Supervision',
  'footer.director': 'Director',
  'footer.coDirector': 'Co-director',
  'footer.public': 'Public-access platform · Academic and scientific use',
  'footer.quote':
    'When creating becomes easy, having an original idea becomes the hard part.',
  'footer.quoteAuthor': 'Juan P. Fajardo',
  'footer.location': 'Bucaramanga, Colombia',
  'footer.credit':
    'MetalVision AI · Degree project · Metallurgical Engineering · UIS',
  'theme.toDark': 'Enable dark mode',
  'theme.toLight': 'Enable light mode',
  'lang.toEnglish': 'Switch to English',
  'lang.toSpanish': 'Cambiar a español',
  'logo.alt':
    'School of Metallurgical Engineering and Materials Science logo',
}

const dictionaries: Record<Locale, Dictionary> = { es, en }

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let text = dictionaries[locale][key] ?? dictionaries.es[key] ?? key
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}
