# MangaForge Nexus - Design Guidelines

## Design Approach

**Hybrid System-Based + Content-First**
- Primary inspiration: **Material Design 3** for content-rich manga displays with strong visual feedback
- Secondary reference: **Notion** for clean, functional reading/translation tools
- Manga-specific: Draw from **Tachiyomi** and **MangaDex** for proven reader patterns

## Core Design Principles

1. **Content Supremacy**: Manga artwork is the star - UI recedes during reading
2. **Functional Clarity**: Translation and management tools prioritize efficiency
3. **Cultural Authenticity**: Japanese manga heritage reflected in subtle design choices
4. **Smooth Transitions**: All interactions feel fluid and intentional

## Typography System

**Established Fonts:**
- **Body/UI**: Inter (400, 500, 600) - clean, readable interface text
- **Headings**: Poppins (600, 700) - bold, energetic titles
- **Japanese**: Noto Sans JP (400, 500) - authentic manga text rendering

**Type Scale:**
- Hero Headline: 3xl-4xl (48-60px), Poppins Bold
- Page Titles: 2xl-3xl (30-36px), Poppins SemiBold
- Section Headers: xl (20px), Poppins SemiBold
- Body: base (16px), Inter Regular
- Small/Meta: sm (14px), Inter Regular
- Captions: xs (12px), Inter Medium

## Layout System

**Spacing Primitives** (Tailwind units): 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4, p-6, p-8
- Section margins: my-12, my-16, my-20
- Card gaps: gap-4, gap-6, gap-8

**Grid Structures:**
- Manga Library: grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6
- Features/Settings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- Translator Layout: Split 60/40 (preview/controls)

**Container Constraints:**
- Max content width: max-w-7xl
- Reading area: Full viewport (no max-width)
- Settings/Forms: max-w-2xl

## Component Library

### Navigation
- **Sidebar**: Collapsible, persistent on desktop, overlay on mobile
- Logo: "MF" monogram + Japanese "鍛造" subtitle
- Active state: Purple background with white text
- Sections: Clear visual separation with subtle dividers

### Manga Cards
- **Aspect Ratio**: 2:3 (standard manga proportions)
- Cover images: object-cover with rounded corners (rounded-lg)
- Hover state: Lift with shadow-lg, reveal quick actions overlay
- Progress bar: Bottom-aligned, 2px height, purple fill
- Metadata: Compact badges for genre, page count
- Favorite icon: Heart, top-right absolute position

### Reader Interface
- **Fullscreen**: Black background (#000), edge-to-edge panels
- Controls: Auto-hide after 3s of no mouse movement
- Top bar: Minimal close button (white/semi-transparent)
- Bottom bar: Centered navigation with backdrop-blur-md, rounded-full
- Page counter: White text, medium weight
- Settings menu: Right-aligned dropdown, dark theme

### Forms & Inputs
- Input fields: border-2, focus:ring-2 ring-purple-500
- Dropdowns: Shadcn Select with custom purple accents
- File upload: Dashed border, hover state with purple tint
- Buttons: Rounded-md, consistent padding (px-4 py-2)

### Cards & Containers
- Standard cards: rounded-lg, border, shadow-sm
- Hover cards: shadow-md transition
- Section cards: bg-card with subtle border

### Data Display
- Translation status badges: Rounded-full pills with status colors
- Progress indicators: Linear bars or circular loaders in purple
- Empty states: Centered icon + text + CTA button

### Overlays & Modals
- Dialogs: max-w-md, rounded-xl, shadow-2xl
- Toast notifications: Bottom-right, slide-in animation
- Backdrops: bg-black/50 with backdrop-blur-sm

## Visual Design

**Elevation System:**
- Flat elements: shadow-none
- Raised cards: shadow-sm
- Interactive elements: shadow-md on hover
- Modals/popovers: shadow-lg to shadow-2xl

**Border Radius:**
- Buttons/inputs: rounded-md (6px)
- Cards: rounded-lg (8px)
- Manga covers: rounded-lg (8px)
- Pills/badges: rounded-full
- Modals: rounded-xl (12px)

**Iconography:**
- Use Lucide React icons throughout
- Size scale: 16px (sm), 20px (base), 24px (lg), 32px (xl)
- Consistent stroke width: 2px
- Color: currentColor for automatic theming

## Page-Specific Guidelines

### Landing Page
- **Hero**: Full-width gradient background with grid pattern overlay, centered headline with gradient text effect on key phrase, dual CTAs (primary + secondary)
- **Features Grid**: 3 columns on desktop, icon-led cards with colored backgrounds (purple/pink/blue variations), hover lift effect
- **CTA Section**: Bottom banner with upload encouragement, contrasting background

### Library Page
- Dense manga grid (5 columns desktop), search + filters bar at top, view mode toggle (grid/list), empty state with prominent upload CTA

### Reader Page
- Immersive black fullscreen, minimal UI, auto-hiding controls, smooth page transitions, settings accessible but unobtrusive

### Translator Page
- Split layout: left (manga preview), right (translation controls), language selectors with flag icons, translation history list below, progress indicators for active translations

### Settings Page
- Card-based sections, toggle switches for preferences, slider controls with live preview, save/cancel actions at bottom

## Animations

**Use Sparingly:**
- Page transitions: Fade (200ms)
- Card hover: Lift + shadow (150ms ease-out)
- Control show/hide: Slide + fade (250ms)
- Loading states: Pulse on skeleton screens

**Avoid:**
- Gratuitous scroll animations
- Continuous/infinite animations
- Heavy parallax effects

## Images

**Hero Section:**
- Use subtle manga-inspired background pattern or gradient
- Overlay with semi-transparent grid texture
- No large hero image - keep focus on CTAs

**Manga Content:**
- High-quality cover images (min 400x600px)
- Lazy loading for gallery views
- WebP format for performance
- Placeholder: Book icon on muted background

**Icons & Illustrations:**
- Empty states: Simple line illustrations in muted purple
- Feature icons: Colored circular backgrounds
- Status indicators: Icon + text combinations

## Accessibility

- Focus rings: ring-2 ring-purple-500 ring-offset-2
- Color contrast: WCAG AA minimum for all text
- Touch targets: min 44px for mobile interactions
- Keyboard navigation: Full support with visible focus states
- Screen reader labels: Comprehensive aria-labels on interactive elements