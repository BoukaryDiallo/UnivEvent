# Module 8 — Gestion des retraits de diplômes

Projet Intégrateur L3 Génie Logiciel — IFOAD, Université Joseph KI-ZERBO.
Étudiant : Boukary DIALLO.

## Périmètre fonctionnel (extrait du sujet)

> Dépôt de dossiers, suivi des étapes de validation, prise de rendez-vous pour le retrait, notifications et archivage numérique.

## Stack

Laravel 13 + Inertia.js + React 19 + TypeScript + Tailwind v4 (starter kit React/Fortify). MySQL/PostgreSQL. Tests Pest.

## Organisation des docs

- [backlog.md](backlog.md) — product backlog : epics + user stories avec critères d'acceptation.
- [sprints.md](sprints.md) — découpage en sprints et portée de chaque sprint.
- [progress.md](progress.md) — journal d'avancement, mis à jour à chaque session.
- [manuel-utilisateur.md](manuel-utilisateur.md) — manuel utilisateur (étudiant + scolarité).
- [uml/use-cases.md](uml/use-cases.md) — cas d'utilisation.
- [uml/state-machine.md](uml/state-machine.md) — machine à états des demandes.
- [uml/sequence-deposit-to-pickup.md](uml/sequence-deposit-to-pickup.md) — diagramme de séquence du dépôt à la remise.
- [uml/class-diagram.md](uml/class-diagram.md) — diagramme de classes + couches applicatives.

## Acteurs

| Acteur | Rôle dans le module |
|---|---|
| **Étudiant** | Dépose son dossier, suit sa demande, prend RDV, récupère son diplôme. |
| **Agent de scolarité** (admin) | Instruit les dossiers, valide/rejette les pièces, gère les créneaux, remet le diplôme. |
| **Responsable scolarité** (superviseur) | Supervise, accède aux archives et tableaux de bord. |

## Dépendance au Module 1 (RBAC)

Le Module 1 (Gestion des utilisateurs) porte l'authentification JWT et les rôles. En attendant sa livraison, le Module 8 :

- utilise l'auth du starter kit (session + Fortify) ;
- stubbe le rôle via un middleware `student` local ([app/Http/Middleware/EnsureStudent.php](../../app/Http/Middleware/EnsureStudent.php)) ;
- isole la logique RBAC derrière des Policies pour bascule rapide quand Module 1 sera intégré.
