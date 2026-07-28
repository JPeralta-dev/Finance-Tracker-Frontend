---
target: section Categories
total_score: 25
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
p2_count: 2
p3_count: 1
timestamp: 2026-07-28T19-33-58Z
slug: rc-app-features-categories-categories-component-ts
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeleton y empty state sólidos; falta feedback post-acción — sin toast tras create/edit/delete |
| 2 | Match Between System and Real World | 4 | Terminología, metáforas visuales, orden de info — alineación perfecta con modelos mentales financieros |
| 3 | User Control and Freedom | 3 | Confirm dialog da escape en delete; falta undo post-eliminación — la acción es irreversible |
| 4 | Consistency and Standards | 4 | Todas las reglas del sistema (Glass Border, Flat-By-Default, Number Font, spacing 4px) aplicadas uniformemente |
| 5 | Error Prevention | 3 | Delete confirm y defaults protegidos; falta prevención de duplicados, nombres vacíos, double-submit |
| 6 | Recognition Rather Than Recall | 2 | Acciones edit/delete y link "View transactions" ocultos hasta hover — el usuario debe recordar que existen |
| 7 | Flexibility and Efficiency of Use | n/a | Dashboard Operate — no se esperan atajos ni bulk actions |
| 8 | Aesthetic and Minimalist Design | 4 | Cada elemento gana su pixel — una card tiene exactamente lo necesario, Amethyst Pulse una sola vez, sin clutter |
| 9 | Error Recovery | 2 | Confirm dialog i18n-wired existe, pero no hay diagnosis ni recovery para fallos de API |
| 10 | Help and Documentation | n/a | Dashboard Operate |
| **Total** | | **25/32** | **Good (78%)** — a 2 puntos de Excellent |

## Design Specificity: Mixed

La estructura card-grid + progress-bar es un patrón estándar de finance dashboard. Pero la ejecución — Obsidian Glass dark-first, Amethyst Pulse confinado a un solo CTA, Space Grotesk/JetBrains Mono con tabular-nums, la línea `::before` top-highlight — es deliberadamente Flowr. Caería mal en cualquier otro token set. **El esqueleto es genérico; la piel es inconfundiblemente el Glass Vault.**

**Detector:** 0 findings. El scan pasó de 4 findings (bounce-easing, layout-transition, 2× design-system-color) a cero.

## Overall Impression

Una página de categorías disciplinada que sigue sus propias reglas de diseño al pie de la letra — limpia, contenida, premium en reposo. Del critique anterior (19/32, 59%) al actual (25/32, 78%), la mejora es dramática. Lo que queda es el siguiente nivel: feedback post-acción y estados de error que cierren el ciclo de confianza.

## What's Working

- **Jerarquía tipográfica impecable.** Space Grotesk 700 en un solo heading (One Hero Rule ✓), Inter para labels, JetBrains Mono con tabular-nums en currency (Number Font Rule ✓). El sistema tipográfico es consistente de punta a punta.
- **Glass Vault aplicado con disciplina.** Cards planas en reposo, lift sutil + glow en hover, Amethyst Pulse en ≤10% de elementos (Pulse Rule ✓), sin sombras decorativas (Flat-By-Default ✓), top-highlight `::before` presente en cada card.
- **Loading y empty states diseñados.** Skeleton shimmer replica la estructura de cards, empty state guía a crear la primera categoría con CTA directo al modal. Ambos estados están pensados, no son afterthoughts.

## Priority Issues

### [P1] Sin feedback post-acción para create, edit, delete
**Por qué importa:** El usuario completa un CRUD y no ve confirmación visual. Debe escanear manualmente la lista para verificar que el cambio se aplicó. Para deletes especialmente, la ausencia de "Categoría eliminada" — aunque sea un toast transitorio — erosiona la confianza, el principio de marca central.
**Fix:** El componente ya tiene `ToastService` inyectado y los toasts existen en i18n (`common.toasts.category_created`, `category_updated`, `category_deleted`). El `ModalService` emite `categorySaved$` que recarga las categorías — el toast debería dispararse en ese flujo o en el callback de éxito de cada operación CRUD.
**Suggested command:** `$impeccable harden categories`

### [P1] Sin estado de error para carga de datos fallida
**Por qué importa:** Si la API de categorías falla, el skeleton shimmer persiste indefinidamente — no hay fallback UI. Usuarios con conexiones lentas o intermitentes se quedan mirando skeletons sin indicación de qué falló ni cómo recuperarse.
**Fix:** Agregar una rama de error entre loading y empty/data. Mostrar un glass-panel con mensaje claro ("Could not load categories"), botón de retry, y mantener el CTA de crear categoría visible.
**Suggested command:** `$impeccable harden categories`

### [P2] `.stat-value` de currency en Space Grotesk, no JetBrains Mono
**Por qué importa:** El tercer stat item muestra `totalExpenses() | ftCurrency:'short'` en `var(--font-display)` (Space Grotesk). La Number Font Rule exige JetBrains Mono para cualquier string con currency. Es la única violación tipográfica que sobrevivió a las correcciones.
**Fix:** Agregar una clase condicional o usar un pipe wrapper que aplique `var(--font-mono)` cuando el valor es currency. Alternativa: crear `.stat-value--currency` con `font-family: var(--font-mono); font-variant-numeric: tabular-nums;`.
**Suggested command:** `$impeccable typeset categories`

### [P2] `.cat-link` sin tratamiento de touch target — ~14px de altura efectiva
**Por qué importa:** El link "View transactions →" es un elemento interactivo pero su hit area efectiva es ~14px (12px font-size), muy por debajo de 44px en mobile. El `@media (hover: none)` lo hace más visible pero no aumenta el área táctil.
**Fix:** Agregar `padding: 8px 0;` o `min-height: 44px;` en `@media (max-width: 768px)` para `.cat-link`.
**Suggested command:** `$impeccable adapt categories`

### [P3] Shimmer sin `prefers-reduced-motion` explícito
**Por qué importa:** El skeleton shimmer cicla infinitamente a 1.4s. Aunque `styles.scss` tiene una regla global `@media (prefers-reduced-motion: reduce)`, la auditoría de accesibilidad recomienda una alternativa explícita — un gradiente estático en vez de animación.
**Fix:** Envolver `@keyframes shimmer` en `@media (prefers-reduced-motion: no-preference)`. En `@media (prefers-reduced-motion: reduce)`, usar un gradiente estático sin animación.
**Suggested command:** `$impeccable animate categories`

## Persona Red Flags

**Alex (Power User):** Sin atajos de teclado para create/edit/delete. Una categoría a la vez — sin batch selection ni multi-delete. El link "View transactions" navega fuera del contexto de gestión.

**Jordan (First-Timer):** Acciones edit/delete completamente ocultas en reposo — escanea las cards y solo ve datos de solo lectura. Íconos sin labels de texto — puede confundir el ícono X (close) con "cerrar esta vista" en vez de "eliminar categoría". Sin confirmación post-create — va a dudar si funcionó y puede crear duplicados.

**Sam (Accessibility-Dependent):** Shimmer infinito sin escape de reduced-motion — riesgo vestibular. Barra de progreso usa solo color (`cat.color`) como diferenciador — usuarios daltónicos no distinguen barras con hues perceptualment similares. Navegación por teclado requiere Tab en cada card para descubrir controles — escaneo lineal de N cards.

## Minor Observations

- Stats row usa `ftCurrency:'short'` para total expenses pero lo renderiza en Space Grotesk — única violación de Number Font Rule
- `.cat-link` efectivo a ~14px de altura — sin padding/min-height para touch en mobile
- `.cat-icon-wrap` usa `rgba(255,255,255,0.05)` en vez de `var(--border-subtle)` — off-token
- `.btn-new:hover` usa `rgba(217,70,239,0.35)` hardcodeado — debería ser un token
- `cursor: default` en `.cat-card` señala "no clickeable" a pesar de contener hijos clickeables
- A 480px, los stat dividers desaparecen pero tres stats comparten una fila angosta — posible overflow

## Questions to Consider

- ¿Qué pasaría si eliminar una categoría disparara un toast de undo de 5 segundos en vez de un confirm dialog bloqueante — más confiado, menos punitivo?
- ¿Qué pasaría si la card de categoría fuera el modal — click expande inline con campos de edición y preview de transacciones, eliminando el context switch página ↔ modal?
- ¿Qué pasaría si "View transactions" fuera un sparkline en miniatura en la card mostrando los últimos 30 días de gasto — la data cuenta la historia sin navegar?
