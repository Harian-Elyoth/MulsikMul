# User Stories — 물식물 MVP

> **15 stories** (12 Must, 3 Should) across 6 epics.
> Delivery: April 6, 2026.

---

## Epic CICD — Pipeline de déploiement (TOP PRIORITÉ)

### CICD-1 : Pipeline CI — tests automatiques sur PR et push
| | |
|---|---|
| **Story** | En tant que développeur, je veux que les tests soient lancés automatiquement à chaque push/PR afin de détecter les régressions avant merge |
| **Critères d'acceptation** | 1. GitHub Actions workflow déclenché sur push (main, develop) et sur PR · 2. Exécute `npm test` et bloque le merge si un test échoue · 3. Temps d'exécution < 3 min |
| **Complexité** | S |
| **Dépendances** | Aucune |
| **Priorité** | **Must** |
| **Status** | Done |

### CICD-2 : Pipeline CD — build APK + release GitHub
| | |
|---|---|
| **Story** | En tant que développeur, je veux qu'un APK soit buildé et attaché à une GitHub Release à chaque tag de version afin de conserver un historique des versions téléchargeables |
| **Critères d'acceptation** | 1. Workflow déclenché sur push d'un tag `v*` (ex: `v1.0.0`) · 2. Build APK via EAS Build (profil preview) · 3. APK uploadé comme artifact de la GitHub Release · 4. Release créée automatiquement avec changelog basé sur les commits · 5. Le numéro de version dans `app.json` est cohérent avec le tag |
| **Complexité** | M |
| **Dépendances** | CICD-1 |
| **Priorité** | **Must** |
| **Status** | Done |

---

## Epic PLANT — Gestion des plantes

### PLANT-1 : Ajouter une plante
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux enregistrer une plante (nom, photo, date d'acquisition) afin de garder un suivi de toutes mes plantes |
| **Critères d'acceptation** | 1. Le formulaire contient : nom (obligatoire), espèce, photo, date d'acquisition (JJ/MM/AAAA), intervalle d'arrosage, notes · 2. La photo est persistée dans le filesystem local · 3. La plante apparaît dans la liste "Mes plantes" immédiatement après sauvegarde · 4. Fonctionne sans connexion internet |
| **Complexité** | M |
| **Dépendances** | Aucune |
| **Priorité** | **Must** |
| **Status** | Done |

### PLANT-2 : Rechercher une plante dans la base locale
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux chercher une plante par nom afin de pré-remplir les infos (espèce, intervalle, tips) automatiquement |
| **Critères d'acceptation** | 1. La modale de recherche filtre les 134 plantes par nom commun ou scientifique · 2. La sélection pré-remplit espèce, intervalle d'arrosage et notes · 3. Les résultats s'affichent en < 200ms |
| **Complexité** | S |
| **Dépendances** | Aucune |
| **Priorité** | **Must** |
| **Status** | Done |

### PLANT-3 : Lister mes plantes
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux voir toutes mes plantes avec leur statut d'arrosage afin de savoir lesquelles ont besoin d'eau |
| **Critères d'acceptation** | 1. Chaque carte affiche : photo (ou placeholder), nom, espèce, badge de statut (en retard / bientôt / ok) · 2. Tap sur une carte ouvre le détail · 3. Un empty state s'affiche si aucune plante |
| **Complexité** | S |
| **Dépendances** | PLANT-1 |
| **Priorité** | **Must** |
| **Status** | Done |

### PLANT-4 : Supprimer une plante
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux supprimer une plante afin de retirer celles que je n'ai plus |
| **Critères d'acceptation** | 1. Confirmation demandée avant suppression · 2. La plante, son schedule et sa notification sont supprimés · 3. Retour à la liste après suppression |
| **Complexité** | S |
| **Dépendances** | PLANT-1 |
| **Priorité** | **Must** |
| **Status** | Done |

---

## Epic CARE — Informations de soin

### CARE-1 : Enrichir la base locale avec données de soin
| | |
|---|---|
| **Story** | En tant que développeur, je veux que chaque plante de la base locale ait ses besoins en lumière et sa toxicité animaux afin de les afficher offline |
| **Critères d'acceptation** | 1. Les 134 entrées de `houseplants.ts` ont les champs `sunlight` et `poisonous_to_pets` · 2. Les données sont factuellement correctes · 3. Les types TypeScript sont mis à jour |
| **Complexité** | M |
| **Dépendances** | Aucune |
| **Priorité** | **Must** |
| **Status** | Done |

### CARE-2 : Persister les infos de soin en base
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que les infos de soin soient sauvegardées localement afin de les consulter offline après l'ajout |
| **Critères d'acceptation** | 1. Table `plant_care_info` créée par migration (sunlight, poisonous_to_pets, care_tips) · 2. Les infos sont insérées automatiquement à l'ajout d'une plante depuis la base locale · 3. La migration ne casse pas les données existantes |
| **Complexité** | M |
| **Dépendances** | CARE-1 |
| **Priorité** | **Must** |
| **Status** | Done |

### CARE-3 : Afficher les infos de soin sur le détail plante
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux voir la lumière nécessaire, la toxicité animaux et les tips de soin afin d'entretenir correctement ma plante |
| **Critères d'acceptation** | 1. Section "Infos de soin" visible sur l'écran détail · 2. Affiche : lumière, toxicité animaux (oui/non), tips · 3. La date d'acquisition est affichée si renseignée · 4. Si aucune info dispo, la section est masquée |
| **Complexité** | M |
| **Dépendances** | CARE-2, PLANT-1 |
| **Priorité** | **Must** |
| **Status** | Done |

---

## Epic WATER — Arrosage & notifications

### WATER-1 : Planning d'arrosage
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux voir mes plantes triées par urgence d'arrosage afin de savoir laquelle arroser en premier |
| **Critères d'acceptation** | 1. Liste triée : en retard > bientôt > ok · 2. Bouton "arroser" met à jour la date et replanifie la notification · 3. Code couleur : rouge (retard), orange (bientôt), vert (ok) |
| **Complexité** | S |
| **Dépendances** | PLANT-1 |
| **Priorité** | **Must** |
| **Status** | Done |

### WATER-2 : Notifications d'arrosage
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux recevoir une notification push quand je dois arroser une plante afin de ne plus oublier |
| **Critères d'acceptation** | 1. Notification planifiée à l'ajout de la plante · 2. Notification replanifiée après chaque arrosage · 3. Tap sur la notification ouvre le détail de la plante |
| **Complexité** | S |
| **Dépendances** | PLANT-1 |
| **Priorité** | **Must** |
| **Status** | Done |

---

## Epic I18N — Internationalisation

### I18N-1 : Système i18n FR/KO
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux utiliser l'app en français ou en coréen afin de comprendre l'interface dans ma langue |
| **Critères d'acceptation** | 1. Toutes les strings UI sont externalisées dans un fichier de traductions · 2. Français et coréen supportés · 3. La langue par défaut est le français |
| **Complexité** | M |
| **Dépendances** | Aucune |
| **Priorité** | **Should** |
| **Status** | Done |

### I18N-2 : Sélecteur de langue
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux changer la langue de l'app afin de passer du français au coréen |
| **Critères d'acceptation** | 1. Toggle accessible depuis l'app (header ou settings) · 2. Le changement s'applique immédiatement à tout l'UI · 3. Le choix persiste entre les sessions |
| **Complexité** | M |
| **Dépendances** | I18N-1 |
| **Priorité** | **Should** |
| **Status** | Done |

---

## Epic BUG — Correctifs

### BUG-1 : Bouton "Arroser" invisible en français (détail plante)
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que le bouton "Arroser" affiche son texte en français afin de pouvoir interagir avec l'interface dans ma langue |
| **Critères d'acceptation** | 1. Le texte "💧 Arroser" s'affiche correctement quand la langue est FR · 2. Le texte "💧 물주기" s'affiche correctement quand la langue est KO · 3. L'état "Arrosage..." s'affiche pendant l'action |
| **Complexité** | XS |
| **Dépendances** | I18N-1 |
| **Priorité** | **Must** |
| **Status** | Todo |

### BUG-2 : Confirmation de suppression — modale in-app au lieu de l'alerte native
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que la confirmation de suppression s'affiche dans une modale cohérente avec l'app afin d'avoir une expérience uniforme |
| **Critères d'acceptation** | 1. La modale in-app remplace le dialogue natif Android · 2. Overlay semi-transparent, carte centrée avec titre + message incluant le nom de la plante · 3. Boutons "Annuler" et "Supprimer" stylés avec les tokens du thème (`colors.danger`) · 4. La suppression effective et le retour arrière fonctionnent comme avant |
| **Complexité** | S |
| **Dépendances** | PLANT-4 |
| **Priorité** | **Must** |
| **Status** | Todo |

### BUG-3 : Section Notes duplique les Conseils de soin — la supprimer
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que l'écran détail n'affiche pas deux fois les mêmes informations afin que l'interface reste claire |
| **Critères d'acceptation** | 1. La section "Notes" est supprimée de l'écran détail plante · 2. Les conseils de soin restent visibles dans la section "Infos de soin" · 3. Aucune régression sur les autres informations affichées |
| **Complexité** | XS |
| **Dépendances** | CARE-3 |
| **Priorité** | **Must** |
| **Status** | Todo |

### BUG-4 : Conseils de soin toujours en anglais — traduire FR/KO
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que les conseils de soin s'affichent dans ma langue afin de comprendre les recommandations sans effort |
| **Critères d'acceptation** | 1. Les conseils s'affichent en français quand la langue est FR · 2. Les conseils s'affichent en coréen quand la langue est KO · 3. Les 134 entrées de la base locale ont leurs traductions FR et KO · 4. Le changement de langue met à jour l'affichage immédiatement |
| **Complexité** | M |
| **Dépendances** | I18N-1, CARE-3 |
| **Priorité** | **Must** |
| **Status** | Todo |

---

## Epic UI — Refonte visuelle

### UI-1 : Polish visuel et composants réutilisables
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux une interface cohérente et soignée afin que l'app inspire confiance et soit agréable à utiliser |
| **Critères d'acceptation** | 1. Toutes les margins hardcodées (2px) remplacées par le spacing system (4/8px) · 2. Composant Badge unifié utilisé sur tous les écrans (statut arrosage) · 3. Composant Input avec états focus/error/disabled · 4. Boutons avec variantes (primary, secondary, danger) et états pressed/disabled · 5. Icônes tab bar et écrans remplacées par @expo/vector-icons (Ionicons) au lieu d'emoji |
| **Complexité** | M |
| **Dépendances** | Aucune |
| **Priorité** | **Must** |
| **Status** | Todo |

### UI-2 : Animations et transitions
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux des micro-interactions et transitions fluides afin que l'app soit réactive et vivante |
| **Critères d'acceptation** | 1. Feedback tactile sur les boutons (scale down on press) · 2. Transition fluide à l'ouverture du détail plante · 3. Animation du badge de statut quand il change (ex: arrosage → vert) · 4. Animation de la modale de recherche (slide up) |
| **Complexité** | M |
| **Dépendances** | UI-1 |
| **Priorité** | **Should** |
| **Status** | Todo |

---

## Summary

| Status | Count | Stories |
|--------|-------|---------|
| **Done** | 13 | CICD-1, CICD-2, PLANT-1, PLANT-2, PLANT-3, PLANT-4, WATER-1, WATER-2, CARE-1, CARE-2, CARE-3, I18N-1, I18N-2 |
| **Todo** | 2 | UI-1, UI-2 |
