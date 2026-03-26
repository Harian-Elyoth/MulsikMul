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

### Screen Details

#### My Plants (Home)
- FlatList of all registered plants
- Each card shows: thumbnail, name, species, watering status badge (OK / due soon / overdue)
- Tap a card → Plant Detail screen
- Empty state with prompt to add first plant

#### Add Plant
- Form: name (required), species, photo, watering interval (days), notes
- Optional: search Perenual API to auto-fill species and photo
- On submit: saves to DB, schedules notification, navigates to plant list

#### Plant Detail
- Full plant info display with photo
- Watering status: last watered, next due, interval
- "Water Now" button: resets timer and reschedules notification
- "Delete" button with confirmation

#### Schedule
- All plants sorted by urgency (overdue first, then soonest-due)
- Quick "Water Now" button per plant
- Color-coded urgency indicators

---

## Data Model

### SQLite Tables

**plants**
| Column      | Type    | Notes                    |
|-------------|---------|--------------------------|
| id          | INTEGER | Primary key, auto-increment |
| name        | TEXT    | Required                 |
| species     | TEXT    | Nullable                 |
| perenual_id | INTEGER | Nullable, links to API   |
| photo_uri   | TEXT    | Nullable, local file URI |
| notes       | TEXT    | Nullable                 |
| created_at  | INTEGER | Unix timestamp ms        |

**watering_schedule**
| Column          | Type    | Notes                           |
|-----------------|---------|----------------------------------|
| id              | INTEGER | Primary key, auto-increment      |
| plant_id        | INTEGER | Unique, FK → plants, cascade delete |
| interval_days   | INTEGER | Default 7                        |
| last_watered_at | INTEGER | Nullable, Unix timestamp ms      |
| notification_id | TEXT    | Nullable, expo notification ID   |

### TypeScript Types

- `LocalPlant` — mirrors plants table
- `WateringSchedule` — mirrors watering_schedule table
- `PlantWithSchedule` — JOIN result for schedule view
- `PlantSummary` / `PlantDetail` / `CareGuide` — Perenual API response types

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
| Plant Data API | Perenual (perenual.com/api)   |
| Testing        | Jest + ts-jest + @testing-library/react-native |

---

## Architecture

```
app/                    ← Expo Router pages (UI layer)
  _layout.tsx           ← Root: providers (DB, SafeArea)
  (tabs)/               ← Tab navigator
    _layout.tsx         ← Tab config
    index.tsx           ← My Plants
    schedule.tsx        ← Watering Schedule
    add.tsx             ← Add Plant
  plant/[id].tsx        ← Plant Detail (stack)

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
    theme.ts            ← Design tokens
    PlantCard.tsx       ← List item component
    EmptyState.tsx      ← Empty state component
  utils/
    watering.ts         ← Date calculation helpers
  config.ts             ← App configuration
```

**Key pattern:** All database query functions accept `SQLiteDatabase` as the first argument. A React context (`DatabaseProvider`) opens the database at app startup and exposes it via `useDatabase()`.

---

## Roadmap

### v1.0 — MVP (current)
- [x] Database schema and queries
- [x] Perenual API client
- [x] Notification scheduler
- [x] TypeScript types
- [ ] Full UI implementation
- [ ] Plant CRUD flow
- [ ] Watering schedule view

### v1.1 — Enhancements
- [ ] Edit plant details inline
- [ ] Plant photo gallery (multiple photos)
- [ ] Watering history log
- [ ] Dark mode support

### v2.0 — Future
- [ ] Cloud sync (Supabase or similar)
- [ ] Additional care tracking (fertilizing, repotting)
- [ ] Plant health tips based on species
- [ ] Widgets for quick watering status
