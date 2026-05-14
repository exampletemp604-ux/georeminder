# GeoReminder: Project Report Documentation
**Chapters: Introduction, Literature Survey, and Requirements & Specifications**

---

## CHAPTER 1: INTRODUCTION

### 1.1 Background
In the fast-paced modern world, effective task management is crucial for productivity. Traditional reminder systems rely almost exclusively on time-based triggers. However, a significant portion of daily human activities is inherently tied to specific geographic locations rather than specific times. For example, remembering to "pick up dry cleaning" is only actionable when the user is near the dry cleaner, regardless of the time of day. The advent of ubiquitous smartphone technology, equipped with precise Global Positioning System (GPS) sensors and constant internet connectivity, has paved the way for "context-aware" applications that can intelligently bridge this gap.

### 1.2 Problem Statement
Users frequently fail to complete location-dependent tasks because traditional, time-based reminder applications do not provide notifications at the actionable moment—when the user is physically at or near the required destination. Existing location-based reminder apps often suffer from poor battery optimization, lack of intelligent categorization, and complex user interfaces that make setting a geographic trigger cumbersome.

### 1.3 Proposed Solution: GeoReminder
**GeoReminder** is a sophisticated, AI-enhanced web application designed to solve the problem of spatial forgetfulness. By leveraging the HTML5 Geolocation API, Cloud Database synchronization, and Large Language Models (LLMs), the system provides a seamless, context-aware task management experience. 

When a user creates a reminder, they define a target location and a geofence radius. As the user moves in the real world, the application continuously calculates their distance to active tasks using the Haversine formula. Upon breaching the geofence radius, the system alerts the user via on-screen notifications and Text-to-Speech (TTS) audio. Furthermore, the application integrates Google's Gemini AI to automatically analyze the task's natural language title, assigning relevant categories and visual icons without requiring manual input.

### 1.4 Scope and Objectives
*   **Objective 1**: To develop a highly accurate, real-time geofencing engine utilizing browser-based location services.
*   **Objective 2**: To integrate Natural Language Processing (via Google Gemini) to automate task categorization, reducing cognitive load on the user.
*   **Objective 3**: To implement a secure, multi-user architecture using Firebase Authentication and Cloud Firestore, ensuring strict data isolation and real-time synchronization across devices.
*   **Objective 4**: To provide dynamic waypoint routing and ETA calculations using the TomTom Maps API, assisting users in navigating to their task locations.

---

## CHAPTER 2: LITERATURE SURVEY

### 2.1 Evolution of Context-Aware Computing
Context-aware computing refers to systems that can sense their physical environment and adapt their behavior accordingly. Early research by Schilit and Theimer (1994) defined context as location, identities of nearby people, and objects. GeoReminder builds upon this foundational concept by focusing specifically on spatial context (user coordinates vs. target coordinates) to determine the relevance of stored data (reminders).

### 2.2 Analysis of Existing Task Management Systems
*   **Traditional Calendar Apps (Google Calendar, Apple Calendar)**: Highly effective for scheduled events but lack the flexibility required for asynchronous, location-dependent tasks.
*   **Built-in Mobile Reminders (iOS Reminders, Google Keep)**: These platforms offer basic location-based triggers (e.g., "Remind me when I arrive at Home"). However, they generally lack integration with external routing APIs (to show ETAs) and do not employ AI for automatic categorization or contextual messaging.
*   **Dedicated Navigation Apps (Google Maps, Waze)**: While excellent for routing, they are not designed as primary task management tools and do not allow for complex list management or AI-driven task analysis.

### 2.3 The Role of Artificial Intelligence in Productivity
Recent advancements in Generative Pre-trained Transformers (GPT) and models like Google Gemini have revolutionized how applications process user input. Historically, users had to manually tag tasks (e.g., selecting "Shopping" or "Work" from a dropdown). By integrating the Gemini API, GeoReminder represents a shift towards "zero-touch" categorization, where the system understands the semantic meaning of a task (e.g., "buy milk" implies "Groceries" and the "🛒" emoji) instantly.

### 2.4 Geofencing Technologies and Challenges
Geofencing involves creating a virtual boundary around a real-world geographical area. The primary technical challenge in web-based geofencing is balancing accuracy with battery consumption. GeoReminder addresses this by utilizing native browser location watching capabilities and optimizing the distance calculation loop (Haversine formula) within the React component lifecycle, ensuring that state updates only occur when significant movement is detected.

---

## CHAPTER 3: REQUIREMENTS AND SPECIFICATIONS

### 3.1 Functional Requirements
Functional requirements define the core behaviors and features the system must exhibit.
1.  **User Authentication Module**: 
    *   The system must allow users to create an account securely using an email and password.
    *   The system must support secure login, logout, and password recovery via Firebase Auth.
2.  **Location Search and Mapping**:
    *   The system must integrate the TomTom API to allow users to search for Points of Interest (POIs) or addresses.
    *   The system must provide an interactive map interface (Leaflet) allowing users to manually drop a pin for a custom location.
3.  **Task Management (CRUD)**:
    *   Users must be able to Create, Read, Update (mark as complete), and Delete reminders.
    *   Each reminder must store title, latitude, longitude, and trigger radius.
4.  **AI Integration**:
    *   The system must send the task title to the Gemini API upon creation.
    *   The system must parse the AI response to assign a relevant emoji and category to the task.
5.  **Tracking and Notification Engine**:
    *   The system must continuously monitor the user's GPS coordinates.
    *   The system must calculate the distance to all active reminders.
    *   When the distance is less than or equal to the defined radius, the system must trigger a visual modal and a Text-to-Speech (TTS) audio alert.
6.  **Data Persistence**:
    *   The system must save all user data to Firebase Cloud Firestore.
    *   The system must isolate data so users can only view their own reminders (filtered by `userEmail`).

### 3.2 Non-Functional Requirements
Non-functional requirements dictate the system's operational attributes.
1.  **Performance**: The distance calculation algorithm must execute without causing UI lag. API calls to TomTom and Gemini must be handled asynchronously with appropriate loading states.
2.  **Security**: 
    *   All passwords must be hashed and managed by Firebase.
    *   Firestore Security Rules must be implemented to prevent unauthorized read/write access.
    *   API keys (Gemini, TomTom, Firebase) must be protected using environment variables (`.env.local`).
3.  **Usability**: The application must feature a responsive design, functioning seamlessly on both desktop browsers and mobile devices. It should utilize modern UI/UX principles (e.g., glassmorphism, clear iconography).
4.  **Reliability**: The system must gracefully handle network failures or GPS signal loss, providing appropriate error messages to the user.

### 3.3 Hardware Requirements
*   **Developer Machine**: Minimum 8GB RAM, Multi-core processor (Intel i5/AMD Ryzen 5 or equivalent), 10GB free disk space.
*   **End-User Device**: A modern smartphone, tablet, or PC equipped with a GPS sensor or network-based location capabilities.

### 3.4 Software Requirements
*   **Frontend Framework**: React.js (v18+)
*   **Language**: TypeScript / JavaScript (ES6+)
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS, Framer Motion (for animations)
*   **Backend Services**: Google Firebase (Authentication, Firestore)
*   **External APIs**: Google Gemini Pro API, TomTom Maps/Routing API
*   **Mapping Library**: Leaflet, React-Leaflet
*   **Version Control**: Git / GitHub
*   **Runtime Environment**: Node.js (for local development)
