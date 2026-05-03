# Diagramme de cas d'utilisation — Module 8

## Acteurs

- **Étudiant** — diplômé qui dépose et suit sa demande de retrait.
- **Agent de scolarité** (scolarité) — instruit les dossiers, gère les créneaux, remet les diplômes.

## Diagramme

```mermaid
flowchart LR
    Etudiant((Étudiant))
    Scolarite((Agent de scolarité))
    Systeme((Système))

    Etudiant --> UC1[Créer un brouillon]
    Etudiant --> UC2[Téléverser des pièces]
    Etudiant --> UC3[Soumettre la demande]
    Etudiant --> UC4[Consulter ma demande]
    Etudiant --> UC5[Réserver un créneau]
    Etudiant --> UC6[Annuler un RDV]
    Etudiant --> UC7[Exporter le dossier en PDF]

    Scolarite --> UC10[Consulter la file d'attente]
    Scolarite --> UC11[Valider une pièce]
    Scolarite --> UC12[Valider le dossier]
    Scolarite --> UC13[Rejeter une demande]
    Scolarite --> UC14[Marquer prêt à retirer]
    Scolarite --> UC15[Acter la remise]
    Scolarite --> UC16[Archiver le dossier]
    Scolarite --> UC17[Gérer les créneaux]
    Scolarite --> UC18[Consulter l'agenda]
    Scolarite --> UC19[Tableau de bord KPIs]

    Systeme --> UC20[Notifier par e-mail]
    Systeme --> UC21[Notifier en application]
    Systeme --> UC22[Envoyer rappel J-1]
```

## Description synthétique

| ID | Cas | Acteur principal | Précondition | Postcondition |
|---|---|---|---|---|
| UC1 | Créer un brouillon | Étudiant | Authentifié | `DiplomaRequest` en statut `draft` |
| UC2 | Téléverser pièce | Étudiant | Brouillon ouvert | Document persisté + lié à la demande |
| UC3 | Soumettre la demande | Étudiant | Brouillon avec ≥ 1 pièce | Statut → `submitted`, e-mail envoyé |
| UC11 | Valider pièce | Scolarité | Demande `submitted` | Document marqué validé |
| UC12 | Valider le dossier | Scolarité | Toutes pièces validées | Statut → `documents_validated` |
| UC13 | Rejeter | Scolarité | Statut `submitted` ou `documents_validated` | Statut → `rejected` + motif enregistré |
| UC14 | Marquer prêt | Scolarité | Statut `documents_validated` | Statut → `ready_for_pickup` |
| UC5 | Réserver créneau | Étudiant | Statut `ready_for_pickup`, créneau futur non plein | RDV créé, statut → `appointment_scheduled` |
| UC15 | Acter la remise | Scolarité | RDV programmé | Statut → `delivered`, reçu signé optionnel stocké |
| UC16 | Archiver | Scolarité | Statut `delivered` | Statut → `archived` |
| UC22 | Rappel J-1 | Système (cron) | Existence d'un RDV demain non remis | Notification e-mail + in-app envoyée |
