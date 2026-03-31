# Mulsikmul — Plant Care App Design Document

## Overview

Mulsikmul is a personal cross-platform mobile application for managing houseplant care. It allows you to register your plants, set watering schedules, and receive push notifications when it's time to water them.

**Target platforms:** iOS, Android, Web (via Expo)

## Goals

1. **Simple plant registry** — Add plants with a photo, name, species, and notes
2. **Watering reminders** — Set per-plant watering intervals and receive push notifications
3. **At-a-glance status** — See which plants need water today from the home screen
4. **Plant discovery** — Optionally search the Perenual API to auto-fill plant details

## Non-Goals (for now)

- Social features / sharing
- Fertilizing, repotting, or other care tracking beyond watering
- Multi-user / cloud sync
- Plant health diagnosis via photo AI

---

## Screens & Navigation

The app uses **tab-based navigation** (Expo Router) with a **stack** for detail views.

```
(tabs)
  ├── My Plants    → Plant list (home)
  ├── Schedule     → All plants sorted by watering urgency
  └── Add Plant    → Form to register a new plant

Stack (pushed from tabs)
  └── Plant Detail → View/edit plant, "Water Now", delete
```

---

## Visual Design Spec

This section is the authoritative design reference for implementing the UI. Every value (color, size, spacing, radius) is exact and must be used as-is.

The design is derived from the PlantPal proto web app, translated into React Native equivalents.

---

### 1. Design Philosophy

- **White card surfaces on a soft three-stop green gradient background** — every screen uses a `LinearGradient` from green-50 → emerald-50 → teal-50 as the root view
- **Minimal and nature-inspired** — green is the brand color, blue signals water actions, red signals destructive actions
- **Subtle depth** — cards use thin `rgba(0,0,0,0.10)` borders and small box shadows instead of heavy drop shadows
- **Consistent rounding** — standard cards and buttons use 10–14px radius; FAB and icon buttons are perfectly circular
- **Active feedback on every interactive element** — scale-down animations (0.95) on press, opacity changes on disabled state

---

### 2. Design Tokens

Replace the entire contents of `src/ui/theme.ts` with these values.

#### 2.1 Colors

```ts
export const colors = {
  // Backgrounds
  background:        '#F0FDF4',   // green-50 — screen/page background
  backgroundGradient: ['#F0FDF4', '#ECFDF5', '#F0FDFA'] as const,
                                  // green-50 → emerald-50 → teal-50
  surface:           '#FFFFFF',   // card, input, panel background
  surfaceElevated:   '#F3F4F6',   // gray-100 — photo upload placeholder bg

  // Borders & dividers
  border:            'rgba(0,0,0,0.10)',  // 10% black — all card/input borders
  divider:           '#E5E7EB',           // gray-200 — row dividers inside cards
  shadow:            'rgba(0,0,0,0.10)',

  // Brand — primary (dark navy)
  primary:           '#030213',
  primaryForeground: '#FFFFFF',

  // Brand — green (emerald)
  green:             '#059669',   // emerald-600 — FAB, green CTA buttons
  greenLight:        '#D1FAE5',   // emerald-100 — icon bg, care summary bg
  greenDark:         '#047857',   // emerald-700 — pressed/active green

  // Water action — blue
  blue:              '#2563EB',   // blue-600 — "Water Now" button
  blueLight:         '#EFF6FF',   // blue-50  — water outline button bg
  blueBorder:        '#BFDBFE',   // blue-200 — water outline button border

  // Status — due soon (orange)
  orange:            '#EA580C',   // orange-600
  orangeLight:       '#FFF7ED',   // orange-50

  // Status — destructive (red)
  danger:            '#D4183D',
  dangerLight:       '#FFF1F2',   // red-50
  dangerBorder:      '#FECDD3',   // red-200

  // Text
  text:              '#030213',   // near-black — primary text
  textSecondary:     '#4B5563',   // gray-600   — secondary/descriptive text
  textMuted:         '#6B7280',   // gray-500   — hints, labels, placeholders
  textLight:         '#FFFFFF',

  // Misc
  muted:             '#ECECF0',
  mutedForeground:   '#717182',
}
```

#### 2.2 Spacing

```ts
export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
}
```

#### 2.3 Border Radius

```ts
export const borderRadius = {
  sm:   6,     // small badges, tiny elements
  md:   8,     // medium chips
  lg:   10,    // standard cards, buttons, inputs
  xl:   14,    // plant image thumbnails in list
  full: 9999,  // FAB, circular icon buttons, pill badges
}
```

#### 2.4 Typography

```ts
export const fontSize = {
  xs:   12,
  sm:   14,
  md:   16,
  lg:   18,
  xl:   20,
  xxl:  24,
  xxxl: 30,
}

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
}

export const lineHeight = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.75,
}
```

#### 2.5 Shadows

```ts
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 16,
  },
}
```

---

### 3. Layout System

#### 3.1 Screen Wrapper (every screen)

Every screen's root view must be a `LinearGradient` from `expo-linear-gradient`:

```tsx
import { LinearGradient } from 'expo-linear-gradient'

<LinearGradient
  colors={colors.backgroundGradient}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{ flex: 1 }}
>
  <ScrollView
    contentContainerStyle={{
      paddingHorizontal: spacing.md,   // 16
      paddingTop: spacing.lg,          // 24
      paddingBottom: 96,               // extra space for FAB on list screens
    }}
  >
    {/* screen content */}
  </ScrollView>
</LinearGradient>
```

- Inner content max width: `672` (center with `alignSelf: 'center', width: '100%', maxWidth: 672`)
- List screens (My Plants, Schedule) need `paddingBottom: 96` for FAB clearance
- Non-list screens (Add Plant, Plant Detail): `paddingBottom: spacing.xl` (32)

#### 3.2 Navigation Header

Configure in `app/_layout.tsx` and `app/(tabs)/_layout.tsx`:

```tsx
screenOptions={{
  headerStyle: { backgroundColor: 'rgba(255,255,255,0.92)' },
  headerShadowVisible: true,
  headerTitleStyle: {
    fontSize: fontSize.lg,       // 18
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  headerTintColor: colors.text,
  headerBackTitle: '',
}}
```

#### 3.3 Tab Bar

```tsx
tabBarStyle: {
  backgroundColor: colors.surface,
  borderTopWidth: 1,
  borderTopColor: colors.border,
},
tabBarActiveTintColor: colors.green,
tabBarInactiveTintColor: colors.textMuted,
tabBarLabelStyle: {
  fontSize: fontSize.xs,         // 12
  fontWeight: fontWeight.medium,
},
```

Tab labels (text only, no emoji):
- Tab 1: **"My Plants"**
- Tab 2: **"Schedule"**
- Tab 3: **"Add Plant"**

---

### 4. Component Specifications

#### 4.1 Button

Create/update a reusable `Button` component at `src/ui/Button.tsx`.

**Variants:**

| Variant        | Background   | Text         | Border                  | Pressed bg/opacity  |
|----------------|--------------|--------------|-------------------------|---------------------|
| `primary`      | `#030213`    | `#FFFFFF`    | none                    | opacity → 0.85      |
| `green`        | `#059669`    | `#FFFFFF`    | none                    | bg `#047857`        |
| `blue`         | `#2563EB`    | `#FFFFFF`    | none                    | opacity → 0.85      |
| `outline`      | transparent  | `#030213`    | 1px `#E5E7EB`           | bg `#F9FAFB`        |
| `waterOutline` | `#EFF6FF`    | `#2563EB`    | 1px `#BFDBFE`           | bg `#DBEAFE`        |
| `destructive`  | `#D4183D`    | `#FFFFFF`    | none                    | opacity → 0.85      |
| `deleteOutline`| transparent  | `#D4183D`    | 1px `#FECDD3`           | bg `#FFF1F2`        |
| `ghost`        | transparent  | `#030213`    | none                    | bg `#F3F4F6`        |

**Sizes:**

| Size   | height | paddingH | fontSize | fontWeight |
|--------|--------|----------|----------|------------|
| `sm`   | 32     | 12       | 14       | medium     |
| `md`   | 36     | 16       | 16       | medium     |
| `lg`   | 48     | 24       | 16       | semibold   |
| `icon` | 36×36  | —        | —        | —          |

**Common properties:**
- `borderRadius: borderRadius.lg` (10) — default; pass `rounded="full"` for circular
- Disabled: `opacity: 0.5`, `pointerEvents: 'none'`
- Active feedback: `activeOpacity={0.85}` on TouchableOpacity **or** `Animated.spring` scale to `0.95`
- Leading icon: 16px, same color as label text, `marginRight: 8`
- All text: `includeFontPadding: false` (Android)

#### 4.2 Card

```ts
// Standard card style
{
  backgroundColor: colors.surface,     // #FFFFFF
  borderWidth: 1,
  borderColor: colors.border,          // rgba(0,0,0,0.10)
  borderRadius: borderRadius.xl,       // 14
  padding: spacing.lg,                 // 24  (standard)
  // or padding: spacing.md for compact (16)
  overflow: 'hidden',
  ...shadows.sm,
}
```

On press (Pressable): transition to `shadows.md`.

#### 4.3 Badge / Status Pill

```ts
// Container
{
  alignSelf: 'flex-start',
  borderRadius: borderRadius.md,   // 8
  paddingHorizontal: 8,
  paddingVertical: 2,
}

// Text
{
  fontSize: fontSize.xs,           // 12
  fontWeight: fontWeight.medium,
}
```

**Variant styles:**

| Variant    | bg          | text color  | border      |
|------------|-------------|-------------|-------------|
| `default`  | `#030213`   | `#FFFFFF`   | none        |
| `overdue`  | `#FFF1F2`   | `#D4183D`   | none        |
| `dueSoon`  | `#FFF7ED`   | `#EA580C`   | none        |
| `ok`       | `#D1FAE5`   | `#059669`   | none        |
| `outline`  | transparent | `#030213`   | 1px `#E5E7EB` |

#### 4.4 Input

```ts
{
  height: 48,
  backgroundColor: '#F3F4F6',       // gray-100
  borderWidth: 1,
  borderColor: colors.border,       // rgba(0,0,0,0.10) unfocused
  // focused: borderWidth: 2, borderColor: colors.green (#059669)
  borderRadius: borderRadius.lg,    // 10
  paddingHorizontal: 12,
  fontSize: fontSize.md,            // 16
  color: colors.text,               // #030213
  // placeholder: colors.textMuted (#6B7280)
}
```

Use `onFocus`/`onBlur` state to toggle focus border style.

#### 4.5 Label

```ts
{
  fontSize: fontSize.sm,            // 14
  fontWeight: fontWeight.medium,
  color: colors.text,               // #030213
  marginBottom: 6,
  // marginTop: spacing.md (16) between field groups; 0 for first label
}
```

#### 4.6 FAB (Floating Action Button)

New component at `src/ui/FAB.tsx`:

```ts
// Outer TouchableOpacity/Pressable
{
  position: 'absolute',
  bottom: 32,
  right: 20,
  width: 56,
  height: 56,
  borderRadius: borderRadius.full,  // 9999
  backgroundColor: colors.green,   // #059669
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  ...shadows.xl,
}
```

- Icon: `Plus` (lucide-react-native), size 24, color `#FFFFFF`
- Active animation: `Animated.spring` scale to `0.93` on press, back to `1.0` on release
- Must be rendered as a sibling to the ScrollView inside a `flex: 1` container (not inside ScrollView)

#### 4.7 PlantCard

Update `src/ui/PlantCard.tsx`. Horizontal flex layout:

**Card container:**
```ts
{
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,                          // space between image and info
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: borderRadius.xl,    // 14
  padding: spacing.md,              // 16
  marginBottom: spacing.md,         // 16 between cards
  overflow: 'hidden',
  ...shadows.sm,
}
```

**Image section:**
```ts
{
  width: 96,                        // upgraded from 64
  height: 96,
  borderRadius: borderRadius.xl,    // 14
  backgroundColor: '#F3F4F6',       // fallback bg
  overflow: 'hidden',
}
// Image: resizeMode='cover'
// Fallback (no photo): centered Droplet icon, size 32, color '#9CA3AF' (gray-400)
```

**Info section** (`flex: 1`):
```
Row 1: Plant name
  fontSize: 18, fontWeight: medium, color: #030213

Row 2: Species
  fontSize: 14, fontStyle: italic, color: #4B5563
  marginTop: 2

Row 3 (flex row, justifyContent: space-between, alignItems: center, marginTop: 8):
  Left: last watered text
    fontSize: 14, color: #6B7280
  Right: small Water button
    variant: waterOutline, size: sm, Droplet icon leading
```

**Chevron:**
- `ArrowRight` icon, size 16, color `#9CA3AF`, positioned at far right of card (not inside info column — add as a third sibling in the card's flex row)

#### 4.8 EmptyState

Update `src/ui/EmptyState.tsx`:

```ts
// Container
{
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: spacing.xxl,             // 48
}

// Icon circle
{
  width: 80,
  height: 80,
  borderRadius: borderRadius.full,
  backgroundColor: colors.greenLight,  // #D1FAE5
  alignItems: 'center',
  justifyContent: 'center',
}
// Inner icon: Plus (lucide), size 40, color colors.green (#059669)

// Heading
{
  fontSize: fontSize.xl,            // 20
  fontWeight: fontWeight.semibold,
  color: colors.text,
  textAlign: 'center',
  marginTop: spacing.lg,            // 24
}

// Message
{
  fontSize: fontSize.md,            // 16
  color: colors.textSecondary,      // #4B5563
  textAlign: 'center',
  marginTop: spacing.sm,            // 8
  lineHeight: 24,
}

// Optional CTA button (prop: ctaLabel, onCta)
// variant: green, size: lg, marginTop: 24, leading Plus icon
```

Props:
```ts
interface EmptyStateProps {
  title: string
  message: string
  ctaLabel?: string
  onCta?: () => void
}
```

#### 4.9 Logo (optional, for header)

Horizontal flex, `alignItems: 'center'`, `gap: 8`:
- Icon box: `32×32`, `borderRadius: 8`, background `LinearGradient(['#059669', '#10B981'])`
  - Inner: `Sprout` or `Leaf` icon (lucide), size 18, color `#FFFFFF`
- Text `"Mulsikmul"`: `fontSize: 18`, `fontWeight: bold`, color `#059669`

---

### 5. Screen Designs

#### Screen 1: My Plants (Home) — `app/(tabs)/index.tsx`

**Root:** `LinearGradient` → `View style={{ flex: 1 }}` (position relative for FAB)

**Content in ScrollView:**

```
┌─ Page header ────────────────────────────────────┐
│  "My Plants"                                     │
│  fontSize: 30 (xxxl), fontWeight: bold           │
│  color: #030213, marginBottom: 4                 │
│                                                  │
│  "{n} plants" or "Start your collection"         │
│  fontSize: 16 (md), color: #4B5563               │
│  marginBottom: 32                                │
└──────────────────────────────────────────────────┘

[If plants exist]
┌─ PlantCard × n ──────────────────────────────────┐
│  FlatList / map of PlantCard components          │
│  marginBottom: 16 between each                   │
└──────────────────────────────────────────────────┘

[If no plants]
┌─ EmptyState ─────────────────────────────────────┐
│  title: "No plants yet"                          │
│  message: "Add your first plant to get started"  │
│  ctaLabel: "Add First Plant"                     │
│  onCta: navigate to Add Plant tab                │
└──────────────────────────────────────────────────┘
```

**FAB** (absolute, outside ScrollView):
- Position: `bottom: 32, right: 20`
- `onPress`: navigate to Add Plant tab (`router.push('/(tabs)/add')`)

**Data loading:** `useFocusEffect` + `useCallback` to reload plants on every screen focus.

---

#### Screen 2: Watering Schedule — `app/(tabs)/schedule.tsx`

**Root:** Same gradient + `View style={{ flex: 1 }}`

**Page header:** same pattern as home
- Title: `"Schedule"`, 30px bold
- Subtitle: `"Sorted by urgency"`, 16px `#4B5563`

**Each schedule row** (Card component, compact padding 16):

```
┌─ Schedule Row Card ──────────────────────────────┐
│  [flexDirection: row, alignItems: center]        │
│                                                  │
│  Info (flex: 1)                                  │
│  ├─ Plant name: 16px semibold, #030213           │
│  └─ Urgency text: 14px, colored                  │
│       overdue:  "Overdue · Water now!"  #D4183D  │
│       dueSoon:  "Water in {n} days"     #EA580C  │
│       ok:       "Next in {n} days"      #059669  │
│                                                  │
│  Water button (right)                            │
│     variant: waterOutline                        │
│     size: sm                                     │
│     icon: Droplet (leading)                      │
│     label: "Water"                               │
└──────────────────────────────────────────────────┘
```

**Empty state:**
- title: `"All caught up!"`
- message: `"No plants are scheduled for watering"`

**FAB** (same as home screen, navigates to Add Plant)

**Data loading:** `useFocusEffect`

---

#### Screen 3: Add Plant — `app/(tabs)/add.tsx`

**Root:** `LinearGradient` → `KeyboardAvoidingView` → `ScrollView`

**Header row** (flex row, alignItems center, gap 12, marginBottom 24):
- Back/cancel button: `ghost` variant, `icon` size, `ArrowLeft` icon (or `X`)
- Title: `"Add New Plant"`, 20px, fontWeight semibold, `#030213`

**Photo Picker area** (full width, inside Card or standalone):

*Empty state (no photo):*
```ts
{
  height: 192,
  backgroundColor: '#F3F4F6',
  borderWidth: 2,
  borderStyle: 'dashed',
  borderColor: '#D1D5DB',           // gray-300
  borderRadius: borderRadius.lg,    // 10
  alignItems: 'center',
  justifyContent: 'center',
  // On press/active: borderColor → #059669, backgroundColor → #F0FDF4
}
// Content (centered):
//   Upload icon circle: 64×64, bg #D1FAE5, borderRadius full
//     Upload icon (lucide), size 24, color #059669
//   "Upload Photo": fontSize 16, fontWeight medium, marginTop 12
//   "Tap to select": fontSize 14, color #6B7280
```

*With photo:*
```ts
{
  height: 256,
  borderRadius: borderRadius.lg,
  overflow: 'hidden',
}
// Image: width '100%', height 256, resizeMode 'cover'
// Overlay bar (bottom, absolute):
{
  position: 'absolute',
  bottom: 0, left: 0, right: 0,
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 12,
  paddingVertical: 12,
  backgroundColor: 'rgba(0,0,0,0.45)',
}
// "Change Photo" button: ghost + white text + Camera icon
// "Remove" button: ghost + white text + X icon
```

**Form fields** (space between each: `marginTop: spacing.md`):

1. **Name** (required)
   - Label: `"Plant Name *"` (asterisk in `#D4183D`)
   - Input: standard, placeholder `"e.g. Monstera Deliciosa"`

2. **Species** (optional)
   - Label: `"Species"`
   - Input: placeholder `"e.g. Monstera deliciosa"`

3. **Watering Interval**
   - Label: `"Water every"`
   - Input: `keyboardType: 'numeric'`, `width: 80`, default `"7"`
   - Suffix text: `"days"` inline to the right of input

4. **Notes**
   - Label: `"Notes"`
   - Input: `multiline: true`, `minHeight: 80`, `textAlignVertical: 'top'`

**Care Summary Card** (only visible when Perenual API data is loaded):
```ts
{
  backgroundColor: '#F0FDF4',       // green-50
  borderWidth: 1,
  borderColor: '#A7F3D0',           // green-200
  borderRadius: borderRadius.lg,
  padding: spacing.lg,
  marginTop: spacing.md,
}
// Title: "Care Summary", 14px semibold, color #059669
// 3 info rows (flexDirection row, justifyContent space-between):
//   "Light"    | value (14px medium, #030213)
//   "Water"    | value
//   "Pet Safe" | value
// Divider (height 1, bg #E5E7EB) between rows
```

**Action buttons** (flex row, gap 12, marginTop 32):
```
Cancel        | Add Plant
─────────────   ─────────────
variant: outline | variant: green
flex: 1          | flex: 1
height: 48       | height: 48
                 | disabled when Name is empty
```

---

#### Screen 4: Plant Detail — `app/plant/[id].tsx`

**Root:** `LinearGradient` wrapping everything including hero image

**Hero section** (no paddingH, touches edges):
```ts
// Hero container
{
  width: '100%',
  height: 288,
  position: 'relative',
}

// Image (if photo_uri set):
{
  width: '100%',
  height: 288,
  resizeMode: 'cover',
}

// No-image placeholder:
{
  width: '100%',
  height: 288,
  // LinearGradient(['#059669', '#10B981', '#14B8A6']), flex 1
  alignItems: 'center',
  justifyContent: 'center',
}
// Placeholder: Leaf icon, size 64, color rgba(255,255,255,0.7)

// Gradient overlay ON TOP of image (darkens bottom):
// LinearGradient(['transparent', 'rgba(0,0,0,0.30)'])
// position: absolute, bottom: 0, left: 0, right: 0, height: 120

// Back button (absolute):
{
  position: 'absolute',
  top: 16,
  left: 16,
  width: 36,
  height: 36,
  borderRadius: 9999,
  backgroundColor: 'rgba(255,255,255,0.9)',
  alignItems: 'center',
  justifyContent: 'center',
  ...shadows.sm,
}
// Icon: ArrowLeft, size 20, color #030213
```

**Content section** (paddingHorizontal 16, paddingTop 24):

```
Plant name
  fontSize: 30 (xxxl), fontWeight: bold, color: #030213, marginBottom: 4

Scientific name (species)
  fontSize: 18 (lg), fontStyle: italic, color: #4B5563, marginBottom: 24

Action buttons (flex row, gap 12)
  "Water Now"  →  variant: blue, flex: 1, height: 48, Droplet icon leading
  "Edit"       →  variant: outline, flex: 1, height: 48

Plant Info card (marginTop: 16)
  Card style (padding 24)
  ├─ Section title: "Plant Info", fontSize 18, fontWeight medium, marginBottom 16
  ├─ Info row: "Date Added"       | formatted date
  ├─ Divider
  ├─ Info row: "Last Watered"     | date + "(3 days ago)"
  ├─ Divider
  ├─ Info row: "Watering Interval"| "Every {n} days"
  ├─ Divider
  └─ Info row: "Status"           | Badge (overdue/dueSoon/ok variant)

  // Info row style (flex row, justifyContent space-between, paddingVertical 10):
  //   Label: fontSize 14, color #4B5563
  //   Value: fontSize 14, fontWeight medium, color #030213

Notes card (only if notes exist, marginTop 16)
  Card style (padding 24)
  ├─ Section title: "Notes", same as above
  └─ Notes text: fontSize 16, color #030213, lineHeight 24

Delete button (full width, height 48, marginTop 16, marginBottom 32)
  variant: deleteOutline
  Trash2 icon leading (size 16, color #D4183D)
  label: "Delete Plant"
```

**Delete confirmation dialog:**
```ts
// Overlay
{
  position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
  backgroundColor: 'rgba(0,0,0,0.50)',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
}

// Dialog card
{
  backgroundColor: colors.surface,
  borderRadius: borderRadius.xl,     // 14
  padding: spacing.lg,               // 24
  maxWidth: '90%',
  width: '100%',
  ...shadows.lg,
}

// Title: "Delete {name}?"  — fontSize 18, fontWeight semibold, textAlign center
// Description: confirmation text — fontSize 14, color #4B5563, textAlign center, marginTop 8

// Buttons (flex row, gap 12, marginTop 24)
//   Cancel:  variant outline, flex 1, height 44
//   Delete:  variant destructive, flex 1, height 44
```

Entry/exit: fade + scale animation (see Section 6).

---

### 6. Animations

| Interaction             | Implementation                                                               |
|-------------------------|------------------------------------------------------------------------------|
| Button press            | `TouchableOpacity activeOpacity={0.85}` **or** `Animated.spring` → scale 0.95 |
| Card press (PlantCard)  | `Animated.spring` → scale 0.99, returns to 1.0                              |
| FAB press               | `Animated.spring` → scale 0.93, returns to 1.0                              |
| Dialog open             | `Animated.timing` opacity 0→1 + scale 0.95→1, duration 200ms                |
| Dialog close            | `Animated.timing` opacity 1→0 + scale 1→0.95, duration 150ms                |
| Water button confirm    | `Animated.sequence`: scale 1→1.1→1, duration 300ms total                    |
| Screen entry            | `Animated.timing` opacity 0→1, duration 200ms (optional, adds polish)       |

Use `useNativeDriver: true` on all animations that only animate `opacity` and `transform`.

---

### 7. Icons

Install `lucide-react-native` if not already present:
```bash
npm install lucide-react-native
```
Requires `react-native-svg` (already in Expo SDK).

**Icon usage map:**

| Location                    | Icon name       | Size | Color                        |
|-----------------------------|-----------------|------|------------------------------|
| FAB                         | `Plus`          | 24   | `#FFFFFF`                    |
| Empty state circle          | `Plus`          | 40   | `#059669`                    |
| Back button                 | `ArrowLeft`     | 20   | `#030213`                    |
| PlantCard chevron           | `ChevronRight`  | 16   | `#9CA3AF`                    |
| Edit action                 | `Pencil`        | 16   | `#030213`                    |
| Delete action               | `Trash2`        | 16   | `#D4183D`                    |
| Water action button         | `Droplet`       | 16   | `#2563EB` (or white on solid)|
| PlantCard water fallback    | `Droplet`       | 32   | `#9CA3AF`                    |
| Photo upload (empty)        | `Upload`        | 24   | `#059669`                    |
| Change photo                | `Camera`        | 16   | `#FFFFFF`                    |
| Remove photo                | `X`             | 16   | `#FFFFFF`                    |
| Logo icon                   | `Sprout`        | 18   | `#FFFFFF`                    |
| Plant detail placeholder    | `Leaf`          | 64   | `rgba(255,255,255,0.7)`      |

---

### 8. Data Model

(Unchanged from original spec)

### SQLite Tables

**plants**
| Column      | Type    | Notes                       |
|-------------|---------|-----------------------------|
| id          | INTEGER | Primary key, auto-increment |
| name        | TEXT    | Required                    |
| species     | TEXT    | Nullable                    |
| perenual_id | INTEGER | Nullable, links to API      |
| photo_uri   | TEXT    | Nullable, local file URI    |
| notes       | TEXT    | Nullable                    |
| created_at  | INTEGER | Unix timestamp ms           |

**watering_schedule**
| Column          | Type    | Notes                              |
|-----------------|---------|------------------------------------|
| id              | INTEGER | Primary key, auto-increment        |
| plant_id        | INTEGER | Unique, FK → plants, cascade delete|
| interval_days   | INTEGER | Default 7                          |
| last_watered_at | INTEGER | Nullable, Unix timestamp ms        |
| notification_id | TEXT    | Nullable, expo notification ID     |

---

## Tech Stack

| Layer          | Technology                    |
|----------------|-------------------------------|
| Framework      | React Native + Expo SDK 55    |
| Language       | TypeScript 5.9 (strict)       |
| Navigation     | Expo Router (file-based)      |
| Database       | expo-sqlite                   |
| Notifications  | expo-notifications            |
| Image Picker   | expo-image-picker             |
| File Storage   | expo-file-system              |
| Gradient       | expo-linear-gradient          |
| Icons          | lucide-react-native           |
| Plant Data API | Perenual (perenual.com/api)   |
| Testing        | Jest + ts-jest + @testing-library/react-native |

---

## Architecture

```
app/                    ← Expo Router pages (UI layer)
  _layout.tsx           ← Root: providers (DB, SafeArea), header config
  (tabs)/               ← Tab navigator
    _layout.tsx         ← Tab config (My Plants, Schedule, Add Plant)
    index.tsx           ← My Plants — list + FAB
    schedule.tsx        ← Watering Schedule — urgency rows + FAB
    add.tsx             ← Add Plant — form with photo picker
  plant/[id].tsx        ← Plant Detail — hero, info, actions (stack)

src/
  api/perenual.ts       ← External API client
  db/
    schema.ts           ← Table DDL + migrations
    queries.ts          ← CRUD functions (all take db param)
    provider.tsx        ← React context for DB access
  notifications/
    scheduler.ts        ← Permission + schedule + cancel
  types/plant.ts        ← All TypeScript interfaces
  ui/                   ← Shared UI components
    theme.ts            ← Design tokens (colors, spacing, radius, shadows, typography)
    Button.tsx          ← Reusable button component (all variants + sizes)
    PlantCard.tsx       ← List item component (96px image, info, chevron)
    EmptyState.tsx      ← Empty state component (icon circle, title, message, CTA)
    FAB.tsx             ← Floating Action Button (green circle, Plus icon)
  utils/
    watering.ts         ← Date calculation helpers
  config.ts             ← App configuration
```

---

## Implementation Order

Execute in this order to avoid broken intermediate states:

1. **`src/ui/theme.ts`** — replace all tokens with values from Section 2
2. **`src/ui/Button.tsx`** — new component with all variants and sizes (Section 4.1)
3. **`src/ui/PlantCard.tsx`** — 96px image, info row, chevron, water button (Section 4.7)
4. **`src/ui/EmptyState.tsx`** — icon circle, CTA prop (Section 4.8)
5. **`src/ui/FAB.tsx`** — new component (Section 4.6)
6. **`app/(tabs)/_layout.tsx`** — new tab bar colors, text labels (Section 3.3)
7. **`app/_layout.tsx`** — new header styles (Section 3.2)
8. **`app/(tabs)/index.tsx`** — gradient bg, page header, FlatList, FAB (Screen 1)
9. **`app/(tabs)/schedule.tsx`** — gradient bg, page header, row cards, FAB (Screen 2)
10. **`app/(tabs)/add.tsx`** — gradient bg, photo picker, form redesign (Screen 3)
11. **`app/plant/[id].tsx`** — hero image with gradient overlay, back btn, info card, delete dialog (Screen 4)
12. **Run `make test`** — fix any snapshot/style failures

---

## Roadmap

### v1.0 — MVP (current)
- [x] Database schema and queries
- [x] Perenual API client
- [x] Notification scheduler
- [x] TypeScript types
- [x] Full UI implementation
- [x] Plant CRUD flow
- [x] Watering schedule view

### v1.1 — Enhancements
- [ ] Edit plant details inline
- [ ] Perenual API search modal (auto-fill from search)
- [ ] Plant photo gallery (multiple photos)
- [ ] Watering history log
- [ ] Dark mode support

### v2.0 — Future
- [ ] Cloud sync (Supabase or similar)
- [ ] Additional care tracking (fertilizing, repotting)
- [ ] Plant health tips based on species
- [ ] Widgets for quick watering status
