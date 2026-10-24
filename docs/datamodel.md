# Modèle de données – Les Petits Pas

Base : Supabase (PostgreSQL). Toutes les tables sont protégées par RLS.

```mermaid
erDiagram
    profiles ||--o{ parent_children : "est parent"
    children ||--o{ parent_children : "a pour parent"
    children ||--o{ events : "a des événements"
    children ||--o{ medication_authorizations : "a des autorisations"
    children ||--o{ messages : "concerne"
    profiles ||--o{ events : "saisit (created_by)"
    profiles ||--o{ medication_authorizations : "enregistre (recorded_by)"
    profiles ||--o{ messages : "envoie (parent_id)"
    profiles |o--o{ messages : "traite (handled_by)"
    medication_authorizations |o--o{ events : "autorise (médicament)"

    profiles {
        uuid id PK "identique à auth.users.id"
        text first_name
        text last_name
        text email
        text role "staff | parent"
        timestamptz created_at
    }

    children {
        uuid id PK
        text first_name
        text last_name
        date birth_date
        text section "bebes | moyens | grands"
        timestamptz created_at
    }

    parent_children {
        uuid parent_id PK, FK
        uuid child_id PK, FK
    }

    medication_authorizations {
        uuid id PK
        uuid child_id FK
        text medication_name
        text dose
        date start_date
        date end_date
        text source "application | papier"
        uuid recorded_by FK
        timestamptz created_at
    }

    events {
        uuid id PK
        uuid child_id FK
        text type "repas | sieste | activite | medicament | incident"
        timestamptz occurred_at
        jsonb details "infos propres à chaque type"
        uuid created_by FK "Saisi par [Prénom]"
        uuid authorization_id FK "obligatoire si médicament"
        timestamptz created_at
    }

    messages {
        uuid id PK
        uuid child_id FK
        uuid parent_id FK
        text content "1 à 500 caractères"
        text status "nouveau | traite"
        uuid handled_by FK
        timestamptz handled_at
        timestamptz created_at
    }
```

## Règles métier

- **Médicament** : un événement `medicament` exige une autorisation valide (bon enfant, date comprise entre `start_date` et `end_date`). Contrôlé par la base (trigger).
- **Rôles** : tout nouveau compte est `parent` par défaut (trigger). Le rôle `staff` est attribué manuellement.
- **Staff** : voit et modifie tout.
- **Parent** : voit uniquement ses enfants, leurs événements et autorisations, et ses propres messages. Il peut envoyer un message ou créer une autorisation, mais pas créer d'événement.