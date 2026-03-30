# Mulsikmul — Plant Care App

## Overview
Cross-platform mobile app (iOS, Android, Web) for managing houseplant watering schedules with push notifications. Built with Expo SDK 55 + React Native + TypeScript (strict mode).

## Tech Stack
- **Framework:** Expo ~55 / React Native 0.83 / React 19
- **Language:** TypeScript 5.9 (strict)
- **Navigation:** Expo Router (file-based routing in `app/`)
- **Database:** expo-sqlite (local SQLite)
- **Notifications:** expo-notifications
- **Testing:** Jest + ts-jest
- **Package manager:** npm

## Project Structure
```
app/                        # Expo Router screens (UI layer)
  _layout.tsx               # Root layout — DatabaseProvider + SafeAreaProvider
  (tabs)/                   # Tab navigator
    _layout.tsx             # Tab config (My Plants, Schedule, Add Plant)
    index.tsx               # Plant list (home)
    schedule.tsx            # Watering schedule sorted by urgency
    add.tsx                 # Add plant form
  plant/[id].tsx            # Plant detail (stack route)

src/
  api/perenual.ts           # Perenual plant API client
  config.ts                 # App config (API key, DB name)
  db/
    schema.ts               # Table DDL + MIGRATIONS array
    queries.ts              # All DB query functions (take SQLiteDatabase as 1st arg)
    provider.tsx            # DatabaseProvider context + useDatabase() hook
  notifications/
    scheduler.ts            # requestPermissions, scheduleWateringNotification, cancelNotification
  types/plant.ts            # All TypeScript interfaces
  ui/                       # Shared UI components
    theme.ts                # Design tokens (colors, spacing, borderRadius, fontSize)
    PlantCard.tsx            # Plant list item component
    EmptyState.tsx           # Empty state component
  utils/
    watering.ts             # Date helpers (getDaysUntilWatering, isOverdue, getWateringStatus)

docs/
  brief.md                  # Product brief — problem, solution, 3 MVP features
  specs.md                  # Full specs — epics, stories, user flows, tech requirements, out of scope
  stories.md                # All user stories with status tracking (Done/Partial/Todo)
  plan.md                   # Implementation plan — step-by-step with file changes
  DESIGN.md                 # Design document with feature spec and roadmap
```

## Commands

A `Makefile` is provided. Run `make help` to see all targets.

```bash
make dev              # Start Expo dev server
make android          # Start on Android device/emulator
make ios              # Start on iOS simulator
make web              # Start on web browser
make test             # Run Jest test suite
make test-watch       # Run tests in watch mode
make test-coverage    # Run tests with coverage
make build-apk        # Build Android APK via EAS (cloud)
make build-apk-local  # Build APK locally (requires Android SDK)
make build-aab        # Build AAB for Play Store
make build-ios        # Build iOS archive
make submit-android   # Submit to Google Play Store
make submit-ios       # Submit to Apple App Store
make install          # Install npm dependencies
make clean            # Clear Expo cache
```

## Architecture Patterns
- **Database access:** All query functions in `src/db/queries.ts` take `SQLiteDatabase` as their first argument. The `DatabaseProvider` in `src/db/provider.tsx` opens the DB and runs migrations at startup, then exposes it via `useDatabase()` hook.
- **Notifications:** The scheduler returns a notification identifier string, stored as `notification_id` in `watering_schedule` table for cancel-and-reschedule on "Water Now".
- **Data freshness:** Screens use `useFocusEffect` to refetch data when navigated to.
- **Photos:** Plant photos picked via expo-image-picker should be copied to expo-file-system document directory for persistence.

## Data Model
Two SQLite tables:
- **plants** — id, name, species, perenual_id, photo_uri, notes, created_at
- **watering_schedule** — id, plant_id (unique FK → plants, cascade delete), interval_days (default 7), last_watered_at, notification_id

## External API
- **Perenual** (perenual.com/api) — Plant search and details. API key set via `EXPO_PUBLIC_PERENUAL_API_KEY` env var.

## Testing
- Tests live in `__tests__/` directories alongside source files
- Pattern: `**/__tests__/**/*.test.[jt]s?(x)`
- Existing tests cover: API client, DB queries, notification scheduler, type conformance
- Mocks: fetch for API tests, SQLiteDatabase for DB tests, expo-notifications for scheduler tests

## Build & Deploy
- **EAS Build** configured in `eas.json` with profiles: `development`, `preview` (APK), `production` (AAB)
- EAS project ID: `c495e6e9-e054-4603-b976-ede271786180`
- Android package: `com.harianelyoth.mulsikmul`
- Requires `eas-cli` installed globally and an Expo account (`make eas-login`)

## Implementation Status

### Completed (v1.0 MVP)
- SQLite database layer (schema, migrations, CRUD queries)
- Perenual plant API client (search, detail, care guide)
- Notification scheduler (permissions, schedule, cancel)
- TypeScript types (LocalPlant, WateringSchedule, PlantWithSchedule, Perenual API types)
- Database provider (React context + useDatabase hook)
- Theme system (nature-themed color palette, spacing, typography tokens)
- Tab navigation (My Plants, Schedule, Add Plant)
- Home screen — plant list with watering status badges
- Add Plant screen — form with photo picker, watering interval, notification scheduling
- Plant Detail screen — view info, Water Now, Delete
- Watering Schedule screen — plants sorted by urgency, quick water button
- Notification tap handling — tapping a notification opens plant detail
- 61 passing tests

### Not Yet Implemented
- Edit plant details inline
- Perenual API search modal (auto-fill plant data from API)
- Plant photo gallery (multiple photos)
- Watering history log
- Dark mode
- Cloud sync

## Project Documentation
Before starting work, consult these docs for context:
- **`docs/brief.md`** — Product brief: problem, solution, MVP scope, what's excluded
- **`docs/specs.md`** — Full specs: 6 epics, 15 stories, user flows, tech requirements, out of scope
- **`docs/stories.md`** — All user stories with acceptance criteria and status (Done/Partial/Todo). Update status here when completing a story.
- **`docs/plan.md`** — Implementation plan: ordered steps, critical files, verification checklist

## Guidelines
- Keep UI components in `src/ui/`, utilities in `src/utils/`
- Use theme tokens from `src/ui/theme.ts` for all colors, spacing, and typography
- All new DB queries go in `src/db/queries.ts` following the existing pattern (async function taking db as first param)
- Types go in `src/types/plant.ts`
- When completing a story, update its status in `docs/stories.md`
