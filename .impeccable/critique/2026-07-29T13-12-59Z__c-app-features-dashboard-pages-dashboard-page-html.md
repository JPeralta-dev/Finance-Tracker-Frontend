---
target: src/app/features/dashboard/pages/dashboard.page.html
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
p2_count: 2
p3_count: 1
timestamp: 2026-07-29T13-12-59Z
slug: c-app-features-dashboard-pages-dashboard-page-html
---
# Critique Report: Flowr Finance Dashboard Home

Method: dual-agent (A: ses_0520c8c3cffeNhDt8PWxeZPtNw · B: ses_0520c7a75ffeAjdU7APilBJobJ)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading/error/empty bien cubiertos; activity date labels usan strings hardcodeados |
| 2 | Match System / Real World | 3 | Lenguaje financiero apropiado; "Savings Rate" sin explicación contextual |
| 3 | User Control and Freedom | 3 | Skip link, retry, tour dismiss; sin personalización ni filtros de dashboard |
| 4 | Consistency and Standards | 2 | Activity amounts violan Number Font Rule; stat cards marcadas interactivas sin acción |
| 5 | Error Prevention | 2 | Página read-only limita el riesgo; role="button" sin onClick es false affordance |
| 6 | Recognition Rather Than Recall | 3 | KPIs, chart, activity visibles de un vistazo; sin tooltips en métricas financieras |
| 7 | Flexibility and Efficiency | 2 | Stagger animation relentiza visitas repetidas; sin atajos de teclado; chart fijo |
| 8 | Aesthetic and Minimalist Design | 4 | Obsidian Glass ejecutado con disciplina; acento restringido; profundidad por blur |
| 9 | Error Recovery | 3 | Retry + toast en fallos; partial-render elegante; mensajes de error genéricos |
| 10 | Help and Documentation | 2 | Tour existe pero es one-shot; sin tooltips contextuales para KPIs ni valor premium |
| **Total** | | **27/40** | **Acceptable (68%)** |

## Design Specificity Verdict

La ejecución visual es inconfundiblemente Flowr Finance — Obsidian Glass con disciplina quirúrgica. La arquitectura de información no lo es — el dashboard sigue el template commodity de cualquier fintech. La omisión más grave: el diferenciador multicanal (WhatsApp/Telegram/Gmail) es invisible. Cero badges de canal. El detector encontró 20 hallazgos: 4 FP, 4 debatibles, 12 genuinos (6 radios fuera de escala, 5 colores sin documentar, 1 side-tab).

## Overall Impression

El dashboard logra su promesa estética pero el modelo mental es un PFM genérico con wallpaper Flowr Finance. Para un usuario free, el dashboard termina no con un next step accionable, sino con un pitch de ventas repetido 3 veces.

## What's Working

1. Glass depth disciplinado — Flat-By-Default Rule seguida al pie, sin sombras en reposo
2. Amethyst Pulse con restricción — exactamente 2 usos en el dashboard con datos (≤10% pantalla)
3. Cobertura de estados completa — loading, error, empty, ready, trial, tour, premium prompts

## Priority Issues

### [P1] Stat cards marcadas como interactivas pero no hacen nada
Las 4 KPI cards tienen tabindex="0", role="button", aria-label, pero sin handlers de click/enter. False affordance que erosiona confianza. Fix: wirear drill-down o remover role.

### [P1] Activity date labels hardcodeados en español
groups() asigna 'Hoy', 'Ayer', 'Esta semana', 'Anterior' como strings bare. Rompen i18n. Fix: translation keys con translate pipe.

### [P1] Activity row amounts violan Number Font Rule
Montos en Recent Activity renderizan en Inter en vez de JetBrains Mono. Violación de contrato de diseño. Fix: font-family: var(--font-mono).

### [P2] Dashboard termina en pitch de ventas para free users
3 filas consecutivas de premium-gated content. El usuario free se va sintiendo que usa un demo. Fix: colapsar premium en una sección, mostrar un insight gratuito.

### [P2] 12 detector findings genuinos
6 radios fuera de escala, 5 colores sin documentar, 1 side-tab en ai-insights-card.

### [P3] Stagger animation degrada visitas repetidas
9+ secciones con delays escalonados toman ~600ms. Power user que visita 3×/día se frustra. Fix: detectar revisit y saltar animación.

## Persona Red Flags

**Alex (Power User)**: Sin atajos de teclado. Stagger cascade frustra en visitas repetidas. Stat cards parecen interactivas pero no lo son. Chart fijo. ChartColorCache stale en theme switch.

**Jordan (First-Timer)**: "Savings Rate" sin explicación. Premium blur previews no muestran valor concreto. Loading sin indicador de progreso.

**Valeria (Profesional ocupada, spanish-native)**: Cero indicadores de origen de canal en transactions. Greeting sin personalización de actividad reciente.

## Minor Observations

- Comentario SCSS stale (Row 1 mal documentado)
- Balance KPI usa gradient text; los otros 3 KPIs flat — jerarquía visual inconsistente entre iguales
- "No balance" insight usa var(--success) cuando es semánticamente neutral
- Load More usa arrowDown pero el patrón es expansión, no navegación
- var(--accent-primary, #9D50BB) es un leftover de diseño anterior
