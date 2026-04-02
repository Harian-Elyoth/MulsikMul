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
| **Status** | Done |

### BUG-2 : Confirmation de suppression — modale in-app au lieu de l'alerte native
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que la confirmation de suppression s'affiche dans une modale cohérente avec l'app afin d'avoir une expérience uniforme |
| **Critères d'acceptation** | 1. La modale in-app remplace le dialogue natif Android · 2. Overlay semi-transparent, carte centrée avec titre + message incluant le nom de la plante · 3. Boutons "Annuler" et "Supprimer" stylés avec les tokens du thème (`colors.danger`) · 4. La suppression effective et le retour arrière fonctionnent comme avant |
| **Complexité** | S |
| **Dépendances** | PLANT-4 |
| **Priorité** | **Must** |
| **Status** | Done |

### BUG-3 : Section Notes duplique les Conseils de soin — la supprimer
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que l'écran détail n'affiche pas deux fois les mêmes informations afin que l'interface reste claire |
| **Critères d'acceptation** | 1. La section "Notes" est supprimée de l'écran détail plante · 2. Les conseils de soin restent visibles dans la section "Infos de soin" · 3. Aucune régression sur les autres informations affichées |
| **Complexité** | XS |
| **Dépendances** | CARE-3 |
| **Priorité** | **Must** |
| **Status** | Done |

### BUG-4 : Conseils de soin toujours en anglais — traduire FR/KO
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que les conseils de soin s'affichent dans ma langue afin de comprendre les recommandations sans effort |
| **Critères d'acceptation** | 1. Les conseils s'affichent en français quand la langue est FR · 2. Les conseils s'affichent en coréen quand la langue est KO · 3. Les 134 entrées de la base locale ont leurs traductions FR et KO · 4. Le changement de langue met à jour l'affichage immédiatement |
| **Complexité** | M |
| **Dépendances** | I18N-1, CARE-3 |
| **Priorité** | **Must** |
| **Status** | Done |

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
| **Status** | Done |

### UI-2 : Animations et transitions
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux des micro-interactions et transitions fluides afin que l'app soit réactive et vivante |
| **Critères d'acceptation** | 1. Feedback tactile sur les boutons (scale down on press) · 2. Transition fluide à l'ouverture du détail plante · 3. Animation du badge de statut quand il change (ex: arrosage → vert) · 4. Animation de la modale de recherche (slide up) |
| **Complexité** | M |
| **Dépendances** | UI-1 |
| **Priorité** | **Should** |
| **Status** | Done |

---

## Epic BUG-UI — UI & UX fixes

### BUG-UI-1 : Toggle langue invisible (même couleur que le fond)
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux voir clairement le bouton de changement de langue afin de pouvoir l'utiliser facilement |
| **Critères d'acceptation** | 1. Le toggle a un contraste suffisant avec le fond · 2. Respect des guidelines d’accessibilité (WCAG AA) · 3. Visible en mode clair et sombre |
| **Complexité** | XS |
| **Dépendances** | I18N-2 |
| **Priorité** | **Must** |
| **Status** | Todo |

### BUG-UI-2 : Bouton "Modifier" non cliquable (détail plante)
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux pouvoir cliquer sur le bouton modifier afin d'éditer une plante |
| **Critères d'acceptation** | 1. Le bouton est cliquable (z-index / overlay corrigé) · 2. La navigation vers l'écran d’édition fonctionne · 3. Aucun conflit avec d'autres composants |
| **Complexité** | S |
| **Dépendances** | PLANT-1 |
| **Priorité** | **Must** |
| **Status** | Todo |

### BUG-UI-3 : Texte "Arroser" invisible en français
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux voir le texte du bouton "Arroser" en français afin de comprendre l'action |
| **Critères d'acceptation** | 1. Le texte "💧 Arroser" est visible · 2. Contraste corrigé (couleur texte vs background) · 3. Aucun impact sur la version coréenne |
| **Complexité** | XS |
| **Dépendances** | BUG-1 |
| **Priorité** | **Must** |
| **Status** | Todo |

### BUG-UI-4 : Layout cassé en français (Add Plant)
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que l'UI ne déborde pas de l'écran en français afin d’avoir une expérience correcte |
| **Critères d'acceptation** | 1. Aucun texte ne sort de l’écran · 2. Responsive corrigé (flex / wrap / scroll) · 3. Testé sur différents devices |
| **Complexité** | M |
| **Dépendances** | I18N-1 |
| **Priorité** | **Must** |
| **Status** | Todo |

---

## Epic UX — Expérience utilisateur

### UX-1 : Remplacer la bottom navbar par navigation swipe
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux naviguer entre les pages avec un swipe afin d’avoir une expérience plus fluide |
| **Critères d'acceptation** | 1. Swipe horizontal entre les écrans principaux · 2. Suppression de la bottom navbar · 3. Animation fluide et performante |
| **Complexité** | L |
| **Dépendances** | UI-2 |
| **Priorité** | **Should** |
| **Status** | Todo |

### UX-2 : Reset du formulaire lors de l’ajout d’une plante
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que le formulaire soit vide quand j’ajoute une nouvelle plante afin d’éviter les erreurs |
| **Critères d'acceptation** | 1. Aucun champ pré-rempli depuis une plante précédente · 2. Reset après validation · 3. Reset lors de l’ouverture de l’écran |
| **Complexité** | S |
| **Dépendances** | PLANT-1 |
| **Priorité** | **Must** |
| **Status** | Todo |

### UX-3 : Date par défaut = aujourd’hui
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux que la date d’acquisition soit automatiquement aujourd’hui afin de gagner du temps |
| **Critères d'acceptation** | 1. Champ date pré-rempli avec la date du jour · 2. Format respecté (JJ/MM/AAAA) · 3. Modifiable manuellement |
| **Complexité** | XS |
| **Dépendances** | PLANT-1 |
| **Priorité** | **Must** |
| **Status** | Todo |

### UX-4 : Remplacer "safe pour animaux" par "toxique pour animaux"
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux voir si une plante est toxique pour les animaux afin d’éviter toute confusion |
| **Critères d'acceptation** | 1. Nouveau champ toxicForPets utilisé · 2. Texte affiché : "Toxique pour animaux : Oui/Non" · 3. Ancienne logique supprimée |
| **Complexité** | M |
| **Dépendances** | CARE-1 |
| **Priorité** | **Must** |
| **Status** | Todo |

### UX-5 : Support des surnoms de plantes
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux donner un surnom à ma plante afin de la personnaliser |
| **Critères d'acceptation** | 1. Champ "nickname" ajouté · 2. Le surnom est affiché dans la liste et détail · 3. Les infos de soin restent liées à l’espèce |
| **Complexité** | M |
| **Dépendances** | PLANT-1, CARE-2 |
| **Priorité** | **Must** |
| **Status** | Todo |

### UX-6 : Conserver les infos de soin même si le nom change
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux garder les conseils de soin même si je change le nom afin de ne pas perdre les infos utiles |
| **Critères d'acceptation** | 1. Les care tips sont liés à l’espèce et non au nom · 2. Modifier le nom n’efface rien · 3. Fonctionne avec nickname |
| **Complexité** | M |
| **Dépendances** | UX-5 |
| **Priorité** | **Must** |
| **Status** | Todo |

### UX-7 : Simplification du header (suppression menu top)
| | |
|---|---|
| **Story** | En tant qu'utilisateur, je veux une interface minimaliste afin de me concentrer sur mes plantes |
| **Critères d'acceptation** | 1. Suppression du menu top (Mes plantes / Calendrier / Ajouter / Toggle) · 2. Ajout d’un bouton toggle langue rond en haut · 3. Position fixe et accessible |
| **Complexité** | M |
| **Dépendances** | UI-1 |
| **Priorité** | **Should** |
| **Status** | Todo |

---

## Summary

| Status | Count | Stories |
|--------|-------|---------|
| **Done** | 17 | CICD-1, CICD-2, PLANT-1, PLANT-2, PLANT-3, PLANT-4, WATER-1, WATER-2, CARE-1, CARE-2, CARE-3, I18N-1, I18N-2, BUG-1, BUG-2, BUG-3, BUG-4 |
| **Todo** | 13 | UI-1, UI-2, BUG-UI-1, BUG-UI-2, BUG-UI-3, BUG-UI-4, UX-1, UX-2, UX-3, UX-4, UX-5, UX-6, UX-7 |
