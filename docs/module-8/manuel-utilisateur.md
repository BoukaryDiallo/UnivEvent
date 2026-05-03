# Manuel utilisateur — Module 8 : Retraits de diplômes

Ce manuel s'adresse aux deux profils du module : **étudiant diplômé** et **agent de scolarité**. La plateforme est accessible via un navigateur récent (Chrome / Firefox / Edge).

## 1. Accès et authentification

1. Aller sur `https://<host>/login`.
2. Se connecter avec son adresse e-mail universitaire.
3. La page d'accueil affiche le **tableau de bord** propre au rôle.

> En l'absence du module 1 (gestion des utilisateurs), un agent est reconnu via l'allowlist de la configuration `config/diplomas.php` (`scolarite_emails`).

## 2. Côté étudiant

### 2.1 Tableau de bord

Page `/dashboard`. Affiche :

- **Ma demande en cours** : statut + bouton _Ouvrir le dossier_, ou _Nouvelle demande_ si aucune.
- **Prochain rendez-vous** : date et lieu, le cas échéant.
- **Activité récente** : les 5 derniers évènements de vos demandes.
- Cloche dans l'en-tête : nombre de notifications non lues, dropdown des 10 dernières.

### 2.2 Déposer un dossier

1. Cliquer sur **Nouvelle demande** depuis le tableau de bord ou la liste `/diplomas`.
2. Choisir le **type de diplôme** (Licence, Master, Doctorat) et l'**année académique**.
3. Valider — un brouillon est créé, identifié par un code `DIP-AAAA-XXXXXXXX`.

### 2.3 Téléverser des pièces

Sur la fiche du brouillon :

1. Section **Déposer une pièce**.
2. Sélectionner un type (CNI, relevé, attestation, photo, reçu, autre).
3. Joindre un fichier (PDF / JPG / PNG, 5 Mo max).
4. Téléverser. La pièce apparaît dans la liste, supprimable tant que le brouillon n'est pas soumis.

### 2.4 Soumettre la demande

1. Bouton **Soumettre la demande** sur la fiche.
2. Le système refuse la soumission si aucune pièce n'a été déposée.
3. Confirmation à l'écran + e-mail + notification in-app.

### 2.5 Suivre l'instruction

L'historique listé sur la fiche montre les transitions et les notes des agents. Un rejet expose le motif. Vous recevez un e-mail à chaque transition notable :

- Pièces validées
- Demande rejetée (avec motif)
- Diplôme prêt à retirer
- Rendez-vous confirmé
- Diplôme remis

### 2.6 Réserver un créneau de retrait

Quand votre dossier est **Prêt à retirer** :

1. La fiche affiche **Créneaux de retrait disponibles**.
2. Cliquer **Réserver** sur un créneau.
3. Confirmation à l'écran + e-mail.
4. Un rappel automatique est envoyé la veille à 08:00.

### 2.7 Annuler ou reprogrammer

Tant que le créneau est futur, un bouton **Annuler le rendez-vous** est disponible. Après annulation, le dossier repasse à _Prêt à retirer_ et un autre créneau peut être réservé.

### 2.8 Exporter le dossier en PDF

Bouton **Exporter PDF** sur la fiche : génère un récapitulatif (étudiant, statut, pièces, RDV, historique).

## 3. Côté agent de scolarité

### 3.1 Tableau de bord scolarité

Page `/admin/dashboard`. KPIs :

- Dossiers actifs (Submitted → AppointmentScheduled).
- Soumissions du mois.
- Délai moyen d'instruction (soumission → validation des pièces).
- Délai moyen de remise (soumission → diplôme remis).
- Répartition par statut.
- Taux d'occupation des créneaux à venir.
- Activité récente (10 derniers évènements).

### 3.2 File d'attente

Page `/admin/diplomas`. Tableau filtrable par statut. Les brouillons (privés à l'étudiant) sont exclus.

### 3.3 Instruire un dossier

Cliquer une ligne de la file → fiche détaillée :

- **Valider** chaque pièce individuellement.
- **Valider le dossier** — bouton actif uniquement quand toutes les pièces sont validées.
- **Rejeter** — ouvre une modale, motif obligatoire (3 à 500 caractères).
- **Marquer prêt à retirer** — disponible après validation du dossier.

### 3.4 Acter la remise et archiver

Quand un étudiant est sur place :

1. **Acter la remise** — modale avec dépôt optionnel d'un reçu signé (PDF/JPG/PNG, 5 Mo).
2. Le RDV passe en _Remis_, l'étudiant reçoit la confirmation.
3. **Archiver** quand le dossier est terminé — le statut passe à _Archivé_, les pièces restent consultables en lecture seule.

### 3.5 Gérer les créneaux

Page `/admin/pickup-slots` :

- **Nouveau créneau** : lieu, plage horaire, capacité (1 à 200).
- Pas de chevauchement temporel par lieu (vérifié serveur).
- Modification : la capacité ne peut pas descendre sous le nombre de RDV déjà réservés.
- Suppression : bloquée si des RDV sont rattachés.
- **Voir l'agenda** : page `/admin/pickup-slots/agenda`, créneaux groupés par jour avec liste des étudiants attendus.

## 4. Notifications

### 4.1 E-mail

Envoyés automatiquement aux étudiants à chaque transition notable + rappel J-1 du RDV. En développement, le driver `log` empile les e-mails dans `storage/logs/laravel.log`.

### 4.2 In-app

Cloche en haut à droite de chaque page. Compteur rouge si non-lues. Cliquer une entrée marque comme lue et redirige vers la fiche concernée.

## 5. Tâches planifiées

Le scheduler Laravel doit tourner pour exécuter les rappels J-1 :

```bash
php artisan schedule:work
```

ou via cron en production :

```cron
* * * * * cd /chemin/vers/UnivEvent && php artisan schedule:run >> /dev/null 2>&1
```

## 6. Données de démonstration

```bash
php artisan migrate:fresh --seed
```

Génère 1 étudiant par statut + 3 créneaux + un agent `admin@example.com` (rôle stub via `config/diplomas.php`).
