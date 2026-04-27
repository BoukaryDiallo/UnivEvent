# Diagramme de classes — Module 8

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +bool isScolarite()
    }

    class DiplomaRequest {
        +int id
        +int owner_id
        +string tracking_code
        +string diploma_type
        +string academic_year
        +DiplomaRequestStatus status
        +datetime submitted_at
        +string rejected_reason
        +datetime archived_at
        +documents()
        +events()
        +appointment()
    }

    class DiplomaDocument {
        +int id
        +int diploma_request_id
        +DocumentType type
        +string path
        +string original_name
        +string mime
        +int size
        +datetime validated_at
        +int validated_by
    }

    class DiplomaRequestEvent {
        +int id
        +int diploma_request_id
        +DiplomaRequestStatus from_status
        +DiplomaRequestStatus to_status
        +int actor_id
        +string note
        +datetime occurred_at
    }

    class PickupSlot {
        +int id
        +datetime starts_at
        +datetime ends_at
        +int capacity
        +string location
        +int created_by
        +remainingCapacity()
    }

    class PickupAppointment {
        +int id
        +int diploma_request_id
        +int pickup_slot_id
        +datetime confirmed_at
        +datetime delivered_at
        +int delivered_by
        +string receipt_path
    }

    class DiplomaRequestStatus {
        <<enumeration>>
        Draft
        Submitted
        DocumentsValidated
        ReadyForPickup
        AppointmentScheduled
        Delivered
        Archived
        Rejected
    }

    class DocumentType {
        <<enumeration>>
        NationalId
        TranscriptOfRecords
        SuccessAttestation
        IdentityPhoto
        PaymentReceipt
        Other
    }

    User "1" --> "0..*" DiplomaRequest : owner
    DiplomaRequest "1" --> "0..*" DiplomaDocument : documents
    DiplomaRequest "1" --> "0..*" DiplomaRequestEvent : events
    DiplomaRequest "1" --> "0..1" PickupAppointment : appointment
    PickupSlot "1" --> "0..*" PickupAppointment : appointments
    DiplomaRequest --> DiplomaRequestStatus : status
    DiplomaDocument --> DocumentType : type
    User "1" --> "0..*" PickupSlot : creator
    User "1" --> "0..*" DiplomaRequestEvent : actor
```

## Couches applicatives

```mermaid
flowchart TB
    Routes[/routes/diplomas.php/]
    Mw[Middleware\nstudent / scolarite]
    FR[FormRequests\nauthorize via Policy]
    Ctrl[Controllers (thin)]
    Pol[Policies]
    Pre[Presenters]
    Svc[Services\nDiplomaRequestService\nPickupService\nDashboardService]
    Mod[(Models Eloquent)]
    Obs[Observer\nDiplomaRequestEventObserver]
    Notif[Notifications\nDiplomaRequestStatusChanged\nPickupReminder]

    Routes --> Mw --> FR --> Ctrl
    Ctrl --> Pol
    Ctrl --> Svc
    Ctrl --> Pre
    Svc --> Mod
    Mod -.created event.-> Obs
    Obs --> Notif
```

Les contrôleurs ne portent pas de logique métier : ils appliquent l'autorisation (Policies via FormRequest ou `$this->authorize`), délèguent au Service, et passent le payload au Presenter pour Inertia.
