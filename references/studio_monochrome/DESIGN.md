# Design System Strategy: The Editorial Monolith

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Curated Gallery."** 

This system moves away from the cluttered, "dashboard" aesthetic of typical management tools and instead adopts the stark, authoritative atmosphere of a high-end art gallery or a prestige fashion lookbook. We are not just building an app; we are building a stage for talent. 

The aesthetic is characterized by **Radical Minimalism**. By utilizing a strictly 0px border radius (sharp edges) and an uncompromising black-and-white palette, we create a sense of architectural permanence. The vibrant yellow is our "Gallery Tape"—a functional, high-visibility marker used only to signal action, urgency, or the "active" state in a sea of monochrome.

## 2. Colors: The High-Contrast Palette
We operate in extremes. There is no middle ground, only intent.

*   **Background (#FFFFFF):** The canvas. It must feel infinite.
*   **Primary (#000000):** The ink. Used for all primary communication, headers, and structural foundations.
*   **Vibrant Highlight (#FFFF00):** The "Action Yellow." This is a functional tool, not a decorative one. Use it for CTAs, notification pips, and active navigation states.

### The "No-Line" Rule
Standard 1px borders are prohibited for sectioning. They create visual noise that distracts from the artist's data. 
*   **Boundary Definition:** Use the `surface-container` tiers to define areas. A `surface-container-low` (#f3f3f4) section sitting on a `surface` (#f9f9f9) background provides all the separation needed.
*   **Nesting:** To create depth, stack containers. Place a `surface-container-lowest` (#ffffff) card inside a `surface-container-high` (#e8e8e8) section. This creates a "recessed" or "elevated" feel without a single stroke being drawn.

### Signature Textures
To prevent the UI from feeling "cheap" or "flat," use **Backdrop Blurs**. When an element overlays another (like a mobile navigation bar), use a semi-transparent `surface` color with a `blur(20px)` effect. This creates a "Glassmorphism" feel that suggests premium material rather than digital pixels.

## 3. Typography: Editorial Authority
We use a dual-sans-serif approach to balance character with utility.

*   **The Display Voice (Manrope):** Used for `display` and `headline` levels. Manrope’s geometric nature provides a modern, architectural feel. Use `display-lg` (3.5rem) for artist names and major headings to create "hero" moments.
*   **The Functional Voice (Inter):** Used for `title`, `body`, and `labels`. Inter is engineered for legibility at small sizes. 
*   **Hierarchy:** Use extreme scale shifts. A `display-lg` headline paired directly with a `body-sm` caption creates an editorial "Swiss Style" look that feels intentional and high-end.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are largely banned. We define space through **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking" the surface-container tiers.
    *   *Base:* `surface` (#f9f9f9)
    *   *Section:* `surface-container-low` (#f3f3f4)
    *   *Card:* `surface-container-lowest` (#ffffff)
*   **Ambient Shadows:** If a floating element (like a FAB or Tooltip) requires a shadow, it must be an "Ambient Shadow": `0px 20px 40px rgba(0,0,0,0.04)`. It should look like a soft glow of light, not a dark smudge.
*   **The "Ghost Border" Fallback:** For input fields or high-utility components where a boundary is required for accessibility, use the `outline-variant` (#c6c6c6) at **15% opacity**. It should be felt, not seen.

## 5. Components: The Brutalist Set

### Buttons
*   **Primary:** Solid `primary` (#000000) with `on-primary` (#eaea00 / Yellow) text. Sharp 0px corners.
*   **Secondary:** Solid `vibrant-yellow` (#FFFF00) with `black` (#000000) text. Used for the single most important action on a screen.
*   **Tertiary:** No background, `primary` (#000000) text, underlined on hover/active.

### Cards & Lists
*   **No Dividers:** Forbid the use of divider lines. Use **Spacing 8** (2.75rem) to separate list items or subtle background shifts between `surface-container` levels.
*   **Interaction:** On hover or tap, the background of a card should shift from `surface-container-lowest` to `vibrant-yellow` (#FFFF00).

### Input Fields
*   **Style:** A bottom-only "Ghost Border" (15% opacity `outline-variant`). 
*   **Active State:** The bottom border transforms into a 2px solid `vibrant-yellow` (#FFFF00).
*   **Label:** Use `label-sm` in all caps with 0.05rem letter spacing for a "Technical/Contractual" look.

### Artist Progress Indicator (App Specific)
*   A custom component: A horizontal bar using `surface-container-highest` as the track and a solid `vibrant-yellow` bar to show "Career Growth" or "Contract Completion."

## 6. Do's and Don'ts

### Do
*   **Embrace Negative Space:** If a screen feels empty, leave it. Space is a luxury.
*   **Use Sharp Edges:** Everything is `0px` radius. This creates a professional, serious tone.
*   **Mobile-First Verticality:** Design for the thumb. Use the **Spacing Scale 10** (3.5rem) for side margins to ensure content feels "tucked" and centered.

### Don't
*   **No Rounding:** Never use border-radius. It softens the brand and makes it feel like a consumer "toy" app.
*   **No Gray Text for Body:** Use `on-surface` (#1a1c1c) for body text. We want high contrast for maximum legibility.
*   **Don't Overuse Yellow:** If more than 10% of the screen is yellow, you have failed. It is a highlighter, not a primary color.