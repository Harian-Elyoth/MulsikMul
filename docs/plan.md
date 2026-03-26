# Plan: Plant Search from Perenual Database + UI Polish

## Context
The Add Plant screen currently requires manual entry of all plant data. The Perenual API client is already integrated (`src/api/perenual.ts`) with search, detail, and care guide endpoints, but not yet used in any UI. The user wants to search an open plant database when registering a new plant, auto-fill watering info and care notes, polish the UI, and incorporate the app logo (`assets/android/mipmap-xxxhdpi/ic_launcher.png` — a kawaii plant pot).

## Implementation

### Step 1: Utility Functions (no UI dependencies)

**New file: `src/utils/wateringInterval.ts`**
- `deriveWateringIntervalDays(detail: PlantDetail): number`
- Parse `watering_general_benchmark.value` (handles ranges like `"7-10"` → average)
- Convert `unit` to days multiplier (`"days"`=1, `"week"`=7)
- Fallback to `watering` string: `"Frequent"`→3, `"Average"`→7, `"Minimum"`→14, `"None"`→30
- Clamp to minimum 1 day

**New file: `src/utils/careNotes.ts`**
- `buildCareNotes(detail: PlantDetail, careGuide: CareGuide | null): string`
- Include care guide sections (watering, sunlight, pruning) with headers
- Append facts: care_level, indoor-friendly, drought-tolerant, toxic-to-pets warning
- Return plain text string (displayed in TextInput)

### Step 2: Search Modal Component

**New file: `src/ui/PlantSearchModal.tsx`**

Props: `visible`, `onClose`, `onSelect(data)` where data = `{name, species, intervalDays, notes, photoUrl, perenualId}`

Behavior:
1. Search input with 500ms debounce (useRef + setTimeout, no library)
2. Call `searchPlants(query, apiKey)` → show results in FlatList
3. Each result row: thumbnail (48x48), common_name (bold), scientific_name (italic), watering badge
4. On tap: fetch `getPlantDetail` + `getCareGuide` in parallel (Promise.allSettled)
5. Run `deriveWateringIntervalDays` + `buildCareNotes`, call `onSelect`
6. CareGuide failure handled gracefully (notes built from PlantDetail alone)
7. Loading states: spinner during search, overlay during detail fetch
8. App logo displayed in the modal header area

Styling:
- Modal slides up, white background, rounded top corners, ~85% screen height
- Uses existing theme tokens (colors, spacing, borderRadius, fontSize)
- Search input with magnifying glass icon
- Result cards with subtle elevation and plant thumbnails

### Step 3: Integrate into Add Plant Screen

**Modify: `app/(tabs)/add.tsx`**

1. Add state: `searchModalVisible`, `perenualId`, `autoFilled`
2. Add app logo at top of form (small, centered, from `ic_launcher.png`)
3. Add "Search Plant Database" button below logo, styled as outlined/accent button
4. Render `PlantSearchModal` conditionally
5. `handleSearchSelect` callback:
   - Set name, species, intervalDays, notes, perenualId, autoFilled
   - Download photo via `FileSystem.downloadAsync` if available (same pattern as existing `pickImage`)
   - Set photoUri to local path
6. Update `handleSave` to pass `perenualId` to `insertPlant`
7. Show green "Auto-filled from database" indicator when autoFilled=true
8. If user clears name manually → reset autoFilled and perenualId
9. UI polish: better section spacing, subtle dividers, improved button styles

### Step 4: UI Polish Across the Form

- App logo (ic_launcher.png) displayed at top of Add Plant screen
- Better visual hierarchy with section headers
- Search button visually distinct from save button (outlined style with accent color)
- Photo picker area with improved styling
- Consistent input field styling with focus states
- Auto-filled fields get a subtle green tint or indicator

## Files to Create
- `src/utils/wateringInterval.ts` — watering interval derivation
- `src/utils/careNotes.ts` — care notes compilation
- `src/ui/PlantSearchModal.tsx` — search modal component

## Files to Modify
- `app/(tabs)/add.tsx` — add search integration, logo, UI polish

## Existing Code to Reuse
- `src/api/perenual.ts` — `searchPlants`, `getPlantDetail`, `getCareGuide` (no changes needed)
- `src/types/plant.ts` — `PlantSummary`, `PlantDetail`, `CareGuide` types (no changes needed)
- `src/config.ts` — `PERENUAL_API_KEY` (no changes needed)
- `src/db/queries.ts` — `insertPlant` already accepts `perenual_id` (no changes needed)
- `src/ui/theme.ts` — all theme tokens (no changes needed)

## No New Dependencies
Everything uses React Native built-ins (`Modal`, `FlatList`, `ActivityIndicator`, `Image`, `Pressable`) and existing Expo packages (`expo-file-system`).

## Verification
1. `make test` — existing tests should still pass
2. Manual test flow:
   - Open Add Plant → see logo and "Search Plant Database" button
   - Tap search → modal opens, type a plant name (e.g. "monstera")
   - Results appear with thumbnails and info
   - Tap a result → fields auto-fill (name, species, interval, notes, photo)
   - "Auto-filled" indicator visible
   - Edit any field manually → still works
   - Save → plant created with perenual_id in DB
   - Verify on home screen and plant detail
3. Test edge cases:
   - Search with no results → empty state message
   - Missing API key → graceful message
   - Slow network → loading indicators visible
   - CareGuide not found → notes still populated from PlantDetail
   - Cancel search → return to form unchanged
