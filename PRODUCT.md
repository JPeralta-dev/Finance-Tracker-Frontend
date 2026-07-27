# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary**: Jóvenes profesionales (25–35) con ingresos estables que carecen de visibilidad clara sobre sus finanzas. Saben que ganan bien pero no saben a dónde se va el dinero. Buscan orden sin la complejidad, el lenguaje corporativo, ni la fricción de una app bancaria tradicional.

**Secondary** (implied by feature set): Usuarios que ya alcanzaron control básico y quieren planificar a futuro (goals, AI insights, pockets). El tier premium existe para este segmento.

## Product Purpose

Flowr Finance convierte el tracking financiero personal en un hábito sin fricción. El usuario registra gastos e ingresos desde donde ya está — WhatsApp, Telegram, Gmail — sin necesidad de abrir otra app. Cuando quiere analizar, el dashboard web le muestra su situación completa en segundos y le da recomendaciones accionables basadas en IA.

El éxito se mide en que el usuario responda tres preguntas en menos de 30 segundos:
1. ¿Cuál es mi situación financiera actual?
2. ¿Qué cambió recientemente?
3. ¿Qué debería hacer ahora?

## Positioning

Flowr Finance compite contra tres alternativas reales del usuario:
- **Apps bancarias**: demasiado complejas, lentas, llenas de productos que no pidió.
- **Otras apps de finanzas personales** (Wallet, Spendee, Money Manager): requieren abrir una app dedicada para cada registro.
- **Planilla de Excel / Notion**: flexibles pero sin automatización, sin insights, sin multicanal.

El mecanismo que ninguna de las alternativas puede copiar sin cambiar su producto entero: **registrar desde WhatsApp, Telegram o Gmail sin salir del chat**. El usuario responde un mensaje, Flowr Finance categoriza y registra. La app web es el destino de consulta y análisis, no el punto de entrada obligatorio.

**Pilares diferenciadores**:
1. **Multicanal real**: WhatsApp, Telegram y Gmail como canales de entrada de transacciones.
2. **AI Insights**: Predicción de patrones de gasto, alertas tempranas, recomendaciones accionables.
3. **Simplicidad radical**: Entrar, ver tu situación, registrar, salir. Sin dashboards genéricos, sin complejidad innecesaria.

## Operating Context

- **Ambiente principal**: Web app (Angular 17 SPA, responsive), pero la entrada de datos ocurre mayoritariamente en chats de mensajería desde el celular.
- **Flujo típico**: El usuario registra gastos sobre la marcha desde WhatsApp/Telegram. En momentos de pausa (escritorio, tablet, sofá), abre el dashboard web para revisar analytics, ajustar categorías, o planificar con goals.
- **Herramientas del ecosistema**: Backend separado (Express + MongoDB), bot de Telegram propio, integraciones en desarrollo con WhatsApp Business API y Gmail API.
- **Ritual de uso**: Registro micro (5 segundos, chat) + consulta macro (2–5 minutos, dashboard).

## Capabilities and Constraints

### Capacidades actuales (web app)
- Dashboard financiero con KPIs (balance, ingresos, egresos, tasa de ahorro)
- Lista de transacciones con filtros, búsqueda y paginación
- Creación y edición de transacciones
- Categorías con íconos, colores y progreso de presupuesto
- Analytics con gráficos de evolución mensual y distribución por categoría
- Perfil de usuario
- Settings (tema claro/oscuro, idioma, moneda)
- Autenticación (registro, login, forgot password)
- Landing page pública

### Capacidades premium (suscripción requerida)
- Goals: metas de ahorro con tracking de progreso
- AI Insights: análisis predictivo y recomendaciones
- Pockets: separación de dinero en bolsillos virtuales

### Canales
- **Telegram bot**: Activo — registro de transacciones por chat
- **WhatsApp**: En desarrollo — registro de transacciones vía WhatsApp Business API
- **Gmail**: En desarrollo — extracción de transacciones desde recibos por email

### Capacidades planeadas o en backlog
- Plan de referidos (ruta `/referral` existe, sin funcionalidad completa)
- Página de suscripción (ruta `/subscription` existe)
- Páginas legales (Términos, Privacidad, Cookies)
- Exportación de datos
- Auto-guardado de drafts en formularios
- Adjuntos de recibos/facturas

### Restricciones técnicas
- Angular 17+ standalone components + signals
- Tailwind CSS 3 con design tokens sincronizados en CSS custom properties + Tailwind config
- Testing: Jasmine + Karma (sin migración a Jest confirmada)
- Mock data como fallback; API real conmutada por feature flag
- REST API contract documentado en README
- Backend en Express + MongoDB (repositorio separado o subdirectorio `backend/`)

### Decisiones de producto no resueltas
- Plan de precios concreto (estructura de tiers y montos)
- Estrategia de monetización de canales (¿son premium, freemium, o por uso?)
- Si los canales WhatsApp/Gmail requieren verificación de negocio de Meta/Google
- Si el producto es B2C exclusivamente o contempla B2B (empresas, equipos)

## Brand Commitments

- **Nombre**: Flowr Finance
- **Identidad visual**: "Obsidian Glass" — diseño dark-first con fondo deep plum (#120B1A), superficies con glass morphism (blur + transparencia), acento gradient fuchsia → purple → violet
- **Tipografía**: Space Grotesk para headings/display, Inter para cuerpo, JetBrains Mono para datos numéricos
- **Voz de producto**: Profesional pero cálida, directa, sin jerga financiera innecesaria. Habla como un asesor de confianza, no como un banco.
- **Modelo de negocio**: Freemium con tier premium que desbloquea Goals, AI Insights y Pockets
- **Bot de Telegram**: Es parte del producto, no un add-on. La experiencia multicanal es constitutiva de la propuesta de valor.

## Evidence on Hand

- `UX-AUDIT.md` — Auditoría completa de UX (270 líneas) con issues categorizados por severidad y plan de implementación en 5 bloques
- `README.md` — Documentación técnica, API contract completo, estructura de carpetas
- `tailwind.config.ts` — Design system completo (colores, tipografía, spacing, shadows, animaciones)
- `src/styles.scss` — CSS custom properties sincronizadas + utilidades globales (glass panels, scroll animations, modales)
- `src/styles/_tokens.scss` — Tokens adicionales de diseño
- Código fuente completo de todas las features listadas en Capacidades
- **Ausencias**: No hay testimonios de usuarios reales, métricas de uso, case studies, ni assets de marca más allá del código. Toda métrica o claim de adopción debe ser verificable o marcada como placeholder.

## Product Principles

1. **Claridad sobre Features**: La información financiera debe ser legible y accionable en menos de 3 segundos. El usuario no viene a explorar — viene a entender y decidir.

2. **Confianza ante todo**: El diseño debe transmitir seriedad y control. Nada de gamificación, animaciones distractivas, ni estética "crypto app". Es plata real de personas reales.

3. **Simplicidad radical**: Registrar un gasto debe tomar menos de 5 segundos. Los canales de chat eliminan la fricción de abrir una app dedicada. La app web es para análisis, no para data entry.

4. **Control del usuario**: Cada número tiene dueño. El usuario siempre sabe qué pasó, cuándo, y por qué. Sin sorpresas, sin cálculos ocultos, sin decisiones tomadas por el sistema sin mostrar el razonamiento.

5. **Los números son sagrados**: Los datos financieros no se animan, no se decoran, no se distorsionan. Animaciones solo para comunicar cambios (confirmación, transición entre estados), nunca para entretener.

## Accessibility & Inclusion

- Soporte completo para `prefers-reduced-motion` (animaciones se desactivan globalmente)
- Focus rings visibles para navegación por teclado (`focus-visible`)
- Contraste verificado en ambos temas (dark y light)
- La app debe ser usable por cualquier persona adulta que maneje finanzas personales, sin requerir alfabetización financiera avanzada
- Idioma: UI actual en inglés, con capacidad de i18n contemplada en settings
