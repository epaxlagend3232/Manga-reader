# Design Guidelines: MangaForge Nexus

## Design Approach

**Hybrid Reference Strategy**: Drawing from manga reader apps (Tachiyomi, MangaDex) for content-rich reading experiences, combined with productivity app patterns (Notion, Linear) for management interfaces. The aesthetic should feel distinctly manga/anime-inspired while maintaining modern web app polish.

## Core Design Principles

1. **Content-First Immersion**: Manga panels take visual priority - UI chrome fades when reading
2. **Dual Personality**: Vibrant, expressive reader vs. clean, efficient management dashboard
3. **Cultural Authenticity**: Subtle Japanese design influences without kitsch

## Typography System

**Font Families:**
- Primary UI: Inter or Noto Sans (Google Fonts) - clean, highly legible
- Accent/Headers: Poppins Bold - modern, slightly playful energy
- Manga Metadata: Use Japanese web fonts (Noto Sans JP) for authenticity when displaying titles

**Hierarchy:**
- Hero Headers: text-5xl to text-6xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Body Text: text-base to text-lg
- Metadata/Labels: text-sm, uppercase tracking-wide
- Captions: text-xs

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 8, 12, 16 for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: space-y-8 to space-y-16
- Card gaps: gap-4 to gap-6
- Container margins: mx-auto max-w-7xl px-4

**Grid Patterns:**
- Manga Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-5 (compact manga covers)
- Feature Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard Sections: Two-column splits for stats/activity feeds

## Component Library

### Navigation
- Sticky top navigation with prominent "Translator" button (distinctive accent treatment)
- Sidebar for library/playlists (collapsible on mobile)
- Breadcrumb navigation for deep manga hierarchies

### Manga Display Cards
- Vertical cover image with aspect ratio 2:3
- Title overlay on hover with gradient backdrop
- Reading progress indicator (horizontal bar at bottom)
- Quick action buttons (bookmark, translate, read) appear on hover
- Badge system for tags (small rounded pills with subtle backgrounds)

### Reader Interface
- Fullscreen mode with minimal chrome
- Floating controls (semi-transparent panels with blur backdrop)
- Page counter centered at bottom
- Gesture-friendly button sizing (min 44x44px touch targets)
- Panel zoom with smooth transitions

### Translation Hub
- Split-screen layout: original manga preview (left) + translation controls (right)
- Language selector with flag icons
- Progress indicator for AI processing
- Side-by-side before/after comparison view

### Dashboard Components
- Stats cards with large numbers and icons
- Recent activity feed with thumbnails
- "Continue Reading" carousel with horizontal scroll
- Favorites grid with heart icon overlay

### Forms & Inputs
- Rounded input fields (rounded-lg)
- Upload zones with drag-drop states (dashed borders, hover effects)
- Multi-select with chip-style tags
- Range sliders for resolution/quality settings

### Modals & Overlays
- Settings panel as slide-out drawer from right
- Modal dialogs with backdrop blur
- Toast notifications (top-right corner, slide-in animation)

## Images

### Hero Section
**Large hero image**: Yes - showcase stunning manga panel artwork
- Full-width banner (h-96 md:h-screen max-h-[600px])
- Gradient overlay for text readability
- CTA buttons with backdrop-blur-sm bg-white/20 treatment
- Tagline: "Your Gateway to Boundless Manga Worlds"

### Dashboard Images
- Manga cover thumbnails throughout (actual uploaded content)
- Feature section icons: Use Heroicons for translation, library, settings features
- Empty states: Illustrative manga-style artwork encouraging first upload

### Branding
- Logo: Stylized "MangaForge" text with Japanese character accent (鍛 - forge)
- Favicon: Simple "MF" monogram in bold letterforms

## Page-Specific Layouts

### Landing Page (Pre-Login)
1. **Hero**: Full-width manga artwork backdrop, centered headline + CTA, blurred button backgrounds
2. **Features Grid**: 3-column layout showcasing AI translation, reading modes, library management with Heroicons
3. **How It Works**: Horizontal step flow with numbered circles
4. **Showcase**: Manga grid preview (6-8 sample covers)
5. **Translation Demo**: Split-screen visual showing before/after
6. **Footer**: Multi-column with quick links, social icons, newsletter signup

### Dashboard (Post-Login)
- Top stats bar (total manga, reading progress, translations completed)
- "Continue Reading" horizontal scroll
- Manga library grid with filters sidebar
- Quick actions floating action button (+ icon for add manga)

### Reader View
- Edge-to-edge manga panels
- Minimal UI overlay (auto-hide after 3s)
- Swipe gestures for navigation
- Bottom toolbar: zoom, page nav, bookmark, settings

### Translator Interface
- 60/40 split: manga preview (60%) + controls (40%)
- Tabbed interface for batch/single page translation
- Live preview of translated text overlays
- Export options panel at bottom

## Accessibility

- High contrast ratios for all text (WCAG AA minimum)
- Focus indicators with visible rings (ring-2 ring-offset-2)
- Keyboard shortcuts for reader navigation
- Alt text for all manga covers and UI icons
- Screen reader labels for icon-only buttons

## Animations

Use sparingly:
- Card hover lifts (translate-y-1 transition)
- Page transitions (fade-in for route changes)
- Loading states (subtle pulse for skeleton screens)
- No auto-playing animations in reader view