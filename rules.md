# Mazadat (مزادات) - AI Coding Assistant Rules & Conventions

This file defines the project identity, strict coding standards, and UI guidelines for **Mazadat (مزادات)**. AI assistants must read and strictly adhere to these rules at the beginning of every session to ensure consistency across the codebase.

## 1. Project Overview
**Mazadat (مزادات)** is a web-based auction marketplace targeted at the Saudi market.
- **Tech Stack:** React, Tailwind CSS (Frontend), Spring Boot (Backend), MySQL (Database).
- **Primary Language:** Arabic (RTL default).

## 2. Brand Identity & Color System
The following colors define the Mazadat brand. They must be used exactly as specified, either as Tailwind-compatible CSS variables or a constant object.

- **Primary brand teal:** `#2A9D8F`
- **Primary dark (hover, panel bg):** `#1A7A6E`
- **Primary light (hover states, tints):** `#3DBFB0`
- **Form/page background:** `#F4FAFA`
- **Body text:** `#1A2E2C`
- **Muted/placeholder text:** `#6B9E99`
- **Input focus border:** `#2A9D8F`
- **Selected card:** border: `#2A9D8F`, fill: `#EAF7F5`
- **Dividers/borders:** `#C5E0DC`
- **CTA button:** background `#2A9D8F`, text `white`, hover background `#1A7A6E`
- **Error state:** `#E05252`
- **Success state:** `#2A9D8F`
- **Warning state:** `#F4A261`

> [!WARNING]
> **Strict Prohibition:** There must be NO amber, orange, gold, or warm tones used anywhere in the UI.

## 3. Logo Usage Rules
There are three specific logo variants, located in `/public/logos/`.

- `mazadat_white_in_green_logo.png`: Use on dark/teal colored backgrounds (e.g., right panels, headers with teal background). **Size: 180–220px wide.**
- `mazadat_green_logo.png`: Use on light/white backgrounds (e.g., top of forms, navigation on light pages). **Size: 100–120px wide.**
- `mazadat_black_logo.png`: **RESERVED FOR PRINT ONLY** (invoices, non-UI documents with light backgrounds). **Never use this in the main app UI.**

## 4. Typography
- **Primary font:** `Cairo` (Google Fonts) — supports both Arabic and Latin.
- **Fallback font:** `sans-serif`.
- **Directionality:** The entire application is **RTL (right-to-left)** by default. `dir="rtl"` must be set on the root HTML element.
- **Language Priority:** Arabic is the primary language. Where bilingual display is needed, English labels appear beneath Arabic ones.
- **Font Sizes:** Follow standard Tailwind scale strictly (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`).
- **Font Weights:**
  - Headings: `font-bold`
  - Body: `font-normal`
  - Captions/placeholders: `font-light`

## 5. Component Styling Conventions
Rules for recurring UI elements:

- **Buttons:** `rounded-lg px-6 py-3 font-semibold transition duration-200`.
  - *Primary Variant:* Teal background + white text.
  - *Outline Variant:* Teal border + teal text + transparent background.
- **Input Fields:** `rounded-lg border border-[#C5E0DC] bg-white px-4 py-3 focus:ring-2 focus:ring-[#2A9D8F] placeholder-[#6B9E99] text-right`.
- **Cards:** `bg-white rounded-xl shadow-sm border border-[#C5E0DC] p-4` (or `p-6`).
  - *Active/Selected Cards:* `border-2 border-[#2A9D8F] bg-[#EAF7F5]`.
- **Tabs:** Underline or filled style. Active tab uses `#2A9D8F`. Inactive tabs use muted text color.
- **Modals/Overlays:** `bg-white rounded-2xl shadow-xl`.
- **Decorative Side Panels:** Background `#1A7A6E` with a subtle geometric pattern overlay in `#2A9D8F` at 10–15% opacity.

## 6. Layout & Spacing Rules
- All pages must use RTL flex/grid layouts.
- **Maximum Content Width:** `max-w-7xl mx-auto`.
- **Standard Section Padding:** `px-6 py-10` generally, or `px-10 py-16` for larger sections.
- **Gap between form fields:** `gap-4` or `space-y-4`.
- **Split Layouts (e.g., Auth Pages):** Left side = form (white/light background), Right side = decorative panel (teal background). Layout must be 50/50 on desktop and stack on mobile.

## 7. Iconography
- **Library:** Use **Lucide React**. Do not use any other icon library unless explicitly approved.
- **Sizes:**
  - Default: 20px (`w-5 h-5`).
  - Large: 24px (`w-6 h-6`).
- **Color:** Icons should inherit from the text color or explicitly use the brand teal (`#2A9D8F`).

## 8. Responsiveness Rules
- **Approach:** Mobile-first.
- **Breakpoints:** Follow Tailwind defaults (`sm`, `md`, `lg`, `xl`).
- **Split Layouts:** On mobile, split layouts must collapse to a single column (form panel on top, decorative panel either hidden or condensed to a header strip).
- **Minimum Touch Target:** `44x44px` for all interactive elements.

## 9. What AI Assistants Must NEVER Do
These rules are absolutely strict and must be followed at all times.

> [!CAUTION]
> - **NEVER** use warm colors (amber, orange, gold, terracotta, red-orange) anywhere in the UI.
> - **NEVER** set `dir="ltr"` as default.
> - **NEVER** use a font other than `Cairo` unless explicitly instructed.
> - **NEVER** use the black logo (`mazadat_black_logo.png`) inside the app UI.
> - **NEVER** add inline styles when an equivalent Tailwind class exists.
> - **NEVER** create a new component without first checking if an equivalent one already exists in `/src/components/`.
> - **NEVER** hardcode text strings — all user-facing text must go through the i18n system (with Arabic as the default).
> - **NEVER** use `px` for font sizes — rely exclusively on Tailwind's text scale (`text-sm`, `text-lg`, etc.).

## 10. File & Folder Structure Conventions
Follow this exact directory mapping:

- `/public/logos/` → All logo variants.
- `/src/components/` → Reusable UI components.
- `/src/pages/` → Page-level components.
- `/src/styles/` → Global CSS and Tailwind configuration.
- `/src/constants/` → Color tokens, routes, and enums.
- `/src/hooks/` → Custom React hooks.
- `/src/services/` → API call functions.
- `/src/i18n/` → Arabic/English translation files.
