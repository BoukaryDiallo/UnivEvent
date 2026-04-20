# TODO: Corriger les fichiers JS pour utiliser les routes Wayfinder

## Étapes complétées
- [x] Exécuter `php artisan wayfinder:generate`
- [x] Analyser la structure des routes générées
- [x] Identifier les fichiers avec URLs hardcodées
- [x] Confirmer le plan avec l'utilisateur
- [x] Créer ce fichier TODO.md

## Étapes à compléter
1. [x] Mettre à jour `resources/js/pages/ufr/UfrList.tsx` - Remplacer hardcodes par `ufr.*`
2. [x] Mettre à jour `resources/js/pages/departement/DepartementList.tsx`
3. [x] Mettre à jour `resources/js/pages/etudiants/EtudiantList.tsx`
4. Mettre à jour `resources/js/pages/filiere/FiliereList.tsx`, `FiliereCreate.tsx`, `FiliereEdit.tsx`
5. Mettre à jour `resources/js/pages/departement/DepartementCreate.tsx`, `DepartementEdit.tsx`
6. [x] Mettre à jour `resources/js/components/app-sidebar.tsx`
7. Vérifier et corriger les autres pages (auth, welcome, etc.)
8. Rebuild JS (`pnpm dev`) et tester les liens/forms
9. Vérifier avec search_files qu'il n'y a plus de hardcodes
10. Marquer comme complété avec attempt_completion

