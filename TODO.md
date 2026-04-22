# Fix Dashboard Blank Screen (Ziggy Routes Issue after routes split)

## Steps:
- [ ] 1. Vérifier Ziggy installé: `composer show tightenco/ziggy`
- [ ] 2. Editer `resources/views/app.blade.php`: Ajouter `@routes` avant `@inertia`
- [ ] 3. Régénérer routes: `php artisan ziggy:generate`
- [ ] 4. Rebuild frontend: `npm run dev`
- [ ] 5. Test `/dashboard` + F12 console

**Progress: Step 1 starting...**

