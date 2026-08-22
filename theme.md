# 🎨 GlobeTrotter — Complete Theme System

> Single source of truth for colors & design tokens. Implemented in `src/index.css` via CSS variables + Tailwind v4 (`@theme inline`). Use semantic tokens — never hardcode hex values in components.

**Main Principle:** Green guides actions · Blue represents travel · Semantic colors communicate status.

---

## Theme System Overview

```
THEME SYSTEM
│
├── 01. BRAND COLORS
│   ├── Primary → Emerald Green
│   ├── Secondary → Travel Blue
│   └── Accent → Violet / Amber (limited use)
│
├── 02. LIGHT MODE
├── 03. DARK MODE
├── 04. SEMANTIC COLORS
├── 05. COMPONENT TOKENS
└── 06. DESIGN RULES
```

---

## 01. 🌿 BRAND COLORS

### Primary — Emerald Green

GlobeTrotter ki main identity color.

| Token | Value |
|---|---|
| Primary 50 | `#ECFDF3` |
| Primary 100 | `#D1FAE5` |
| Primary 200 | `#A7F3D0` |
| Primary 300 | `#6EE7B7` |
| Primary 400 | `#34D399` |
| Primary 500 | `#10B981` |
| Primary 600 | `#059669` |
| Primary 700 | `#047857` |
| Primary 800 | `#065F46` |
| Primary 900 | `#064E3B` |
| Primary 950 | `#022C22` |

**Usage:**

```
PRIMARY GREEN
├── Primary Buttons
├── Main CTA
├── Active Navigation
├── Selected States
├── Success States
├── Links
├── Progress Indicators
└── Important Interactive Elements
```

**Recommendation:**
- Light Mode Primary → `#059669`
- Dark Mode Primary → `#34D399`

> Dark mode mein `#059669` kabhi-kabhi dull lag sakta hai, isliye brighter emerald better rahega.

### Secondary — 🌍 Travel Blue

Green brand hai, lekin travel/location related cheezon ke liye blue use karenge.

| Token | Value |
|---|---|
| Blue 50 | `#F0F9FF` |
| Blue 100 | `#E0F2FE` |
| Blue 200 | `#BAE6FD` |
| Blue 300 | `#7DD3FC` |
| Blue 400 | `#38BDF8` |
| Blue 500 | `#0EA5E9` |
| Blue 600 | `#0284C7` |
| Blue 700 | `#0369A1` |
| Blue 800 | `#075985` |
| Blue 900 | `#0C4A6E` |
| Blue 950 | `#082F49` |

**Usage:**

```
TRAVEL BLUE
├── Locations
├── Cities
├── Maps
├── Route Information
├── Date / Travel Information
├── Timeline
└── Secondary Interactive Elements
```

**Example hierarchy:**
- 📍 Paris → Blue Accent
- ✈ Travel Route → Blue
- 📅 Travel Date → Blue
- 🌿 CTA → Green

Isse UI mein visual hierarchy achhi rahegi.

---

## 02. ☀️ LIGHT MODE

Light mode clean, premium aur slightly warm-neutral hona chahiye.

### Backgrounds

| Token | Hex |
|---|---|
| App Background | `#F8FAF9` |
| Surface | `#FFFFFF` |
| Surface Secondary | `#F4F7F5` |
| Surface Hover | `#EEF7F1` |
| Surface Active | `#E5F7EC` |

> Pure white background poori app mein use nahi karenge. `#FFFFFF` → Cards / Main Surfaces, `#F8FAF9` → App Background.

### Text

| Token | Hex |
|---|---|
| Text Primary | `#111827` |
| Text Secondary | `#4B5563` |
| Text Muted | `#6B7280` |
| Text Disabled | `#9CA3AF` |
| Text Inverse | `#FFFFFF` |

### Borders

| Token | Hex |
|---|---|
| Border Subtle | `#EDF0EE` |
| Border Default | `#E5E7EB` |
| Border Strong | `#D1D5DB` |
| Border Focus | `#10B981` |

### Primary

| Token | Hex |
|---|---|
| Primary | `#059669` |
| Primary Hover | `#047857` |
| Primary Active | `#065F46` |
| Primary Light | `#D1FAE5` |
| Primary Subtle | `#ECFDF3` |

### Travel / Info

| Token | Hex |
|---|---|
| Blue | `#0284C7` |
| Blue Hover | `#0369A1` |
| Blue Light | `#E0F2FE` |
| Blue Subtle | `#F0F9FF` |

---

## 03. 🌙 DARK MODE

> Dark mode ko pure black `#000000` nahi banana. Deep green-tinted dark surfaces use karenge, jisse GlobeTrotter ki identity maintain rahe 🌿

### Background Hierarchy

```
LEVEL 0 → Main App Background   #09100C
LEVEL 1 → Main Surface          #101914
LEVEL 2 → Elevated Card         #162019
LEVEL 3 → Hover Surface         #1D2A22
LEVEL 4 → Active Surface        #243329
```

### Backgrounds

| Token | Hex |
|---|---|
| App Background | `#09100C` |
| Surface | `#101914` |
| Surface Secondary | `#162019` |
| Surface Elevated | `#1B261F` |
| Surface Hover | `#1D2A22` |
| Surface Active | `#243329` |

### Text

| Token | Hex |
|---|---|
| Text Primary | `#F4F7F5` |
| Text Secondary | `#C4CEC7` |
| Text Muted | `#8C9990` |
| Text Disabled | `#657067` |
| Text Inverse | `#09100C` |

### Borders

| Token | Hex |
|---|---|
| Border Subtle | `#1E2A23` |
| Border Default | `#2A382F` |
| Border Strong | `#3A4A40` |
| Border Focus | `#34D399` |

### Primary

| Token | Hex |
|---|---|
| Primary | `#34D399` |
| Primary Hover | `#6EE7B7` |
| Primary Active | `#10B981` |
| Primary Light | `#064E3B` |
| Primary Subtle | `#052E16` |

### Travel / Info

| Token | Hex |
|---|---|
| Blue | `#38BDF8` |
| Blue Hover | `#7DD3FC` |
| Blue Light | `#0C4A6E` |
| Blue Subtle | `#082F49` |

---

## 04. 🚦 SEMANTIC COLORS

Ye colors pure project mein consistent rahenge.

### Success ✓

Use: Trip Saved · Budget Under Control · Activity Added · Profile Updated

| Token | Light | Dark |
|---|---|---|
| Success | `#16A34A` | `#4ADE80` |
| Success Background | `#DCFCE7` | `#052E16` |
| Success Border | `#86EFAC` | `#166534` |
| Success Text | `#166534` | `#86EFAC` |

### Warning / Budget 💰

Budget ke liye amber perfect rahega.

Use: Budget Near Limit · Date Conflict · Incomplete Itinerary

| Token | Light | Dark |
|---|---|---|
| Warning | `#D97706` | `#FBBF24` |
| Warning Background | `#FEF3C7` | `#451A03` |
| Warning Border | `#FCD34D` | `#92400E` |
| Warning Text | `#92400E` | `#FDE68A` |

### Error ✕

| Token | Light | Dark |
|---|---|---|
| Error | `#DC2626` | `#F87171` |
| Error Background | `#FEE2E2` | `#450A0A` |
| Error Border | `#FCA5A5` | `#7F1D1D` |
| Error Text | `#991B1B` | `#FCA5A5` |

### Info ℹ️

| Token | Light | Dark |
|---|---|---|
| Info | `#0284C7` | `#38BDF8` |
| Info Background | `#E0F2FE` | `#082F49` |
| Info Border | `#7DD3FC` | `#075985` |
| Info Text | `#075985` | `#BAE6FD` |

---

## 05. 🧩 COMPONENT DESIGN SYSTEM

### 🔘 Primary Button

| State | Light Mode | Dark Mode |
|---|---|---|
| Background | `#059669` | `#34D399` |
| Text | `#FFFFFF` | `#052E16` |
| Hover | `#047857` | `#6EE7B7` |
| Active | `#065F46` | `#10B981` |
| Focus Ring | `#6EE7B7` | `#34D399` |

### 🔘 Secondary Button

| State | Light Mode | Dark Mode |
|---|---|---|
| Background | Transparent / `#FFFFFF` | `#162019` |
| Border | `#D1D5DB` | `#3A4A40` |
| Text | `#374151` | `#C4CEC7` |
| Hover | `#F4F7F5` | `#1D2A22` |

### 🔤 Input

**Light:**

| Token | Value |
|---|---|
| Background | `#FFFFFF` |
| Border | `#D1D5DB` |
| Text | `#111827` |
| Placeholder | `#9CA3AF` |
| Hover Border | `#9CA3AF` |
| Focus Border | `#10B981` |
| Focus Ring | `rgba(16, 185, 129, 0.15)` |

**Dark:**

| Token | Value |
|---|---|
| Background | `#101914` |
| Border | `#2A382F` |
| Text | `#F4F7F5` |
| Placeholder | `#657067` |
| Hover Border | `#3A4A40` |
| Focus Border | `#34D399` |

### 🃏 Card System

Cards project ke most-used elements honge: Trip Cards · Destination Cards · Activity Cards · Budget Cards · Analytics Cards

**Light:**

| Token | Value |
|---|---|
| Background | `#FFFFFF` |
| Border | `#E5E7EB` |
| Hover Border | `#A7F3D0` |
| Shadow | `0 1px 2px rgba(0,0,0,0.04)` |
| Hover Shadow | `0 8px 24px rgba(0,0,0,0.08)` |

**Dark:**

| Token | Value |
|---|---|
| Background | `#101914` |
| Border | `#2A382F` |
| Hover Background | `#162019` |
| Hover Border | `#3A4A40` |

**Rule:** Cards par heavy shadow nahi. Premium UI ke liye:
- Light → subtle border + soft shadow
- Dark → mostly border separation

### 🧭 Navigation

**Light Sidebar:**

| Token | Value |
|---|---|
| Background | `#FFFFFF` |
| Border | `#E5E7EB` |
| Nav Text | `#4B5563` |
| Nav Hover | `#F0FDF4` |
| Active Background | `#DCFCE7` |
| Active Text | `#047857` |
| Active Icon | `#059669` |

**Dark Sidebar:**

| Token | Value |
|---|---|
| Background | `#0C130F` |
| Border | `#1E2A23` |
| Nav Text | `#AAB5AE` |
| Nav Hover | `#162019` |
| Active Background | `#064E3B` |
| Active Text | `#6EE7B7` |
| Active Icon | `#34D399` |

---

## 09. 🗺️ TRAVEL-SPECIFIC COLOR RULES

GlobeTrotter ko generic dashboard nahi banana hai. Har travel entity ka subtle identity color:

| Entity | Color |
|---|---|
| TRIP | Emerald Green 🌿 |
| CITY | Travel Blue 📍 |
| ACTIVITY | Violet / Purple 🎯 |
| TRANSPORT | Cyan / Sky ✈️ |
| HOTEL / STAY | Indigo 🏨 |
| FOOD | Orange 🍽️ |
| BUDGET | Amber 💰 |
| SUCCESS | Green ✓ |
| ERROR | Red ✕ |

**Important rule:** Ye colors accents/badges/icons ke liye hain. Primary buttons har jagah rainbow nahi honge. **Main CTA = Green hi rahega.**

---

## 10. ✨ BORDER RADIUS

| Element | Radius |
|---|---|
| Small Controls | 8px |
| Inputs | 10px |
| Buttons | 10px |
| Cards | 14px |
| Large Cards | 18px |
| Modal | 18px |
| Hero Sections | 24px |
| Pills / Badges | 9999px |

---

## 11. 📏 SPACING SYSTEM

Tailwind ke standard spacing system ke around:

| Size | Spacing |
|---|---|
| xs | 4px |
| sm | 8px |
| compact | 12px |
| normal | 16px |
| medium | 20px |
| section internal | 24px |
| large | 32px |
| xl | 40px |
| section | 48px |
| major section | 64px |
| hero spacing | 80px |

**Card Padding Rule:**
- Desktop → 24px
- Tablet → 20px
- Mobile → 16px

---

## 12. 📝 TYPOGRAPHY

**Font Family:** Primary → Inter · Fallback → system-ui

### Heading Scale

| Level | Size |
|---|---|
| Display / Hero | 48–64px |
| H1 | 36px |
| H2 | 30px |
| H3 | 24px |
| H4 | 20px |
| Card Title | 16–18px |
| Body Large | 16px |
| Body | 14px |
| Small | 13px |
| Caption | 12px |

### Weights

| Weight | Value |
|---|---|
| Regular | 400 |
| Medium | 500 |
| Semibold | 600 |
| Bold | 700 |

**Rule:** Har jagah bold use nahi karna. Premium UI ke liye hierarchy spacing + color + size se bhi banegi.

---

## 13. 🌗 THEME TOKEN STRUCTURE

Project mein direct colors hardcode nahi karenge.

```
src/
│
├── styles/
│   ├── globals.css
│   └── theme.css
│
├── components/
│   └── theme/
│       └── ThemeToggle.tsx
│
└── hooks/
    └── useTheme.ts
```

### Core Semantic Tokens

```
background / foreground
card / card-foreground
popover / popover-foreground
primary / primary-foreground
secondary / secondary-foreground
muted / muted-foreground
accent / accent-foreground
destructive
border / input / ring
```

### Travel-Specific Custom Tokens

```
travel-blue / travel-blue-foreground
city
activity
transport
stay
food
budget
```

---

## 🏆 FINAL DESIGN DIRECTION

```
GLOBETROTTER DESIGN LANGUAGE
│
├── Brand
│   └── Emerald Green 🌿
│
├── Travel Accent
│   └── Sky Blue 🌍
│
├── Light Mode
│   └── Clean, airy, premium
│
├── Dark Mode
│   └── Deep forest / emerald-tinted
│
├── UI Style
│   ├── Modern SaaS
│   ├── Soft borders
│   ├── Moderate radius
│   ├── Minimal shadows
│   ├── Strong whitespace
│   └── Travel imagery as visual focus
│
└── Main Principle
    └── Green guides actions,
        Blue represents travel,
        Semantic colors communicate status.
```
