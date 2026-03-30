# Implementation Plan — 물식물 MVP

## Context

The product brief defines 3 MVP features for the plant care app. The app already has a solid foundation (SQLite DB, notifications, plant CRUD, 61 tests), but has gaps:

1. **Feature 1 (Add plants offline):** Missing "acquired date" field
2. **Feature 2 (Plant info):** Missing light needs, toxicity, care tips display
3. **Feature 3 (Notifications):** Already functional — no changes needed
4. **CI/CD:** No deployment pipeline — need GitHub Actions for tests + APK releases
5. **i18n:** UI has mixed Korean/English strings — need French + Korean with selector
6. **UI:** Visual inconsistencies — need polish, reusable components, icons, animations

---

## Implementation Order

### Step 0 — CI/CD Pipeline (CICD-1, CICD-2)

**New file: `.github/workflows/ci.yml`**
- Trigger: push to main/develop + pull_request
- Job: checkout → setup Node 20 → npm ci → npm test
- Fail-fast on test failure

**New file: `.github/workflows/release.yml`**
- Trigger: push tag `v*`
- Job 1: Run tests
- Job 2: Build APK via `eas build --profile preview --platform android --non-interactive`
  - Requires `EXPO_TOKEN` secret in GitHub repo settings
- Job 3: Create GitHub Release with APK attached (via `softprops/action-gh-release`)
  - Auto-generate changelog from commits since last tag

**Prerequisite for user:** Add `EXPO_TOKEN` as a GitHub repo secret.

---

### Step 1 — i18n System (I18N-1)

**New file: `src/i18n/translations.ts`**
- Define `Language` type: `'fr' | 'ko'`
- Export `translations` object with all UI strings in both languages
- Extract all existing strings from: tab titles (3), search modal (4), add screen (~12), detail screen (~8), schedule screen (~3), empty states (~3)

**New file: `src/i18n/LanguageContext.tsx`**
- React context + provider with `language` state and `t()` helper
- Persist language choice in SQLite settings table
- Default to French

**Modify: `app/_layout.tsx`**
- Wrap app in `LanguageProvider`

---

### Step 2 — Database Schema Changes (CARE-2, PLANT-1)

**Modify: `src/db/schema.ts`**
- Migration 3: `ALTER TABLE plants ADD COLUMN acquired_at INTEGER`
- Migration 4: `CREATE TABLE IF NOT EXISTS plant_care_info (id, plant_id UNIQUE FK, sunlight TEXT, poisonous_to_pets INTEGER DEFAULT 0, care_tips TEXT)`

**Modify: `src/db/provider.tsx`**
- Wrap each migration in try-catch (ALTER TABLE fails if column already exists)

---

### Step 3 — Types Update

**Modify: `src/types/plant.ts`**
- Add `acquired_at: number | null` to `LocalPlant` and `PlantWithSchedule`
- Add `PlantCareInfo` interface: `{ id, plant_id, sunlight, poisonous_to_pets: boolean, care_tips }`

---

### Step 4 — Enrich Local Houseplant Database (CARE-1)

**Modify: `src/data/houseplants.ts`**
- Add 2 optional fields to `HouseplantEntry`: `sunlight?: string`, `poisonous_to_pets?: boolean`
- Add factual data for all 134 entries

---

### Step 5 — Query Layer (CARE-2, PLANT-1)

**Modify: `src/db/queries.ts`**
- Update `insertPlant` to include `acquired_at` column
- Add `upsertPlantCareInfo(db, info)` — INSERT ON CONFLICT UPDATE pattern
- Add `getPlantCareInfo(db, plantId)` — returns `PlantCareInfo | null`

---

### Step 6 — Add Plant Screen (PLANT-1, CARE-2)

**Modify: `app/(tabs)/add.tsx`**
- Add `acquiredAt` date input (DD/MM/YYYY text format, no new dependency)
- Pass `acquired_at` timestamp to `insertPlant`
- After insert, call `upsertPlantCareInfo` with data from selected houseplant entry
- Replace hardcoded strings with `t()` calls

**Modify: `src/ui/PlantSearchModal.tsx`**
- Pass `sunlight`, `poisonous_to_pets` in search result callback
- Replace Korean strings with `t()` calls

---

### Step 7 — Plant Detail Screen (CARE-3)

**Modify: `app/plant/[id].tsx`**
- Fetch `PlantCareInfo` on focus
- Display acquired date (formatted)
- Add "Care Info" section: sunlight, toxicity to pets, care tips
- Replace hardcoded strings with `t()` calls

---

### Step 8 — i18n All Screens

**Modify:** `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/schedule.tsx`, `src/ui/PlantCard.tsx`, `src/ui/EmptyState.tsx`
- Replace all hardcoded UI strings with `t()` calls

---

### Step 9 — Language Selector (I18N-2)

- Toggle accessible from app header or settings
- Persist choice between sessions

---

### Step 10 — UI Polish & Reusable Components (UI-1)

**New file: `src/ui/Badge.tsx`** — Unified status badge (overdue/due_soon/ok)
**New file: `src/ui/Input.tsx`** — Reusable TextInput with focus/error/disabled states
**New file: `src/ui/Button.tsx`** — Variants: primary, secondary, danger + pressed/disabled states

**Modify: `app/(tabs)/_layout.tsx`**
- Replace emoji tab icons (🌿💧➕) with Ionicons (`leaf`, `water`, `add-circle`)

**Modify all screens:**
- Replace hardcoded `marginTop: 2` / `marginBottom: 2` with `spacing.xs` (4px)
- Use new Badge, Input, Button components

---

### Step 11 — Animations & Transitions (UI-2)

- Button press feedback (Animated scale 0.96)
- Badge color transitions on status change
- Search modal slide-up animation
- Plant detail photo fade-in

---

### Step 12 — Tests

- Update schema tests (MIGRATIONS length, new migration content)
- Update query tests (`insertPlant` with `acquired_at`, new care info queries)
- Update type conformance tests (`PlantCareInfo`, `LocalPlant.acquired_at`)
- Add i18n tests (translations completeness, `t()` function)

---

## Critical Files

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | **NEW** — CI pipeline |
| `.github/workflows/release.yml` | **NEW** — CD pipeline with APK release |
| `src/i18n/translations.ts` | **NEW** — all UI strings FR/KO |
| `src/i18n/LanguageContext.tsx` | **NEW** — context + provider + `t()` |
| `src/ui/Badge.tsx` | **NEW** — unified status badge |
| `src/ui/Input.tsx` | **NEW** — reusable input with states |
| `src/ui/Button.tsx` | **NEW** — button variants + press animation |
| `src/db/schema.ts` | 2 new migrations |
| `src/db/provider.tsx` | try-catch migration runner |
| `src/db/queries.ts` | `insertPlant` update + 2 new functions |
| `src/types/plant.ts` | `acquired_at` + `PlantCareInfo` |
| `src/data/houseplants.ts` | 2 new fields on 134 entries |
| `app/_layout.tsx` | LanguageProvider wrapper |
| `app/(tabs)/add.tsx` | acquired date + care info persist + i18n |
| `app/plant/[id].tsx` | care info display + acquired date + i18n |
| `app/(tabs)/_layout.tsx` | tab titles i18n + Ionicons |
| `src/ui/PlantSearchModal.tsx` | pass care data + i18n |

## Reuse Existing Code

- `buildCareNotes()` in `src/utils/careNotes.ts` — already implemented, never called
- `upsertWateringSchedule` pattern in `src/db/queries.ts` — reuse for `upsertPlantCareInfo`
- Theme tokens from `src/ui/theme.ts` — for all new UI
- `useFocusEffect` pattern — already used in all screens

## Verification

1. `make test` — all existing + new tests pass
2. GitHub Actions CI triggers on push and passes
3. Manual verify on `make web`:
   - Add a plant with photo, name, acquired date → saved correctly
   - Plant detail shows acquired date, light, toxicity, tips
   - Language toggle switches all strings FR ↔ KO
   - Tab bar shows Ionicons, badges consistent across screens
   - Buttons have press feedback
4. Tag `v1.0.0` → GitHub Release created with APK attached
