# CHAPTER 4: SYSTEM ARCHITECTURE AND DESIGN

## 4.1 System Architecture Principles
GeoReminder is built upon a **Serverless Client-Side Architecture**, leveraging a robust combination of modern frontend frameworks and managed cloud services. The guiding principles of this architecture are:
1.  **Separation of Concerns (MVC Adaptation)**: While React is primarily a UI library, the application adopts a pseudo-MVC pattern. The "Model" is managed remotely via Firebase Cloud Firestore, the "View" comprises React functional components (e.g., `MapView.tsx`, `LoginPage.tsx`), and the "Controller" logic is encapsulated within custom React Hooks and externalized service modules (`geminiService.ts`, `ttsService.ts`).
2.  **API-First Design**: The system relies heavily on external Application Programming Interfaces (APIs) to offload complex computational tasks. Natural language understanding is delegated to Google Gemini, while geospatial routing and geocoding are handled by TomTom.
3.  **Real-Time Reactivity**: The architecture prioritizes live data synchronization. Using Firebase's `onSnapshot` listeners, the UI reacts instantaneously to database changes across multiple devices without requiring manual page reloads.
4.  **Stateless Tracking Engine**: The core geofencing loop operates continuously in the background, relying on pure mathematical functions (Haversine formula) to evaluate distance against an in-memory array of active tasks, ensuring minimal battery drain and high performance.

---

## 4.2 System Architecture Diagram
This diagram illustrates the high-level components of the system and how they interact.

```mermaid
BRO PASTE KAR USMA YAAR 

graph TD
    subgraph Frontend Application [React JS Frontend]
        UI[User Interface Components]
        Map[Leaflet Map View]
        Engine[Geofencing Tracking Engine]
        TTS[Text-to-Speech Service]
    end

    subgraph Backend Services [Google Firebase]
        Auth[(Firebase Authentication)]
        DB[(Cloud Firestore NoSQL)]
    end

    subgraph External APIs
        TomTom[TomTom Maps & Routing API]
        Gemini[Google Gemini AI API]
    end

    User((User)) <--> UI
    UI <--> Map
    UI <--> Engine
    Engine --> TTS

    UI <--> Auth
    UI <--> DB
    Engine <--> DB

    UI <--> Gemini
    Map <--> TomTom
    UI <--> TomTom
``` 

MAIN

---

## 4.3 Data Flow Diagrams (DFD)

### 4.3.1 Level 0 DFD (Context Diagram)
The Context Diagram shows the GeoReminder system as a single process interacting with external entities.

```mermaid
graph LR
    U((User)) -- "Login Credentials" --> SYS((GeoReminder System))
    U -- "Task Input & Location" --> SYS
    SYS -- "Visual & Audio Alerts" --> U
    SYS -- "Map Interface" --> U

    SYS -- "Auth Request" --> FA[Firebase Auth]
    FA -- "Auth Token" --> SYS

    SYS -- "CRUD Operations" --> FS[Firestore DB]
    FS -- "Data Sync" --> SYS

    SYS -- "Task Title" --> GA[Gemini AI]
    GA -- "Category & Emoji" --> SYS

    SYS -- "Coordinates" --> TT[TomTom API]
    TT -- "Routing & POI Data" --> SYS
```

### 4.3.2 Level 1 DFD
This diagram breaks the system down into its primary sub-processes.

```mermaid
graph TD
    U((User)) --> P1[1. Authentication Process]
    P1 <--> FA[(Firebase Auth)]

    U --> P2[2. Reminder Management]
    P2 --> GA[Gemini AI API]
    GA --> P2
    P2 <--> FS[(Firestore Database)]

    U --> P3[3. Location Tracking]
    P3 --> TT[TomTom API]
    TT --> P3
    P3 <--> FS

    P3 --> P4[4. Notification Trigger]
    P4 --> TTS[Speaker / Screen]
    TTS --> U
```

---

## 4.4 Entity-Relationship (ER) Diagram
The ER Diagram details the NoSQL data structure and the relationship between the authenticated user and their specific tasks.

```mermaid
erDiagram
    USER ||--o{ REMINDER : "creates and owns"
    
    USER {
        string email PK "User's unique email address"
        string uid "Firebase Authentication ID"
    }

    REMINDER {
        string id PK "Unique Firestore Document ID"
        string userEmail FK "Foreign Key linking to User"
        string title "User's raw task description"
        float lat "Latitude of the target destination"
        float lng "Longitude of the target destination"
        int radiusMeters "Geofence trigger distance"
        string status "Enum: active, triggered, completed"
        string category "AI-generated category tag"
        string emoji "AI-generated visual icon"
        timestamp createdAt "Epoch timestamp of creation"
    }
```

---

## 4.5 Sequence Diagram: Task Creation and Trigger Flow
This sequence diagram maps out the chronological flow of events from the moment a user creates a reminder to the moment they physically arrive at the location and receive an alert.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Gemini as Gemini AI
    participant DB as Firestore
    participant GPS as Device GPS

    User->>Frontend: Enters Task ("Buy Milk") & Location
    Frontend->>Gemini: Request Categorization ("Buy Milk")
    Gemini-->>Frontend: Return Category ("Groceries", "🛒")
    Frontend->>DB: Save Task Data (Status: Active)
    DB-->>Frontend: Confirm Save
    
    loop Every 5 seconds
        GPS-->>Frontend: Send current coordinates
        Frontend->>Frontend: Haversine(CurrentLoc, TaskLoc)
        alt Distance <= Radius
            Frontend->>Frontend: Trigger Alert Logic
            Frontend->>User: Play TTS Audio & Show Modal
            Frontend->>DB: Update Task (Status: Triggered)
        end
    end
    
    User->>Frontend: Clicks "Mark as Done"
    Frontend->>DB: Update Task (Status: Completed)
```
