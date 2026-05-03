# Journal d'avancement — Module 8

Mis à jour à chaque session de travail. Le sprint courant et son état restent en tête.

## Sprint courant : **S3 — Remise, archivage, notifications, docs** (en cours)

### État du sprint (phase 1 livrée)

| ID | Titre | Statut | Commit |
|---|---|---|---|
| US-18 | Acter la remise (avec reçu signé en option) | **Fait** | 6ee2e61 |
| US-19 | Archivage numérique (manuel admin) | **Fait** | 6ee2e61 |
| US-20 | Export PDF du dossier | **Fait** | (à committer) |
| US-21 | Notifications e-mail à chaque transition | **Fait** | 5591772 |
| US-28 | Seeder de démo (1 user par statut + 3 créneaux + pièces) | **Fait** | (à committer) |
| US-22 | Notifications in-app (cloche header + dropdown) | **Fait** | (à committer) |
| US-23 | Rappel J-1 avant RDV (scheduler) | **Fait** | (à committer) |
| US-25 | Dashboard étudiant | **Fait** | (à committer) |
| US-26 | Dashboard admin (KPIs) | **Fait** | fb0739b |
| US-28 | Seeders de démo | À faire | — |
| US-30 | Documentation UML + manuel utilisateur | **Fait** | (à committer) |
| US-17 | Agenda admin des RDV | **Fait** | (à committer) |

## Sprint précédent : **S2 — Parcours admin + RDV** (clôturé)

### État des stories du sprint (phases A + B + C partielle)

| ID | Titre | Statut | Commit |
|---|---|---|---|
| — | Socle admin (middleware `scolarite`, config stub, intégration Inertia) | **Fait** | 3043c14 |
| US-07 | File d'attente admin (queue + filtre par statut) | **Fait** | 3043c14 |
| US-08 | Instruire un dossier (vue détaillée admin) | **Fait** | 3043c14 |
| US-09 | Valider une pièce | **Fait** | f5ca078 |
| US-10 | Valider le dossier complet | **Fait** | f5ca078 |
| US-11 | Rejeter une demande avec motif | **Fait** | f5ca078 |
| US-12 | Marquer "Prêt à retirer" | **Fait** | f5ca078 |
| US-13 | Gérer les créneaux (admin CRUD) | **Fait** (anti-chevauchement par lieu) | (à committer) |
| US-14 | Consulter les créneaux disponibles (étudiant) | **Fait** | (à committer) |
| US-15 | Réserver un créneau | **Fait** (lockForUpdate anti-sur-réservation) | (à committer) |
| US-16 | Annuler un RDV (fenêtre : tant qu'il est futur) | **Fait** | (à committer) |
| US-17 | Agenda admin des RDV | À faire (reporté) | — |

## Sprint précédent : **S1 — Parcours étudiant** (clôturé)

### État des stories du sprint

| ID | Titre | Statut | Commit |
|---|---|---|---|
| US-01 | Créer un brouillon de demande | **Fait** | (à committer) |
| US-02 | Téléverser les pièces justificatives | **Fait** | (à committer) |
| US-03 | Soumettre la demande | **Fait** (minimum 1 pièce pour l'instant) | (à committer) |
| US-04 | Consulter ma demande et son statut | **Fait** | (à committer) |
| US-05 | Lister mes demandes | **Fait** | (à committer) |
| US-06 | Modifier / supprimer un brouillon (suppression de pièces) | Partiel (suppression de pièces ok ; suppression du brouillon complet à faire en S2) | (à committer) |
| US-24 | Timeline de suivi (vue étudiant) | **Fait** | (à committer) |
| US-27 | Policies + stub RBAC documenté | **Fait** | (à committer) |
| US-29 | Tests Pest | En cours (27 tests verts US-01/02/03) | (à committer) |

Statuts possibles : `À faire` · `En cours` · `En revue` · `Fait` · `Bloqué`.

## Prochaines actions concrètes

S3 livré. Backlog résiduel :

1. Trancher la règle de soumission : min 1 pièce (MVP actuel) vs exigence CNI + relevé + attestation.
2. Si Module 1 (RBAC) est mergé : remplacer le stub `User::isScolarite()` par un vrai check de rôle, retirer la config `scolarite_emails`, retirer l'alias `appointments()` HasMany sur `DiplomaRequest` si on revoie le routing.
3. Préparer la démo : dérouler `php artisan migrate:fresh --seed` et tester chaque transition manuellement.

## Historique

### 2026-04-28 — S3 phase 7 (export PDF, rappel J-1, agenda admin, docs UML + manuel)
- **US-20 export PDF** : `barryvdh/laravel-dompdf` installé. `DiplomaRequestService::exportPdf()` rend une vue Blade `resources/views/diplomas/export.blade.php` (étudiant, statut, pièces, RDV, historique). Endpoint `diplomas.export` (gardé par policy `view`). Bouton "Exporter PDF" sur `pages/diplomas/show.tsx`. 3 tests (`ExportPdfTest`).
- **US-23 rappel J-1** : nouvelle notification `PickupReminder` (mail + database, `afterCommit`). Commande `diplomas:send-pickup-reminders` qui sélectionne les RDV de demain non remis et notifie. Schedulée `dailyAt('08:00')` dans `routes/console.php`. 4 tests (`PickupReminderTest`).
- **US-17 agenda admin** : `Admin\PickupAgendaController` groupe les créneaux à venir par jour avec leurs RDV (étudiants attendus, état remis). Page `pages/admin/pickup-slots/agenda.tsx`. Lien "Voir l'agenda" depuis la liste des créneaux. 4 tests (`PickupAgendaTest`).
- **US-30 docs** : 4 diagrammes Mermaid sous `docs/module-8/uml/` (cas d'utilisation, machine à états, séquence dépôt→remise, classes + couches) + manuel utilisateur complet (`manuel-utilisateur.md`). README mis à jour avec liens vers les nouveaux documents.
- **Suite** : 148 tests / 560 assertions au vert.

### 2026-04-27 — S3 phase 6 (notifications in-app)
- **Migration** `notifications` table générée par `php artisan notifications:table` puis migrée.
- **Notification** `DiplomaRequestStatusChanged::via()` ajoute `database` ; `toArray()` enrichi avec `title` + `status_label` pour l'UI.
- **Controller** `NotificationController` : `read(DatabaseNotification)` (vérifie ownership + redirige vers la fiche) et `readAll()` (marque tout lu).
- **Routes** `notifications.read` + `notifications.read-all` (auth/verified).
- **HandleInertiaRequests** partage `notifications.{unread_count, recent[10]}` à toutes les pages — pas besoin d'endpoint séparé pour la cloche.
- **Component** `notification-bell.tsx` : icône cloche + badge rouge (count), dropdown listant les 10 dernières non lues, titres + tracking_code + temps relatif, bouton "Tout marquer lu", clic → POST read + redirection vers la fiche.
- **Header** `app-sidebar-header.tsx` rend la cloche à droite.
- **Tests** — 5 nouveaux (`InAppNotificationsTest`) : persistence DB après transition, payload Inertia exposant `unread_count`, mark-read redirige vers la fiche, isolation cross-user (404 si pas owner), read-all décrémente à 0.
- **Suite** : 137 tests / 515 assertions au vert.

### 2026-04-24 — S3 phase 5 (dashboard étudiant)
- **Service** `DiplomaStudentDashboardService::snapshot(User)` retourne `active_request` (latest non-archived, rejected dépriorisé) + `upcoming_appointment` (futur, non délivré) + `archived_count` + `recent_events` (5 derniers évènements toutes demandes confondues du student).
- **Controller** `DashboardController` thin remplace l'ancienne route `inertia('dashboard')`. Service + Inertia render.
- **Page** `pages/dashboard.tsx` réécrite : carte "Ma demande en cours" (bouton "Ouvrir le dossier" / "Nouvelle demande" si vide, motif de rejet visible, footer historique archivé), carte "Prochain rendez-vous" (date/lieu), carte "Activité récente".
- **Tests** — 7 nouveaux (`StudentDashboardTest`) : pas de demande pour nouveau user, isolation des données entre users, sélection latest non-archived, dépriorisation du rejected, RDV futur exposé, RDV passé/délivré écarté, événements limités à 5 et triés.
- **Suite** : 132 tests / 489 assertions au vert.

### 2026-04-24 — S3 phase 4 (dashboard admin KPIs)
- **Service** `DiplomaAdminDashboardService::snapshot()` : retourne un tableau cohérent avec :
  - `counts[]` — répartition par statut (les 8 statuts de l'enum, 0 inclus).
  - `active_queue` — total Submitted + DocumentsValidated + ReadyForPickup + AppointmentScheduled.
  - `submitted_this_month` — compteur du mois courant.
  - `avg_instruction_days` — moyenne en jours entre `submitted_at` et l'évènement de validation du dossier.
  - `avg_delivery_days` — moyenne entre `submitted_at` et l'évènement de remise.
  - `upcoming_slots` — `capacity`/`reserved`/`utilization` (%) sur les créneaux futurs.
  - `recent_events` — 10 derniers évènements (avec actor + owner + tracking_code).
- **Controller** `Admin\DashboardController@index` thin : appel service + Inertia.
- **Route** `admin.dashboard`.
- **Page** `admin/dashboard.tsx` : 4 cartes KPI, répartition par statut (badges), barre d'occupation des créneaux, timeline activité récente.
- Lien sidebar "Tableau de bord scolarité" en première position du bloc admin.
- **Tests** — 6 nouveaux (`AdminDashboardTest`) : ACL guest/student, comptes par statut + active queue, calcul délai moyen d'instruction, utilisation des créneaux, ordre chronologique des évènements.
- **Suite** : 125 tests / 405 assertions au vert.

### 2026-04-24 — S3 phase 3 (seeder de démonstration)
- `database/seeders/DiplomaModuleSeeder.php` : 8 étudiants, un par statut (Draft → Archived + Rejected), 3 créneaux futurs (Salle 201 matin/après-midi + Salle 304), pièces avec fichiers placeholder PDF dans le storage privé, RDV liés pour AppointmentScheduled/Delivered/Archived.
- Évènements créés via `DiplomaRequestEvent::withoutEvents()` : aucune notification déclenchée pendant le seed (pas de pollution mailer).
- Branchement dans `DatabaseSeeder` : `php artisan migrate:fresh --seed` produit immédiatement un état démo riche.
- **Démo** — 10 users (Test User + Test Admin + 8 étudiants), 8 requests réparties sur tous les statuts, 21 documents avec fichiers consultables, 31 évènements timeline, 3 RDV.
- **Suite** : 119 tests / 354 assertions toujours au vert (le seeder n'introduit pas de régression).

### 2026-04-24 — S3 phase 2 (notifications e-mail à chaque transition)
- **Notification** unique `DiplomaRequestStatusChanged` (queued, `afterCommit()` pour ne tirer qu'après commit de la transaction métier). Sujet + corps construits par `match` sur le statut cible, en français. `toArray()` pour US-22 (in-app, à venir).
- **Observer** `DiplomaRequestEventObserver` enregistré via `#[ObservedBy]` sur `DiplomaRequestEvent`. Filtre les transitions notifiables : Submitted, DocumentsValidated, AppointmentScheduled, Delivered, Rejected, et ReadyForPickup uniquement quand venant de DocumentsValidated (pas après annulation de RDV). Draft et Archived → silencieux.
- **Architecture** — découplage propre : le service écrit l'évènement, l'observer dispatch ; aucun changement dans les services/contrôleurs.
- **Tests** — 9 nouveaux (`NotificationsTest`) avec `Notification::fake()` : draft → silencieux, submit → notif, valider dossier → notif, mark ready → notif, rejet → notif (statut Rejected), booking → notif, annulation RDV → silencieux, remise → notif, archivage → silencieux.
- **Suite** : 119 tests / 354 assertions au vert.

### 2026-04-24 — S3 phase 1 (remise + archivage)
- **Service** — `PickupService::deliver(DiplomaRequest, User, ?UploadedFile $receipt)` : transition `AppointmentScheduled → Delivered`, stocke `delivered_at`/`delivered_by`/`receipt_path` sur l'appointment, écrit l'évènement. Reçu optionnel sur disque privé. `DiplomaRequestService::archive` : transition `Delivered → Archived`, set `archived_at`.
- **Policies** — `DiplomaRequestPolicy::deliver` (scolarite + AppointmentScheduled), `DiplomaRequestPolicy::archive` (scolarite + Delivered).
- **FormRequest** — `DeliverDiplomaRequest` : reçu optionnel pdf/jpg/png ≤ 5 Mo.
- **Controller** — `Admin\DiplomaRequestController::{deliver,archive}` thin.
- **Routes** — `admin.diplomas.{deliver,archive}`.
- **Presenter** — `appointment()` expose `delivered_at` + `delivered_by_name` ; `adminAbilities` expose `deliver` + `archive`.
- **UI admin** (`admin/diplomas/show.tsx`) — carte "Rendez-vous" enrichie (mention de remise), boutons "Acter la remise" (ouvre Dialog avec upload reçu optionnel) + "Archiver" (avec confirm).
- **Tests** — 9 nouveaux (`DeliverArchiveTest`) : remise avec/sans reçu, refus MIME, refus si statut non scheduled, refus étudiant, archivage OK, refus archivage avant remise, refus étudiant, cycle complet trace les évènements.
- **Suite** : 110 tests / 345 assertions au vert.

### 2026-04-24 — S2 phase C (créneaux + réservation + annulation)
- **Service** — nouveau `PickupService` (injecte `DiplomaRequestService` pour l'audit trail) :
  - `createSlot` / `updateSlot` / `deleteSlot` avec contrainte anti-chevauchement par lieu (requête SQL) + refus suppression si RDV existants + refus capacité < RDV déjà réservés.
  - `bookSlot` avec `lockForUpdate` sur `PickupSlot` dans une transaction : recontrôle capacité et état request pour résister à la concurrence. Refuse créneau passé. Transition `ReadyForPickup → AppointmentScheduled`.
  - `cancelAppointment` : supprime le RDV, rebascule `AppointmentScheduled → ReadyForPickup`.
- **Policies** — `PickupSlotPolicy` (viewAny/manage/update/delete), `PickupAppointmentPolicy::cancel` (owner + RDV futur), `DiplomaRequestPolicy::book` (owner + status ReadyForPickup).
- **FormRequests** — `StorePickupSlotRequest` (futur, ends > starts, capacité 1-200), `UpdatePickupSlotRequest`.
- **Controllers** — `Admin\PickupSlotController` (resource complet index/create/store/edit/update/destroy) + `PickupAppointmentController` (store/destroy) ; tout délègue au service.
- **Routes** — `admin.pickup-slots.{index,create,store,edit,update,destroy}`, `diplomas.appointment.{store,destroy}` (scopeBindings sur destroy).
- **Model** — `DiplomaRequest::appointments()` HasMany ajouté pour que scopeBindings puisse scoper le RDV au parent (le `appointment()` HasOne reste la relation métier).
- **Presenter** — `slot()`, `appointment()` + `detail()` expose `appointment` quand présent ; `abilities()` expose `book` ; `cancel_appointment` via `can_cancel` sur l'appointment.
- **UI étudiant** (`diplomas/show.tsx`) — carte "Rendez-vous de retrait" (si RDV), carte "Créneaux disponibles" (si `can.book`) avec bouton Réserver, bouton Annuler.
- **UI admin** — nouvelles pages `admin/pickup-slots/{index,create,edit}` + composant partagé `slot-form.tsx`. Lien sidebar "Créneaux de retrait" (si scolarite).
- **Tests** — 16 nouveaux : 8 `PickupSlotTest` (ACL, création, futur, anti-chevauchement, autorisation même lieu différent, update, delete vide) + 8 `PickupAppointmentTest` (réservation, créneau plein, mauvais statut, non-owner, créneau passé, annulation, non-owner cancel, 404 cross-parent).
- **Suite** : 101 tests / 322 assertions au vert.

### 2026-04-24 — S2 phase B (actions admin : valider / rejeter / prêt à retirer)
- **Service** — `validateDocument` (set `validated_at`/`validated_by`, no-op idempotent), `validateDossier` (Submitted + toutes pièces validées → DocumentsValidated, ValidationException sinon), `reject` (Submitted|DocumentsValidated → Rejected avec motif), `markReadyForPickup` (DocumentsValidated → ReadyForPickup).
- **Policies** — `DiplomaDocumentPolicy::validate` (scolarite + Submitted + non validée), `DiplomaRequestPolicy::{validateDossier,reject,markReadyForPickup}`.
- **FormRequest** — `RejectDiplomaRequest` : motif 3-500 caractères.
- **Controllers** — `Admin\DiplomaRequestController::{validateDossier,reject,markReadyForPickup}`, nouveau `Admin\DiplomaDocumentController::validateDocument`.
- **Routes** — `admin.diplomas.{validate,reject,mark-ready,documents.validate}` (scopeBindings sur la nested).
- **Presenter** — `adminDetail`, `adminAbilities`, `adminDocument` (expose `can_validate` + `validated_by_name`).
- **UI** — `admin/diplomas/show.tsx` : bouton "Valider" par pièce (si admissible), bouton "Valider le dossier" (désactivé tant qu'une pièce n'est pas validée), bouton "Marquer prêt à retirer" (si applicable), modale Dialog pour le rejet (textarea motif).
- **Tests** — 11 nouveaux (`AdminDiplomaActionsTest`) : validation pièce OK, idempotence, 403 non-scolarite, validation dossier OK après validation des pièces, erreur si pièces non validées, rejet avec motif, motif requis, 403 si trop tard, mark-ready depuis DocumentsValidated, 403 depuis mauvais état, étudiant refusé sur toutes les transitions.
- **Suite** : 85 tests / 285 assertions au vert.

### 2026-04-24 — S2 phase A (socle admin + queue + instruction)
Stub RBAC côté Module 8, en attendant la livraison du Module 1 :
- `config/diplomas.php` avec `scolarite_emails` (liste d'e-mails admin, override via `.env DIPLOMAS_SCOLARITE_EMAILS`).
- `User::isScolarite()` (méthode stub : vérifie l'e-mail contre la config). Le contrat reste stable quand Module 1 branchera un vrai RBAC : il suffira de changer l'implémentation de `isScolarite()`.
- Middleware `EnsureScolarite` + alias `scolarite` dans `bootstrap/app.php`.
- Fix du seeder : Test Admin → `admin@example.com` (évite la collision unique avec Test User, suppression du champ `role` inutilisé).
- `HandleInertiaRequests` expose `auth.isScolarite` aux pages.

US-07 / US-08 :
- `DiplomaRequestPolicy::instruct` (scolarite + status ≠ Draft).
- `Admin\DiplomaRequestController` : `index` (queue filtrable par statut, exclut les brouillons) + `show` (autorise via policy).
- Routes `admin.diplomas.{index,show}` sous `auth + verified + scolarite`.
- Pages Inertia `admin/diplomas/index.tsx` (table + filtre) et `admin/diplomas/show.tsx` (détail instruction lecture seule).
- Lien sidebar conditionnel (`auth.isScolarite`).
- **Tests** — 7 nouveaux (`AdminDiplomaQueueTest`) : guest → login, student → 403, scolarite voit les non-brouillons, filtre par statut, accès show ok pour soumise, 403 pour brouillon, 403 pour student.
- **Suite** : 74 tests / 256 assertions au vert.

### 2026-04-24 — Refactor couches + US-03 (soumission)
Refactor layering (rappel user "bien découpler la logique métier dans les services") :
- **Route `scopeBindings()`** sur `documents.download` et `documents.destroy` : intégrité parent-enfant enforced par le framework ; suppression des `abort_if($doc->diploma_request_id !== ...)` dans le contrôleur.
- **Présenter Inertia** : `App\Presenters\DiplomaRequestPresenter` (`row()`, `detail()`, `abilities()`, + mappers privés document/event). `DiplomaRequestController` passe de ~80 lignes de mapping inline à des appels statiques du presenter.
- **Download** : `DiplomaRequestService::streamDocument()` — `Storage::disk('local')->download()` sort du contrôleur.

Implémentation US-03 :
- **Service** `DiplomaRequestService::submit(DiplomaRequest, User)` :
  - Garde état `Draft` (sinon `DomainException`).
  - Garde `SUBMISSION_MINIMUM_DOCUMENTS = 1` (constante) → `ValidationException::withMessages(['documents' => ...])` si non respecté.
  - Transition atomique (DB transaction), écrit un `DiplomaRequestEvent`.
- **FormRequest** `SubmitDiplomaRequest` : `authorize()` via policy `submit`.
- **Controller** `DiplomaRequestController::submit` — thin, juste l'appel service + redirect.
- **Route** `POST /diplomas/{id}/submit` nommée `diplomas.submit`.
- **UI** : bouton "Soumettre la demande" dans `show.tsx` (si `can.submit`), confirmation JS.
- **Presenter** : `abilities()` expose `submit` aux props Inertia.
- **Tests** — 6 nouveaux (`SubmitDiplomaRequestTest`) : soumission OK, évènement enregistré, refus sans pièce, refus si déjà soumis, non-owner refusé, guest redirigé.
- **Suite** : 67 tests / 214 assertions au vert.

### 2026-04-24 — Implémentation US-02 (upload de pièces)
- **Backend** :
  - `DiplomaRequestService::attachDocument(request, UploadedFile, type)` et `removeDocument(document)`.
  - `DiplomaRequestPolicy::addDocument` (owner + draft), `DiplomaDocumentPolicy` (delete + download).
  - `UploadDocumentRequest` : type enum, file pdf/jpg/png ≤ 5 Mo ; `authorize()` via policy `addDocument`.
  - `DiplomaDocumentController` : `store` / `destroy` (protection cross-parent) / `download`.
  - Routes : `diplomas.documents.{store,download,destroy}`.
  - `show()` du contrôleur passe `can.addDocument`, `documentTypes`, `size` et `can_delete` par pièce.
- **Frontend** (`pages/diplomas/show.tsx`) :
  - Section "Déposer une pièce" (visible si `can.addDocument`), bouton téléchargement, bouton supprimer (si `can_delete`), affichage de la taille.
  - `useForm` Inertia avec `forceFormData` pour l'upload, `router.delete` pour la suppression.
- **Tests** — 11 nouveaux (`DiplomaDocumentTest`) : upload OK, refus taille, refus MIME, refus type inconnu, accès refusé post-soumission, non-owner refusé, suppression OK puis interdite après soumission, download owner/non-owner, document d'une autre demande → 404.
- **Suite complète** : 61 tests / 198 assertions au vert.

### 2026-04-24 — Code review & correctifs US-01
Corrections issues d'une revue indépendante :
- **Validation** `academic_year` durcie : passage de regex permissive (`^\d{4}-\d{4}$`, acceptait `2099-1000`) à `Rule::in(AcademicYear::values())`. Source de vérité unique : `app/Support/AcademicYear.php`.
- `DiplomaRequestController@index` appelle désormais `authorize('viewAny')` (cohérence avec `create`/`show`).
- `DiplomaRequestController@show` scrub `rejected_reason` hors état `Rejected` (évite fuite d'info vers le front).
- `pages/diplomas/index.tsx` : breadcrumb passé en Wayfinder (`diplomasIndex().url`).
- Nouveau test `test_store_rejects_out_of_range_academic_year`.
- **Suite** : 50 tests / 173 assertions au vert.

### 2026-04-24 — Implémentation US-01 / US-04 / US-05 / US-24 / US-27
- Ajouts **backend** :
  - `app/Services/DiplomaRequestService.php` (createDraft + recordEvent, tracking `DIP-YYYY-XXXXXXXX` avec retry sur collision).
  - `app/Policies/DiplomaRequestPolicy.php` (viewAny, view, create, update, delete, submit).
  - `app/Http/Requests/Diplomas/StoreDiplomaRequest.php` (validation `diploma_type` + `academic_year`).
  - `app/Http/Controllers/DiplomaRequestController.php` (index, create, store, show).
  - `app/Http/Controllers/Controller.php` : trait `AuthorizesRequests` ajouté (permet `$this->authorize()` dans tous les contrôleurs du projet).
  - `routes/diplomas.php` : routes nommées `diplomas.{index,create,store,show}` sous `auth + verified + student`.
- Ajouts **frontend** :
  - `resources/js/pages/diplomas/create.tsx` (formulaire shadcn + Inertia `useForm`).
  - `resources/js/pages/diplomas/show.tsx` (détail, liste des pièces, historique).
  - `resources/js/pages/diplomas/status-badge.tsx` (composant partagé).
  - `resources/js/pages/diplomas/index.tsx` : liste en cartes avec badge de statut.
  - `resources/js/components/app-sidebar.tsx` : lien nav via route Wayfinder.
- **Tests** (9 verts) — `tests/Feature/Diplomas/CreateDiplomaRequestTest.php` :
  - redirection guest, accès index & create, création brouillon, évènement d'historique, validations (diploma_type, academic_year), accès owner/tiers.
  - `tests/TestCase.php` : `withoutVite()` en setUp pour que les tests Inertia n'aient pas besoin du manifest Vite.
- **Suite complète** : 49 tests / 170 assertions au vert.

### 2026-04-24 — Planification S1
- Lecture du sujet (PDF) et consolidation du périmètre Module 8.
- Création des docs de suivi : `backlog.md`, `sprints.md`, `progress.md`.
- Backlog de 30 stories réparties en 7 epics.
- Plan à 3 sprints (S1 dépôt, S2 validation+RDV, S3 remise+archivage+docs).

### 2026-04-01 — Sprint 0 terminé (commit 5a82579)
- Data layer scaffolded : 2 enums, 5 modèles, 5 migrations, 3 factories.
- Middleware `EnsureStudent` (stub RBAC).
- Route et page index `/diplomas` vides.

## Dette & sujets à trancher

- [ ] Modèle `User` : confirmer si le starter kit expose `role` ou si la colonne reste à ajouter côté Module 1.
- [ ] Choix PDF : `barryvdh/laravel-dompdf` vs `spatie/browsershot` — arbitrer au S3 avant US-20.
- [ ] Driver de mail en dev : MailHog ou `log` ; à valider.
- [ ] Stratégie i18n : tout en FR en dur, ou préparer `lang/fr/diplomas.php` ?
- [ ] Test suite : migrer en syntaxe Pest (`pest()`) ou rester en PHPUnit classique comme les tests livrés (`DashboardTest`). Choix fait pour l'instant : PHPUnit classique.
- [ ] Règle de soumission : actuellement ≥ 1 pièce. À trancher — exiger typage (CNI + relevé + attestation) ou garder un seuil quantitatif.
