# Product Backlog — Module 8

Légende priorité : **P0** indispensable (MVP) · **P1** important · **P2** confort · **P3** optionnel.

Les IDs (`US-XX`) sont stables et référencés depuis [sprints.md](sprints.md) et [progress.md](progress.md).

## Epic A — Dépôt du dossier (étudiant)

### US-01 — Créer un brouillon de demande · P0
**En tant qu'**étudiant diplômé, **je veux** initier une demande de retrait **afin de** commencer le dépôt de mon dossier.
- Formulaire : type de diplôme, année académique.
- Statut initial = `draft`, `tracking_code` généré (ex. `DIP-2026-000123`).
- Un brouillon par couple (owner, diplôme, année) tant qu'il n'est pas soumis.

### US-02 — Téléverser les pièces justificatives · P0
**En tant qu'**étudiant, **je veux** joindre mes pièces (CNI, relevé, attestation, photo, reçu) **afin de** compléter mon dossier.
- Types attendus : enum `DocumentType`.
- Upload sur `storage/app/private/diplomas/{request_id}/...`, taille max 5 Mo, MIME pdf/jpg/png.
- Suppression possible tant que le dossier est en `draft`.

### US-03 — Soumettre la demande · P0
**En tant qu'**étudiant, **je veux** soumettre mon dossier complet **afin que** l'administration l'instruise.
- Pré-requis : toutes les pièces requises présentes.
- Transition `draft → submitted`, `submitted_at` renseigné, évènement `DiplomaRequestEvent` écrit.

### US-04 — Consulter ma demande et son statut · P0
- Écran détail : statut courant (label FR), timeline des évènements, pièces, RDV éventuel.

### US-05 — Lister mes demandes · P1
- Écran index étudiant : liste paginée avec badge de statut et `tracking_code`.

### US-06 — Modifier / supprimer un brouillon · P1
- Autorisé uniquement si `status = draft`.

## Epic B — Validation administrative

### US-07 — File d'attente admin · P0
- Liste des demandes par statut, filtre par année/type, tri par date de soumission.

### US-08 — Instruire un dossier · P0
- Vue détaillée pour l'agent, aperçu des pièces.

### US-09 — Valider une pièce · P0
- Marque `validated_at`, `validated_by`.

### US-10 — Valider le dossier complet · P0
- Toutes les pièces validées → transition `submitted → documents_validated`.

### US-11 — Rejeter une demande · P0
- Motif obligatoire, transition vers `rejected`, notification à l'étudiant.

### US-12 — Marquer "Prêt à retirer" · P0
- Transition `documents_validated → ready_for_pickup`, autorise la prise de RDV.

## Epic C — Rendez-vous de retrait

### US-13 — Gérer les créneaux de retrait (admin) · P0
- CRUD `PickupSlot` (date, plage horaire, capacité, lieu).
- Capacité minimale 1 ; pas de chevauchement par lieu.

### US-14 — Consulter les créneaux disponibles (étudiant) · P0
- Visible uniquement si `status = ready_for_pickup`.
- Affiche capacité restante (`PickupSlot::remainingCapacity`).

### US-15 — Réserver un créneau · P0
- Crée un `PickupAppointment`, transition `ready_for_pickup → appointment_scheduled`.
- Refus si créneau plein (verrou pessimiste ou contrôle transactionnel).

### US-16 — Annuler / reprogrammer un RDV · P1
- Fenêtre configurable (ex. 24 h avant). Libère la place.

### US-17 — Agenda admin des RDV · P1
- Vue journalière/hebdomadaire par lieu.

## Epic D — Remise et archivage

### US-18 — Acter la remise du diplôme · P0
- Admin : `delivered_at`, `delivered_by`, upload du reçu signé (`receipt_path`).
- Transition `appointment_scheduled → delivered`.

### US-19 — Archivage numérique · P0
- Transition `delivered → archived` (`archived_at`) après X jours (configurable).
- Les pièces restent consultables mais en lecture seule.

### US-20 — Export PDF du dossier · P2
- Fiche récapitulative téléchargeable (DomPDF ou laravel-dompdf).

## Epic E — Notifications

### US-21 — Notification par e-mail à chaque transition · P0
- Mailables : `DossierSoumis`, `DossierValide`, `DossierRejete`, `PretARetirer`, `RdvConfirme`, `RappelRdv`, `DiplomeRemis`.

### US-22 — Notifications in-app · P1
- Table `notifications` de Laravel, menu cloche dans la sidebar.

### US-23 — Rappel J-1 avant le RDV · P2
- Job planifié (Scheduler) envoyant le rappel.

## Epic F — Tableau de bord & suivi

### US-24 — Timeline de suivi · P0
- Affichage chronologique des `DiplomaRequestEvent` (qui, quoi, quand, note).

### US-25 — Dashboard étudiant · P1
- Widget "Ma demande en cours" + prochain RDV.

### US-26 — Dashboard admin · P1
- KPIs : demandes par statut, délai moyen d'instruction, créneaux utilisés.

## Epic G — Transverse (socle / qualité / livraison)

### US-27 — Stub RBAC en attendant Module 1 · P0
- Middleware `student` + Policies (`DiplomaRequestPolicy`, `PickupSlotPolicy`).
- Point d'intégration documenté pour Module 1.

### US-28 — Seeders de démonstration · P1
- Rôles (student, scolarite, responsable), ~10 demandes réparties sur tous les statuts, créneaux à venir.

### US-29 — Tests Pest · P0
- Feature tests sur chaque transition d'état + droits d'accès.
- Unit tests sur la machine à états.

### US-30 — Documentation UML + manuel utilisateur · P0
- Cas d'utilisation, séquence (dépôt → remise), classes, MCD/MLD, manuel PDF.

## Non-fonctionnel

- **Sécurité** : uploads hors `public/`, scan MIME, taille max, CSRF, Policies partout.
- **Auditabilité** : toute transition écrit un `DiplomaRequestEvent`.
- **i18n** : libellés FR côté UI (labels enum déjà FR).
- **Accessibilité** : composants shadcn du starter kit, focus visible, aria-labels.
