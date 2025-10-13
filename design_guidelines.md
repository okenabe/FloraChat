# Design Guidelines: Intelligent Garden Cataloging Chatbot

## Design Approach

**Primary Strategy**: Hybrid approach combining Material Design principles with nature-inspired aesthetics drawn from successful gardening apps (Garden Answers, PlantSnap) and conversational interfaces (ChatGPT, Intercom).

**Rationale**: This is a utility tool requiring clear information hierarchy and reliable patterns, but the subject matter (gardening) demands warmth and organic visual elements that inspire engagement with nature.

## Color Palette

### Light Mode
- **Primary**: 142 65% 45% (Garden Green - sage-toned, professional yet natural)
- **Secondary**: 88 50% 55% (Fresh Leaf - bright accent for success states)
- **Background**: 60 8% 98% (Warm Off-white)
- **Surface**: 0 0% 100% (Pure white for cards/chat bubbles)
- **Text Primary**: 140 10% 15% (Deep forest green-gray)
- **Text Secondary**: 140 5% 45% (Muted sage)
- **Borders**: 140 10% 90% (Subtle green-tinted gray)

### Dark Mode
- **Primary**: 142 45% 55% (Lighter garden green)
- **Secondary**: 88 40% 60% (Muted fresh accent)
- **Background**: 140 15% 8% (Deep forest floor)
- **Surface**: 140 12% 12% (Elevated dark surface)
- **Text Primary**: 60 5% 95% (Warm off-white)
- **Text Secondary**: 140 5% 70% (Muted light sage)
- **Borders**: 140 8% 20% (Subtle dark border)

### Status Colors
- **Success/Thriving**: 88 60% 50% (Vibrant green)
- **Warning/OK**: 45 90% 60% (Golden sunlight)
- **Error/Struggling**: 15 75% 55% (Terracotta warning)
- **Info**: 200 70% 50% (Sky blue for neutral information)

## Typography

**Font Stack**: 
- **Primary**: 'Inter' (Google Fonts) - Clean, highly legible for chat interface
- **Display**: 'Raleway' (Google Fonts) - For headers and plant names
- **Monospace**: 'JetBrains Mono' (Google Fonts) - For scientific names

**Scale**:
- **Display (Plant Names)**: text-3xl (30px), font-semibold, font-display
- **Heading 1**: text-2xl (24px), font-semibold
- **Heading 2**: text-xl (20px), font-medium
- **Body**: text-base (16px), font-normal
- **Small/Meta**: text-sm (14px), font-normal
- **Tiny/Timestamps**: text-xs (12px), font-normal

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 12, 16, 24 for consistency
- Component padding: p-4 or p-6
- Section spacing: gap-8 or gap-12
- Tight spacing: gap-2 or gap-4

**Container Widths**:
- Chat interface: max-w-4xl (optimal reading width for conversation)
- Plant cards: max-w-sm to max-w-md
- Full catalog view: max-w-7xl

## Component Library

### Chat Interface
**Message Bubbles**:
- User messages: Right-aligned, primary green background, white text, rounded-2xl, max-w-md, p-4
- Bot messages: Left-aligned, surface background with border, primary text, rounded-2xl, max-w-lg, p-4
- Include small avatar icons (🌱 for bot, user initial or 👤 for user)
- Timestamps: text-xs, text-secondary, mt-1
- Typing indicator: Three animated dots in bot bubble style

**Input Area**:
- Fixed bottom position with backdrop-blur
- Rounded-xl text area with border-2 border-primary/20
- Photo upload button with camera icon (left side)
- Send button with arrow icon (right side, primary green when text present)
- Min height: 56px, auto-expand to max 120px

### Plant Identification Cards
**High Confidence Card** (>85%):
- Large plant photo (aspect-ratio-square or 4:3), rounded-lg
- Confidence badge: Top-right overlay, green bg, "92% Match"
- Plant name: Display font, text-2xl, primary color
- Scientific name: Monospace font, text-sm, italic, text-secondary
- Quick stats grid: 2 columns, icons + labels (type, light, size)
- "Add to Garden" CTA: Primary button, w-full

**Medium Confidence Card** (60-85%):
- Smaller photo (aspect-ratio-video), rounded-md
- Three suggestion cards in vertical stack
- Each with: Name, confidence %, expandable details
- "Need more info" helper text
- Secondary buttons for selection

**Low Confidence Card** (<60%):
- Photo thumbnail with question mark overlay
- "Help us identify" prompt
- Quick questions in chip format (sun/shade? flower color?)
- Text input for user description

### Garden Bed Cards
- Header: Bed name (h2) + edit icon
- Metadata row: Sun icon + exposure, droplet + moisture, ruler + size
- Plant list: Compact cards with thumbnail, name, quantity, health dot
- Footer: "Add Plant" button + "View Details" link
- Hover: Subtle lift (shadow-lg) and border highlight

### Navigation & Layout
**Top Bar**:
- Logo/brand: 🌱 Garden Catalog (left)
- Navigation: My Beds, All Plants, Profile (center, hidden on mobile)
- Mobile: Hamburger menu (right)
- Height: h-16, border-b, backdrop-blur-md, sticky top-0

**Sidebar** (Desktop only, ≥1024px):
- Width: w-64
- Garden beds list with plant counts
- "New Bed" button at bottom
- Collapsible for more chat space

**Mobile Bottom Nav**:
- Fixed bottom bar with 4 icons: Chat, Beds, Plants, Profile
- Active state: primary color + filled icon
- Height: h-16, safe-area-inset-bottom padding

### Status Indicators
**Health Status Dots**:
- Thriving: Large dot (h-3 w-3), success green, with pulse animation
- OK: Medium dot (h-2.5 w-2.5), warning yellow
- Struggling: Medium dot, error terracotta
- Dead: Small dot (h-2 w-2), gray-400

**Confidence Badges**:
- High: Green background, "✓ 92% Match"
- Medium: Yellow background, "~ 68% Match"
- Low: Gray background, "? 45% Match"
- Rounded-full, px-3, py-1, text-xs, font-medium

### Photo Upload Zone
**Dropzone**:
- Dashed border (border-dashed border-2 border-primary/30)
- Large camera icon (text-6xl, text-primary/40)
- "Drop photo or click to upload" text
- Rounded-xl, p-12, hover:bg-primary/5 transition
- Image preview: Rounded-lg, max-h-80, with "Change" button overlay

### Data Display
**Plant Details Panel**:
- Hero image at top (aspect-ratio-16/9)
- Floating back button (top-left)
- Name + scientific name (overlay on image with gradient backdrop)
- Tabbed sections: Details, Care, History, Photos
- Timeline view for plant history (planted → milestones → current)

**Timeline Component**:
- Vertical line connecting nodes (border-l-2 border-primary/20)
- Date nodes: Circle with icon, connected to line
- Event cards: Offset from line, rounded-lg, surface bg, shadow-sm

## Images

**Hero Section**: Not applicable - this is a utility app, not a marketing site. The chat interface is the primary view.

**Plant Photos**:
- User-uploaded photos: Display actual garden photos with EXIF preservation
- Placeholder images: Use botanical illustration style or subtle leaf patterns in primary green tones
- Loading states: Skeleton with animated shimmer effect

**Empty States**:
- No beds yet: Illustration of person planting in garden (friendly, simple line art style)
- No plants in bed: Small potted plant illustration with "Add your first plant" prompt
- No chat history: Welcome illustration with 🌱 icon and conversation starter examples

## Animations

**Minimal & Purposeful**:
- Message send: Fade-in-up (duration-200)
- Photo upload: Scale-in (duration-150)
- Confidence badge: Subtle pulse for high confidence only
- Health status dot: Pulse animation for "thriving" plants only
- Skeleton loading: Shimmer effect for content loading states
- **No** scroll-triggered animations, **no** decorative transitions

## Responsive Breakpoints

- **Mobile-first**: Base styles for mobile (chat-optimized)
- **md (768px)**: Side-by-side plant cards, show more metadata
- **lg (1024px)**: Sidebar navigation, multi-column catalog grid
- **xl (1280px)**: Max content width, comfortable spacing

## Key UX Patterns

1. **Progressive Disclosure**: Start with simple questions, reveal advanced fields only for power users
2. **Contextual Help**: Inline tooltips for scientific terms, expandable info cards
3. **Smart Defaults**: Pre-fill sun exposure from location clues, suggest bed names
4. **Undo/Edit**: Every saved entry has quick edit and undo options
5. **Offline Indicators**: Toast notification if photo upload fails, queue for retry
6. **Success Feedback**: Gentle confirmation toasts (top-right, 3s duration) with undo action