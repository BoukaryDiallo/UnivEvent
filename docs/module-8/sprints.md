# Plan des sprints — Module 8

Les dates officielles du sujet (rapport 2026-04-20, pré-soutenance 2026-04-21) sont passées ; le plan ci-dessous est un rattrapage intensif sur **3 sprints d'une semaine** à partir du **2026-04-24**. Les dates sont indicatives, le contenu des sprints prime.

## Vision du livrable

Une plateforme Inertia/React où un étudiant peut déposer un dossier, en suivre la progression, prendre RDV, être notifié à chaque étape, puis consulter l'archive ; un agent peut instruire, planifier et remettre.

## Vue d'ensemble

| Sprint | Fenêtre | Objectif | Démo attendue |
|---|---|---|---|
| **S0** | terminé (1 au 2 avril) | Data layer (modèles, migrations, enums, factories, middleware stub, page vide). | `migrate:fresh --seed` passe, `/diplomas` accessible. |
| **S1** | 2026-04-24 → 2026-04-30 | Parcours étudiant de bout en bout : dépôt, upload, suivi. | Un étudiant peut créer, téléverser, soumettre, suivre. |
| **S2** | 2026-05-01 → 2026-05-07 | Parcours admin : validation, créneaux, prise de RDV. | Un agent valide/rejette, crée des créneaux, l'étudiant réserve. |
| **S3** | 2026-05-08 → 2026-05-14 | Remise, archivage, notifications, dashboards, docs, tests. | Cycle complet + emails + exports + manuel utilisateur. |

## Sprint 0 — Fondations (FAIT)

**Livré** (commit [5a82579](../../../../commit/5a82579)) :
- Enums `DiplomaRequestStatus`, `DocumentType`.
- Modèles `DiplomaRequest`, `DiplomaDocument`, `DiplomaRequestEvent`, `PickupSlot`, `PickupAppointment`.
- 5 migrations.
- Factories `DiplomaRequest`, `DiplomaDocument`, `PickupSlot`.
- Middleware `EnsureStudent` (stub RBAC).
- Route Inertia `/diplomas` et page index placeholder.

## Sprint 1 — Parcours étudiant (dépôt + suivi)

**Objectifs.** L'étudiant dispose d'un parcours complet : création, dépôt des pièces, soumission, consultation, timeline.

**Stories incluses.**

| ID | Titre | Estim. |
|---|---|---|
| US-01 | Créer un brouillon de demande | S |
| US-02 | Téléverser les pièces justificatives | M |
| US-03 | Soumettre la demande | S |
| US-04 | Consulter ma demande et son statut | M |
| US-05 | Lister mes demandes | S |
| US-24 | Timeline de suivi (vue étudiant) | S |
| US-27 | Policies + stub RBAC documenté | S |
| US-29 | Tests Pest sur transitions `draft → submitted` | S |

**Architecture ajoutée.**
- `DiplomaRequestController`, `DiplomaDocumentController` (Inertia).
- `FormRequest` : `StoreDiplomaRequest`, `UploadDocumentRequest`, `SubmitRequest`.
- Service `DiplomaRequestService` (création, soumission, écriture d'évènements).
- Policies `DiplomaRequestPolicy`, `DiplomaDocumentPolicy`.
- Pages Inertia : `diplomas/create.tsx`, `diplomas/show.tsx`, `diplomas/edit.tsx`.

**Definition of Done.**
- Un étudiant authentifié peut créer, téléverser (≥3 pièces), soumettre.
- Tous les changements d'état écrivent un `DiplomaRequestEvent`.
- `php artisan test --filter=Diploma` au vert.

## Sprint 2 — Parcours admin + rendez-vous

**Objectifs.** L'agent de scolarité instruit les demandes ; les étudiants réservent un créneau.

**Stories incluses.**

| ID | Titre | Estim. |
|---|---|---|
| US-06 | Modifier / supprimer un brouillon | S |
| US-07 | File d'attente admin | M |
| US-08 | Instruire un dossier | S |
| US-09 | Valider une pièce | S |
| US-10 | Valider le dossier complet | S |
| US-11 | Rejeter une demande avec motif | S |
| US-12 | Marquer "Prêt à retirer" | S |
| US-13 | Gérer les créneaux (admin) | M |
| US-14 | Consulter les créneaux disponibles | S |
| US-15 | Réserver un créneau | M |
| US-16 | Annuler/reprogrammer un RDV | S |
| US-17 | Agenda admin des RDV | M |

**Architecture ajoutée.**
- `Admin\DiplomaRequestController`, `Admin\PickupSlotController`.
- Middleware/rôle `scolarite` (stub).
- Service `PickupBookingService` (réservation transactionnelle).
- Pages : `admin/diplomas/index.tsx`, `admin/diplomas/show.tsx`, `admin/pickup-slots/*`, `diplomas/book.tsx`.

**Definition of Done.**
- Un agent peut parcourir la file d'attente, valider/rejeter, créer des créneaux.
- Un étudiant "ready_for_pickup" réserve sans collision (test concurrent).
- Couverture tests ≥ transitions principales.

## Sprint 3 — Remise, archivage, notifications, docs

**Objectifs.** Boucler le cycle, brancher les notifications, produire la documentation et le rapport individuel.

**Stories incluses.**

| ID | Titre | Estim. |
|---|---|---|
| US-18 | Acter la remise du diplôme | M |
| US-19 | Archivage numérique | S |
| US-20 | Export PDF du dossier | M |
| US-21 | Notifications e-mail | M |
| US-22 | Notifications in-app | S |
| US-23 | Rappel J-1 (scheduler) | S |
| US-25 | Dashboard étudiant | S |
| US-26 | Dashboard admin (KPIs) | M |
| US-28 | Seeders de démo | S |
| US-30 | UML + manuel utilisateur | M |

**Definition of Done.**
- Cycle complet démo-able : dépôt → validation → RDV → remise → archivage.
- E-mails envoyés et visibles dans MailHog / log driver.
- Docs UML et manuel utilisateur dans `docs/module-8/`.
- Tests verts, lint ok, build Vite ok.

## Risques & mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Module 1 (users/RBAC) non livré | Pas de rôles réels | Stub local + Policies isolées, document d'intégration. |
| Collisions sur réservation de créneau | Sur-réservation | Transaction + `lockForUpdate` dans `PickupBookingService`. |
| Stockage de pièces (volumétrie) | Espace disque | Limite 5 Mo/pièce, purge des brouillons abandonnés via commande planifiée (stretch). |
| Retard sur les docs | Jury | UML et manuel démarrés en parallèle du S2. |
