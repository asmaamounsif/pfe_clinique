# Clinique Mounsif — System Architecture & Conception

This document holds the conception design diagrams and architectural blueprints for **Clinique Mounsif**. It is updated continuously as we implement features.

---

## 1. System Overview Architecture

The following diagram illustrates the data flow and communication protocols between the Frontend, Node.js API Gateway, Laravel API, and MySQL database:

```mermaid
graph TD
    %% Define Nodes
    Browser["React Frontend (SPA)<br/>Port: 5173 / Vite"]
    Gateway["Node.js API Gateway<br/>Port: 3050 / Express"]
    Laravel["Laravel API Engine<br/>Port: 8000 / PHP"]
    Database["MySQL Database<br/>Port: 3306 / XAMPP"]

    %% Define Flows
    Browser -- "HTTP Requests / Bearer Token" --> Gateway
    Gateway -- "Rate Limiting & Proxy Routing" --> Laravel
    Laravel -- "Eloquent ORM / SQL" --> Database

    %% Styles
    style Browser fill:#1a2030,stroke:#3b82f6,stroke-width:2px,color:#e8edf5
    style Gateway fill:#151a22,stroke:#14b8a6,stroke-width:2px,color:#e8edf5
    style Laravel fill:#0f1318,stroke:#ef4444,stroke-width:2px,color:#e8edf5
    style Database fill:#0a0d12,stroke:#f97316,stroke-width:2px,color:#e8edf5
```

---

## 2. Authentication Flow (Sanctum)

This sequence diagram details the login process, Sanctum token generation, and role checks:

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Clinician / Patient)
    participant Front as React Frontend
    participant Gate as Node Gateway
    participant Back as Laravel API (Sanctum)
    participant DB as MySQL DB

    User->>Front: Input credentials (Email, Password)
    Front->>Gate: POST /api/login
    Gate->>Back: Proxy POST /login
    Back->>DB: Query user by email
    DB-->>Back: User data & hashed password
    Back->>Back: Verify password Hash::check()
    alt Credentials Invalid
        Back-->>Gate: 401 Unauthorized Response
        Gate-->>Front: 401 Unauthorized Response
        Front-->>User: Show login error
    else Credentials Valid
        Back->>DB: Generate Personal Access Token
        DB-->>Back: Token created
        Back-->>Gate: 200 OK (User + Bearer Token)
        Gate-->>Front: 200 OK (User + Bearer Token)
        Front->>Front: Store token in localStorage
        Front->>Front: Redirect to /dashboard (RootRedirect)
    end
```

---

## 3. Database Schema (Initial Clean Slate)

The initial Entity Relationship Diagram (ERD) representing our secure, RBAC-driven authentication structure:

```mermaid
erDiagram
    roles {
        unsigned_bigint id PK
        string name
        string slug UK
        string description
        timestamps created_at
    }
    users {
        unsigned_bigint id PK
        string first_name
        string last_name
        string email UK
        string password
        unsigned_bigint role_id FK
        string phone
        string specialty
        boolean is_active
        timestamps created_at
    }

    roles ||--o{ users : "defines authorization for"
```
