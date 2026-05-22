# CHAPTER 4: SYSTEM ARCHITECTURE AND DESIGN

## 4.1 System Architecture Principles
GeoReminder is built upon a **Serverless Client-Side Architecture**, leveraging a robust combination of modern frontend frameworks and managed cloud services. The guiding principles of this architecture are:
1.  **Separation of Concerns (MVC Adaptation)**: While React is primarily a UI library, the application adopts a pseudo-MVC pattern. The "Model" is managed remotely via Firebase Cloud Firestore, the "View" comprises React functional components (e.g., `MapView.tsx`, `LoginPage.tsx`, `AddReminderModal.tsx`), and the "Controller" logic is encapsulated within custom React Hooks and externalized service modules (`geminiService.ts`, `ttsService.ts`).
2.  **API-First Design**: The system relies heavily on external Application Programming Interfaces (APIs) to offload complex computational tasks. Natural language understanding is delegated to Google Gemini, while geospatial routing, address autocomplete, and reverse geocoding are handled by TomTom.
3.  **Real-Time Reactivity**: The architecture prioritizes live data synchronization. Using Firebase's `onSnapshot` listeners, the UI reacts instantaneously to database changes across multiple devices without requiring manual page reloads.
4.  **Stateless Tracking Engine**: The core geofencing loop operates continuously in the background, relying on pure mathematical functions (Haversine formula) to evaluate distance against an in-memory array of active tasks, ensuring minimal battery drain and high performance.

---

## 4.2 System Architecture Diagram
This diagram illustrates the high-level components of the system and how they interact to form the serverless ecosystem.

```mermaid
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

---

## 4.3 Data Flow Diagrams (DFD)

Data Flow Diagrams visually represent the movement of information within the GeoReminder system, mapping out inputs, outputs, processes, and data stores at progressive levels of detail.

### 4.3.1 Level 0 DFD (Context Diagram)
The Context Diagram defines the high-level boundary of the GeoReminder application, illustrating the interactions between the system as a single process and all external entities.

```mermaid
graph TD
    %% External Entities
    User["👤 End User"]
    Auth["🔒 Firebase Authentication"]
    Gemini["🤖 Google Gemini AI API"]
    TomTom["🗺️ TomTom Maps API"]
    Firestore["🗄️ Cloud Firestore NoSQL"]

    %% Central Process
    System(("0.0<br/>GeoReminder System"))

    %% Data Flows
    User -- "1. Login Credentials & Profile Details" --> System
    User -- "2. Raw Task Input & Selected Location" --> System
    User -- "3. Continuous Device GPS Coordinates" --> System
    System -- "4. Visual Map Interface & Route Overlays" --> User
    System -- "5. Visual Prompts & Text-to-Speech (TTS) Alerts" --> System
    System -.->|"Audio Broadcast"| User

    System -- "6. Authenticate User Request" --> Auth
    Auth -- "7. Auth Session Token & UID" --> System

    System -- "8. Raw Task Title for Semantics" --> Gemini
    Gemini -- "9. Category, Emoji & Accent Color Payload" --> System

    System -- "10. Coordinates, Routing Modes & Search Queries" --> TomTom
    TomTom -- "11. Polylines, ETAs & Address Match Results" --> System

    System -- "12. Create/Update Profile & CRUD Reminders" --> Firestore
    Firestore -- "13. Real-time Database Snapshots & Sync" --> System

    style System fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff
    style User fill:#0ea5e9,stroke:#0369a1,stroke-width:2px,color:#fff
    style Auth fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
    style Gemini fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    style TomTom fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff
    style Firestore fill:#ec4899,stroke:#be185d,stroke-width:2px,color:#fff
```

### 4.3.2 Level 1 DFD (Functional Decomposition)
The Level 1 DFD decomposes the system into four major functional sub-processes, mapping out the flow of data across the two main Firestore collections (D1: Users and D2: Reminders).

```mermaid
graph TD
    %% Entities & Stores
    User["👤 End User"]
    AuthStore["🔒 Firebase Auth Engine"]
    GeminiAPI["🤖 Google Gemini AI API"]
    TomTomAPI["🗺️ TomTom Maps API"]
    
    %% Data Stores
    D1[("🗄️ D1: users Collection")]
    D2[("🗄️ D2: reminders Collection")]

    %% Processes
    P1(("1.0<br/>Authentication<br/>Process"))
    P2(("2.0<br/>Reminder & Task<br/>Management"))
    P3(("3.0<br/>Location Tracking<br/>& Geofencing"))
    P4(("4.0<br/>Notification<br/>& Alert Engine"))

    %% Authentication flows
    User -- "Login Credentials" --> P1
    P1 -- "Verify Session" --> AuthStore
    AuthStore -- "User Profile & UID" --> P1
    P1 -- "Create / Update User Details" --> D1
    P1 -- "Auth Success Response" --> User

    %% Reminder Management flows
    User -- "Task Title, Radius, Pin Location" --> P2
    P2 -- "Task text" --> GeminiAPI
    GeminiAPI -- "AI Category & Emoji" --> P2
    P2 -- "Save/Update/Delete Reminder" --> D2
    D2 -- "Sync active reminders list" --> P2
    P2 -- "UI list & map overlays" --> User

    %% Location Tracking & Geofencing flows
    User -- "Real-Time GPS Coordinates" --> P3
    P3 -- "Query Active Reminders" --> D2
    P3 -- "Route & Geocoding requests" --> TomTomAPI
    TomTomAPI -- "ETA, Polylines, Address data" --> P3
    P3 -- "Dynamic Map Render & Route Guidance" --> User
    P3 -- "Calculated Distance & Task Info" --> P4

    %% Notification flows
    P4 -- "Trigger Visual Alert & Audio TTS speech" --> User
    P4 -- "Update status to 'triggered' / 'completed'" --> D2

    style P1 fill:#4f46e5,stroke:#312e81,color:#fff
    style P2 fill:#4f46e5,stroke:#312e81,color:#fff
    style P3 fill:#4f46e5,stroke:#312e81,color:#fff
    style P4 fill:#4f46e5,stroke:#312e81,color:#fff
    style D1 fill:#ec4899,stroke:#be185d,color:#fff
    style D2 fill:#ec4899,stroke:#be185d,color:#fff
```

### 4.3.3 Level 2 DFDs
To capture the granular logic of the system, Level 2 DFDs are provided below for the core processes of Reminder Management, Location Tracking, and Notification Triggering.

#### A. Process 2.0 (Reminder & Task Management Detail)
This diagram breaks down the CRUD operations, NLP categorization via Gemini AI, and spatial geocoding via TomTom.

```mermaid
graph TD
    User["👤 End User"]
    Gemini["🤖 Google Gemini AI API"]
    TomTom["🗺️ TomTom Maps API"]
    D2[("🗄️ D2: reminders Collection")]

    subgraph Process 2.0: Reminder Management Detail
        P2_1(("2.1<br/>Validate & Parse<br/>Input"))
        P2_2(("2.2<br/>Request NLP<br/>Categorization"))
        P2_3(("2.3<br/>Fetch Address<br/>& POI Geocoding"))
        P2_4(("2.4<br/>Persist / Update<br/>Database Record"))
    end

    %% Flows
    User -- "1. Enters Task Title & Radius" --> P2_1
    User -- "2. Map Search Query / Manual Pin" --> P2_3
    
    P2_1 -- "3. Cleaned Task Text" --> P2_2
    P2_2 -- "4. POST title request" --> Gemini
    Gemini -- "5. Return JSON (category, emoji, color)" --> P2_2
    
    P2_3 -- "6. Forward address search request" --> TomTom
    TomTom -- "7. Return lat/lng coordinates & address details" --> P2_3
    
    P2_2 -- "8. AI Metadata Payload" --> P2_4
    P2_3 -- "9. Spatial Coordinates Payload" --> P2_4
    P2_1 -- "10. Core reminder detail" --> P2_4
    
    P2_4 -- "11. CRUD operation (Set/Update/Delete Doc)" --> D2
    D2 -- "12. Operation Status / Confirm" --> P2_4
    P2_4 -- "13. Updated Task List & UI confirmation" --> User
```

#### B. Process 3.0 (Location Tracking & Geofencing Detail)
This diagram details how the native browser Geolocation feed is listened to, how distance is calculated, and how routing data is updated dynamically from TomTom.

```mermaid
graph TD
    GPS["🛰️ Device GPS Sensor"]
    D2[("🗄️ D2: reminders Collection")]
    TomTom["🗺️ TomTom Routing API"]
    P4(("4.0 Notification Engine"))
    User["👤 End User"]

    subgraph Process 3.0: Location Tracking & Geofencing
        P3_1(("3.1<br/>Watch Device<br/>Location"))
        P3_2(("3.2<br/>Query Active<br/>Reminders"))
        P3_3(("3.3<br/>Compute<br/>Haversine Distance"))
        P3_4(("3.4<br/>Request TomTom<br/>Route & ETA"))
    end

    %% Flows
    GPS -- "1. High-accuracy coordinate feed" --> P3_1
    P3_1 -- "2. User Location (lat, lng, accuracy)" --> P3_3
    P3_1 -- "3. User Location (lat, lng)" --> P3_4
    
    P3_2 -- "4. Listen for UserEmail's active tasks" --> D2
    D2 -- "5. Return array of active tasks" --> P3_2
    P3_2 -- "6. Reminders List" --> P3_3
    
    P3_3 -- "7. Straight-line proximity distance" --> P3_4
    P3_4 -- "8. Trigger Route Calculation request" --> TomTom
    TomTom -- "9. Return polyline points & ETA duration" --> P3_4
    
    P3_4 -- "10. Map Route Overlays & ETA" --> User
    P3_3 -- "11. Geofence Check (Distance vs Radius)" --> P4
```

#### C. Process 4.0 (Notification & Alert Engine Detail)
This diagram details the exact flow from geofence breach detection, through audio/visual rendering, to final completion states.

```mermaid
graph TD
    P3_3(("3.3 Proximity Calculation"))
    User["👤 End User"]
    D2[("🗄️ D2: reminders Collection")]

    subgraph Process 4.0: Proximity Notification & Alert Detail
        P4_1(("4.1<br/>Compare Distance<br/>vs Radius Limit"))
        P4_2(("4.2<br/>Synthesize<br/>Speech Audio"))
        P4_3(("4.3<br/>Render Alert Modals<br/>& Map Overlays"))
        P4_4(("4.4<br/>Update Database<br/>Task Status"))
    end

    %% Flows
    P3_3 -- "1. Proximity Payload (Distance & Task ID)" --> P4_1
    
    P4_1 -- "2. If Distance <= Radius: Proximity Alert Event" --> P4_2
    P4_1 -- "3. If Distance <= Radius: Proximity Alert Event" --> P4_3
    
    P4_2 -- "4. Audio Speech Output ('Hey, remember to...')" --> User
    P4_3 -- "5. Visual Alert Overlay Modal" --> User
    
    User -- "6. Interacts with Modal (Dismiss / Complete / Close)" --> P4_4
    P4_4 -- "7. Write status: 'triggered' / 'completed' / 'active'" --> D2
    D2 -- "8. Acknowledge & update UI snapshots" --> User
```

### 4.3.4 Data Dictionary

The data dictionary below clarifies the structure and schema of the critical data flows between processes:

*   **Login Credentials**: `{ email, password }`
*   **User Profile Details**: `{ uid, email, firstName, lastName, phoneNumber, age, interests, createdAt }`
*   **Raw Task Input**: `{ title: String, radiusMeters: Number, lat: Number, lng: Number, travelMode: String }`
*   **AI Category Payload**: `{ category: ReminderCategory, emoji: String, categoryColor: String }`
*   **TomTom Routing Payload**: `{ routeDistance: Number, routeETA: String, routePoints: Array<[Number, Number]>, finalAddress: String }`
*   **User Location Feed**: `{ lat: Number, lng: Number, accuracy: Number, timestamp: Number }`
*   **Proximity Payload**: `{ distance: Number, radius: Number, isBreached: Boolean }`
*   **Alert Signal**: `{ voiceSynthesisString: String, modalDisplayActive: Boolean }`

---

## 4.4 Entity-Relationship (ER) Diagram

The ER Diagram details the NoSQL data structure and the relationship between the authenticated user and their specific tasks. Because Firebase Cloud Firestore is a NoSQL document database, this diagram represents a logical schema mapping flat parent-child associations via referencing.

### 4.4.1 NoSQL Relationship Model

```mermaid
erDiagram
    USERS ||--o{ REMINDERS : "creates and owns (1:N)"
    
    USERS {
        string uid PK "Document ID / Firebase User ID"
        string email "User's email address"
        string firstName "User's first name"
        string lastName "User's last name"
        string phoneNumber "Verified mobile number"
        int age "User's age"
        string_array interests "Interests for contextual matching"
        timestamp createdAt "Timestamp of account creation"
    }

    REMINDERS {
        string id PK "Document ID / Auto-generated ID"
        string userEmail FK "Foreign Key linking to USERS.email"
        string title "Brief title of the reminder"
        string originalInput "Raw natural language input entered by the user"
        float lat "Latitude coordinates of target location"
        float lng "Longitude coordinates of target location"
        int radiusMeters "Geofence boundary radius"
        string status "State: 'active' | 'triggered' | 'completed'"
        timestamp createdAt "Timestamp of task creation"
        timestamp triggeredAt "Timestamp when geofence was breached (optional)"
        float lastDistance "Last calculated distance in meters (optional)"
        float routeDistance "TomTom calculated driving/walking route distance (optional)"
        string routeETA "TomTom calculated route ETA string (optional)"
        array routePoints "Array of coordinates for polyline drawing (optional)"
        string searchCategory "Dynamic TomTom POI category (optional)"
        string travelMode "Travel mode: 'driving' | 'walking' | 'cycling' (optional)"
        float finalLat "Latitude of final destination after routing (optional)"
        float finalLng "Longitude of final destination after routing (optional)"
        string finalAddress "Human-readable address of destination (optional)"
        boolean isWaypointRouting "True if continuous waypoint routing is active (optional)"
        string waypointName "Name of the current active waypoint (optional)"
        boolean isTargetPending "True if target POI search is pending (optional)"
        string category "AI-categorized class: 'Shopping', 'Health', etc. (optional)"
        string emoji "AI-selected visual representation emoji (optional)"
        string categoryColor "CSS/Hex color code assigned to the category (optional)"
    }
```

### 4.4.2 Collection Schemas & Data Types

#### A. USERS Collection (`users`)
This collection stores user profile metadata. The Document ID matches the unique `uid` provided by Firebase Authentication upon registration.

| Field | Data Type | Key Type | Description | Required |
| :--- | :--- | :--- | :--- | :--- |
| `uid` | String | Primary Key | Unique user identifier generated by Firebase Auth | Yes |
| `email` | String | Unique Index | User's authenticated email address | Yes |
| `firstName` | String | - | User's first name | Yes |
| `lastName` | String | - | User's last name | Yes |
| `phoneNumber` | String | - | User's verified phone number | Yes |
| `age` | Number | - | User's age | Yes |
| `interests` | Array [String] | - | User's topics/interests for contextual NLP tasks | Yes |
| `createdAt` | Number (Epoch) | - | Account creation timestamp (in milliseconds) | Yes |

#### B. REMINDERS Collection (`reminders`)
This collection stores spatial tasks created by users. The Document ID is auto-generated by Firestore, and records are mapped back to users using `userEmail` as a soft foreign key.

| Field | Data Type | Key Type | Description | Required |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Primary Key | Unique identifier generated by Firestore | Yes |
| `userEmail` | String | Foreign Key | Email address of the user who owns this reminder | Yes |
| `title` | String | - | Cleaned task title | Yes |
| `originalInput` | String | - | Raw text entered by the user in the prompt | Yes |
| `lat` | Number | - | Latitude coordinate of the geofenced location | Yes |
| `lng` | Number | - | Longitude coordinate of the geofenced location | Yes |
| `radiusMeters` | Number | - | Geofencing radius boundary in meters | Yes |
| `createdAt` | Number (Epoch) | - | Timestamp of reminder creation (in milliseconds) | Yes |
| `status` | String | - | Enum: `'active' \| 'triggered' \| 'completed'` | Yes |
| `triggeredAt`| Number (Epoch) | - | Timestamp of boundary breach (optional) | No |
| `lastDistance` | Number | - | Last recorded straight-line distance in meters | No |
| `routeDistance` | Number | - | Dynamic driving/walking/cycling distance from TomTom (meters) | No |
| `routeETA` | String | - | Human-readable route duration (e.g. "12 mins") | No |
| `routePoints` | Array [[Num, Num]] | - | Polyline coordinate pairs for drawing route on Leaflet Map | No |
| `searchCategory` | String | - | Dynamic Category ID (e.g. for searching nearest hospitals/banks) | No |
| `travelMode` | String | - | Enum: `'driving' \| 'walking' \| 'cycling'` | No |
| `finalLat` | Number | - | Latitude coordinates of computed route destination | No |
| `finalLng` | Number | - | Longitude coordinates of computed route destination | No |
| `finalAddress` | String | - | Full street address of target destination returned by TomTom | No |
| `isWaypointRouting`| Boolean | - | Continuous routing flag to check for dynamic updates | No |
| `waypointName` | String | - | Name of intermediate waypoint along route | No |
| `isTargetPending` | Boolean | - | Status flag for pending dynamic search | No |
| `category` | String | - | AI category assigned by Gemini (e.g. `'Shopping'`, `'Health'`) | No |
| `emoji` | String | - | Visually matching emoji assigned by Gemini | No |
| `categoryColor` | String | - | CSS styling color code based on the category | No |

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
    Gemini-->>Frontend: Return Category ("Shopping", "🛒")
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
