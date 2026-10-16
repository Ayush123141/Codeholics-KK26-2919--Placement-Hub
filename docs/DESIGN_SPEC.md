# Reference Design Specification: TechSummitTrainers Re-Theme

**Source:** `https://techsummittrainers.com/` (Analyzed live on desktop & mobile widths)  
**Target Application:** ProofHire (Evidence-Based Placement Hub)  
**Branch:** `feature/student-resume-vacancies`  
**Scope:** Pure visual, layout markup, and design token re-theming. Zero logic or API changes.

---

## 1. Palette & Color Tokens (Exact Sampled Hex & Opacity Values)

### Primary Hue (Warm Golden Amber Scale)
Extracted directly from `:root` variables `--amber`, `--amber-deep`, `--amber-text`, and `--amber-soft`:
- `brand-50` (`#FFFBEB`): Pale golden amber wash for badge backgrounds and active rows.
- `brand-100` (`#FEF3C7`): Soft tinted container highlight.
- `brand-200` (`#FDE68A`): Light golden accent border.
- `brand-300` (`#FCD34D`): Interactive focus and secondary indicators.
- `brand-400` (`#FBBF24`): Medium warm amber highlight.
- `brand-500` (`#F5A300` / `--amber`): **Core primary brand accent**. Used for primary action buttons, active navigation indicators, and focal points.
- `brand-600` (`#D68F00` / `--amber-deep`): Deep amber used for button hover states (`btn-amber:hover`), headline accents (`.hl`), and links.
- `brand-700` (`#A05E00` / `--amber-text`): High-contrast eyebrow text (`.eyebrow`) and pill label text ensuring WCAG AAA accessibility on light backgrounds.
- `brand-800` (`#78350F`): Deep warm brown for contrast text on yellow tints.
- `brand-900` (`#451A03`): Deepest warm amber-brown shade.
- `brand-soft`: `rgba(245, 163, 0, 0.10)` (`--amber-soft`). Used for soft badge chips and icon backgrounds.

### Neutrals (Deep Navy Ink & Slate Scale)
Extracted from `--ink`, `--ink-2`, `--ink-3`, `--slate`, `--paper`, `--paper-alt`:
- `ink` (`#0F1420` / `--ink`): Primary high-contrast typography, primary buttons outline invert, dark section backgrounds (`.cta-sec`).
- `ink-2` (`#171D2C` / `--ink-2`): Dark terminal bar background, secondary deep background.
- `ink-3` (`#242C3D` / `--ink-3`): Dark card borders, deep contrast elements.
- `paper` (`#FFFFFF` / `--paper`): Primary crisp canvas surface.
- `paper-alt` (`#F9FAFB` / `--paper-alt`): Pale tint background for alternating sections and subtle card insets.
- `slate-500` (`#6B7280` / `--slate`): Primary lede subtext, metadata labels, descriptions.
- `line` (`rgba(15, 20, 32, 0.09)` / `--line`): Subtle 1px dividing borders.
- `line-dark` (`rgba(241, 242, 240, 0.12)` / `--line-dark`): Grid lines on dark surfaces.
- `text-on-dark` (`#F5F6F8` / `--text-on-dark`): High-contrast text on dark hero banners and CTA sections.
- `muted-on-dark` (`rgba(245, 246, 248, 0.60)` / `--muted-on-dark`): Secondary text on dark surfaces.

### Semantic Status Colors
- **Success / Fresh Mint:** `#00C896` (`--fresh`), soft: `rgba(0, 200, 150, 0.10)` (`--fresh-soft`). Used for "Verified", "Enrolling Now", and checkmarks.
- **Warning / Review:** `#F5A300` (`--amber`), soft: `rgba(245, 163, 0, 0.10)`.
- **Danger / Error:** `#EF4444`, soft: `rgba(239, 68, 68, 0.10)`.
- **Muted / Neutral:** `#6B7280` (`--slate`), soft: `rgba(107, 114, 128, 0.10)`.

---

## 2. Typography & Type Scale

### Font Families
- **Display Headings (`--display`):** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
  - Weights: `700` (Bold), `800` (ExtraBold)
  - Characteristics: Tight letter spacing (`-0.02em`), confident, human, institutional yet modern.
- **Body & Interface (`--sans`):** `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
  - Weights: `400` (Regular), `500` (Medium), `600` (SemiBold)
  - Characteristics: High x-height, optimized for dense legibility at 14px and 16px.
- **Eyebrows, Code & Tags (`--mono`):** `'JetBrains Mono', SFMono-Regular, Menlo, monospace`
  - Weights: `600` (SemiBold), `700` (Bold)
  - Characteristics: Uppercase tracking (`0.14em`–`0.16em`), used for eyebrow section tags, pill chips, and timestamps.

### Heading & Body Scale
- **H1 (Hero):** `clamp(2.4rem, 5vw, 3.8rem)` on desktop; `2rem` on mobile (`line-height: 1.1`, `letter-spacing: -0.02em`).
- **H2 (Section Titles):** `clamp(1.8rem, 3.6vw, 2.65rem)` (`line-height: 1.15`, `letter-spacing: -0.02em`).
- **H3 (Card Titles):** `1.05rem`–`1.3rem` (`font-weight: 700`, `letter-spacing: -0.01em`).
- **Eyebrow:** `0.72rem` (11.5px), `font-mono`, `font-weight: 600`, `letter-spacing: 0.16em`, uppercase, `color: var(--amber-text)` (`#A05E00`).
- **Section Lede Subtext:** `1.0rem`–`1.05rem` (`color: var(--slate)` `#6B7280`, `line-height: 1.75–1.85`, `max-width: 600px`).
- **Body Text:** `0.875rem`–`1.0rem` (14px–16px), `line-height: 1.6–1.7`.

---

## 3. Geometry: Radius, Shadows, and Blur

### Border Radius
- Standard Cards & Modals: `14px` (`--radius: 14px;`, Tailwind `rounded-[14px]` / `rounded-xl`).
- Buttons & Input Fields: `8px`–`10px` (`rounded-lg` / `rounded-md`).
- Pills & Tags: `50px` (`rounded-full`) or `4px` (`rounded` for skill tag chips).
- Large Showcase Containers: `16px`–`20px` (`rounded-2xl`).

### Shadows
- Standard Surface Card: `0 8px 28px rgba(20, 20, 20, 0.06)`
- Card Hover: `0 16px 40px rgba(15, 20, 32, 0.08)` (`transform: translateY(-4px)`)
- Primary Amber Button Hover: `0 10px 26px rgba(240, 162, 2, 0.35)` (`transform: translateY(-2px)`)
- Navigation CTA Hover: `0 8px 22px rgba(240, 162, 2, 0.45)`
- Popovers / Dropdowns: `0 18px 46px rgba(15, 20, 32, 0.13)`
- Floating Glass Panel: `0 8px 32px rgba(15, 20, 32, 0.08)`

### Glassmorphism Rules & Boundary
- **Navbar:** `background: rgba(255, 255, 255, 0.88)`, `backdrop-filter: blur(14px)`, `border-bottom: 1px solid rgba(15, 20, 32, 0.09)`.
- **Landing Floating Cards & Auth Cards:** `bg-white/75`, `backdrop-blur-md`, `border border-white/60`, `rounded-[14px]`, `shadow-[0_8px_32px_rgba(15,20,32,0.08)]`. Solid fallback (`bg-white`) when `backdrop-filter` is unsupported.
- **Hero Proof/Stat Strip:** Translucent pill/card row with soft border.
- **RESTRICTION:** Never applied to dashboards, tables, dense forms, resume previews, or officer evaluation views. Those strictly use solid white (`#FFFFFF`) surfaces with 1px border (`#E5E7EB` / `rgba(15,20,32,0.09)`) for optimal legibility.

---

## 4. Spacing, Containers & Transitions

### Spacing & Containers
- Container Max-Width: `1160px` (`.wrap { max-width: 1160px; margin: 0 auto; padding: 0 5%; }`).
- Section Vertical Padding: `96px 0` on desktop (`py-24`), `56px 0` on mobile (`py-14`).
- Section Alternation: Alternating `--paper` (`#FFFFFF`) and `--paper-alt` (`#F9FAFB`) background bands.

### Transitions & Motion
- Fast Interactive Transitions: `150ms`–`200ms ease` (`transform`, `box-shadow`, `border-color`, `background-color`).
- Hover Lift: `translateY(-2px)` for buttons, `translateY(-4px)` for cards.
- Respect `prefers-reduced-motion: reduce`: All animations and transitions disabled, smooth scrolling reset to auto.

### Mobile Experience
- Fixed Bottom Action Bar on `< 700px` (`position: fixed; bottom: 0; left: 0; right: 0; height: 52px;`).
- Bottom padding on mobile body: `padding-bottom: 52px`.
