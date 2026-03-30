# Specs — 물식물 (Mulsikmul)

## 1. Overview

**Les plantes d'intérieur meurent par oubli d'arrosage, et les apps existantes sont payantes ou envahies de pubs.** 물식물 est une app mobile locale-first qui permet de suivre ses plantes (photo, nom, date d'acquisition), consulter leurs besoins (lumière, toxicité animaux, tips) et recevoir des notifications d'arrosage — le tout offline, gratuit, sans compte. **Différenciation : zéro cloud, zéro pub, zéro friction.**

### Objectifs business mesurables

| # | Objectif | Métrique | Délai |
|---|----------|----------|-------|
| 1 | App fonctionnelle installable | APK buildable via EAS + testable sur device | 6 avril 2026 |
| 2 | Couverture MVP complète | 3 features brief = 100% critères d'acceptation passés | 6 avril 2026 |
| 3 | Fiabilité | 0 crash sur les 3 user flows principaux, tests > 60 | 6 avril 2026 |

---

## 2. Features MVP

### Epic PLANT — Gestion des plantes

| Champ | Détail |
|-------|--------|
| **PLANT-1 : Ajouter une plante** | |
| Story | En tant qu'utilisateur, je veux enregistrer une plante (nom, photo, date d'acquisition) afin de garder un suivi de toutes mes plantes |
| Critères d'acceptation | 1. Le formulaire contient : nom (obligatoire), espèce, photo, date d'acquisition (JJ/MM/AAAA), intervalle d'arrosage, notes · 2. La photo est persistée dans le filesystem local · 3. La plante apparaît dans la liste "Mes plantes" immédiatement après sauvegarde · 4. Fonctionne sans connexion internet |
| Complexité | M |
| Dépendances | Aucune |
| Priorité | **Must** |

| Champ | Détail |
|-------|--------|
| **PLANT-2 : Rechercher une plante dans la base locale** | |
| Story | En tant qu'utilisateur, je veux chercher une plante par nom afin de pré-remplir les infos (espèce, intervalle, tips) automatiquement |
| Critères d'acceptation | 1. La modale de recherche filtre les 134 plantes par nom commun ou scientifique · 2. La sélection pré-remplit espèce, intervalle d'arrosage et notes · 3. Les résultats s'affichent en < 200ms |
| Complexité | S |
| Dépendances | Aucune |
| Priorité | **Must** |

| Champ | Détail |
|-------|--------|
| **PLANT-3 : Lister mes plantes** | |
| Story | En tant qu'utilisateur, je veux voir toutes mes plantes avec leur statut d'arrosage afin de savoir lesquelles ont besoin d'eau |
| Critères d'acceptation | 1. Chaque carte affiche : photo (ou placeholder), nom, espèce, badge de statut (en retard / bientôt / ok) · 2. Tap sur une carte ouvre le détail · 3. Un empty state s'affiche si aucune plante |
| Complexité | S |
| Dépendances | PLANT-1 |
| Priorité | **Must** |

| Champ | Détail |
|-------|--------|
| **PLANT-4 : Supprimer une plante** | |
| Story | En tant qu'utilisateur, je veux supprimer une plante afin de retirer celles que je n'ai plus |
| Critères d'acceptation | 1. Confirmation demandée avant suppression · 2. La plante, son schedule et sa notification sont supprimés · 3. Retour à la liste après suppression |
| Complexité | S |
| Dépendances | PLANT-1 |
| Priorité | **Must** |

---

### Epic CARE — Informations de soin

| Champ | Détail |
|-------|--------|
| **CARE-1 : Enrichir la base locale avec données de soin** | |
| Story | En tant que développeur, je veux que chaque plante de la base locale ait ses besoins en lumière et sa toxicité animaux afin de les afficher offline |
| Critères d'acceptation | 1. Les 134 entrées de `houseplants.ts` ont les champs `sunlight` et `poisonous_to_pets` · 2. Les données sont factuellement correctes · 3. Les types TypeScript sont mis à jour |
| Complexité | M |
| Dépendances | Aucune |
| Priorité | **Must** |

| Champ | Détail |
|-------|--------|
| **CARE-2 : Persister les infos de soin en base** | |
| Story | En tant qu'utilisateur, je veux que les infos de soin soient sauvegardées localement afin de les consulter offline après l'ajout |
| Critères d'acceptation | 1. Table `plant_care_info` créée par migration (sunlight, poisonous_to_pets, care_tips) · 2. Les infos sont insérées automatiquement à l'ajout d'une plante depuis la base locale · 3. La migration ne casse pas les données existantes |
| Complexité | M |
| Dépendances | CARE-1 |
| Priorité | **Must** |

| Champ | Détail |
|-------|--------|
| **CARE-3 : Afficher les infos de soin sur le détail plante** | |
| Story | En tant qu'utilisateur, je veux voir la lumière nécessaire, la toxicité animaux et les tips de soin afin d'entretenir correctement ma plante |
| Critères d'acceptation | 1. Section "Infos de soin" visible sur l'écran détail · 2. Affiche : lumière, toxicité animaux (oui/non), tips · 3. La date d'acquisition est affichée si renseignée · 4. Si aucune info dispo, la section est masquée |
| Complexité | M |
| Dépendances | CARE-2, PLANT-1 |
| Priorité | **Must** |

---

### Epic WATER — Arrosage & notifications

| Champ | Détail |
|-------|--------|
| **WATER-1 : Planning d'arrosage** | |
| Story | En tant qu'utilisateur, je veux voir mes plantes triées par urgence d'arrosage afin de savoir laquelle arroser en premier |
| Critères d'acceptation | 1. Liste triée : en retard > bientôt > ok · 2. Bouton "arroser" met à jour la date et replanifie la notification · 3. Code couleur : rouge (retard), orange (bientôt), vert (ok) |
| Complexité | S |
| Dépendances | PLANT-1 |
| Priorité | **Must** |

| Champ | Détail |
|-------|--------|
| **WATER-2 : Notifications d'arrosage** | |
| Story | En tant qu'utilisateur, je veux recevoir une notification push quand je dois arroser une plante afin de ne plus oublier |
| Critères d'acceptation | 1. Notification planifiée à l'ajout de la plante · 2. Notification replanifiée après chaque arrosage · 3. Tap sur la notification ouvre le détail de la plante |
| Complexité | S |
| Dépendances | PLANT-1 |
| Priorité | **Must** |

---

### Epic I18N — Internationalisation

| Champ | Détail |
|-------|--------|
| **I18N-1 : Système i18n FR/KO** | |
| Story | En tant qu'utilisateur, je veux utiliser l'app en français ou en coréen afin de comprendre l'interface dans ma langue |
| Critères d'acceptation | 1. Toutes les strings UI sont externalisées dans un fichier de traductions · 2. Français et coréen supportés · 3. La langue par défaut est le français |
| Complexité | M |
| Dépendances | Aucune |
| Priorité | **Should** |

| Champ | Détail |
|-------|--------|
| **I18N-2 : Sélecteur de langue** | |
| Story | En tant qu'utilisateur, je veux changer la langue de l'app afin de passer du français au coréen |
| Critères d'acceptation | 1. Toggle accessible depuis l'app (header ou settings) · 2. Le changement s'applique immédiatement à tout l'UI · 3. Le choix persiste entre les sessions |
| Complexité | M |
| Dépendances | I18N-1 |
| Priorité | **Should** |

---

**Total : 11 stories** (9 Must, 2 Should)

---

## 3. User Flows

### Flow 1 — Ajouter une plante
Onglet "Ajouter" -> (optionnel) Rechercher dans la base -> Pré-remplissage auto -> Ajouter photo -> Saisir date d'acquisition -> Sauvegarder -> Retour liste avec nouvelle plante visible + notification planifiée

### Flow 2 — Consulter et arroser
Onglet "Planning" -> Voir plantes triées par urgence -> Tap "💧" sur plante en retard -> Date mise à jour + notification replanifiée -> Badge passe au vert

### Flow 3 — Consulter les infos de soin
Onglet "Mes plantes" -> Tap sur une plante -> Écran détail : photo, nom, espèce, date d'acquisition, statut arrosage, lumière, toxicité animaux, tips -> Bouton "Arroser" ou "Supprimer"

---

## 4. Technical Requirements

### Stack
| Composant | Technologie |
|-----------|-------------|
| Framework | Expo SDK 55 / React Native 0.83 / React 19 |
| Langage | TypeScript 5.9 (strict) |
| Navigation | Expo Router (file-based) |
| Base de données | expo-sqlite (SQLite local) |
| Notifications | expo-notifications |
| Tests | Jest + ts-jest |
| Build | EAS Build (preview APK, production AAB) |
| Package manager | npm |

### Contraintes
- **Offline-first** : toute fonctionnalité doit marcher sans internet
- **Pas de nouveau runtime dependency** pour le date picker (input texte JJ/MM/AAAA)
- **Migrations SQLite** : incrémentales, idempotentes (try-catch pour ALTER TABLE)
- **Performance** : recherche plante < 200ms, navigation entre écrans < 100ms
- **Données locales** : photos persistées dans `expo-file-system` document directory

### Schéma DB cible
```
plants          (id, name, species, perenual_id, photo_uri, notes, created_at, acquired_at)
watering_schedule (id, plant_id, interval_days, last_watered_at, notification_id)
plant_care_info   (id, plant_id, sunlight, poisonous_to_pets, care_tips)   ← NOUVEAU
```

---

## 5. Out of Scope

| Feature exclue | Raison | Quand |
|----------------|--------|-------|
| Édition inline d'une plante | Pas critique au Day 1, on peut supprimer et recréer | v1.1 |
| Recherche Perenual API (online) | Complexité réseau + gestion erreurs, la base locale suffit | v1.1 |
| Galerie multi-photos | Une photo suffit pour identifier la plante | v2 |
| Historique d'arrosage | Le "dernier arrosage" suffit pour le MVP | v1.1 |
| Dark mode | Cosmétique, pas fonctionnel | v1.1 |
| Cloud sync | Contradictoire avec le positionnement local-first | v2 |
| Aspect payant / monétisation | Usage personnel uniquement | v2 |
| Fonctionnalités sociales | Pas de besoin utilisateur identifié | Jamais (sauf pivot) |
| Toxicité pour humains | Cas d'usage marginal — focus sur les animaux | v1.1 |
