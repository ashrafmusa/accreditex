# AccreditEx - Healthcare Accreditation Management

## 1. Introduction

AccreditEx is a modern, AI-powered desktop application designed to support healthcare institutions throughout their accreditation journey. It is currently built with a **mock backend using local JSON data** to provide a fully interactive "as-live" prototype. The application is architected with a clean service layer, making it straightforward to transition to a live backend (see `backend_development.md`). It streamlines the management of accreditation programs, ensures traceability, and helps maintain compliance.

## 2. Features

-   **Mock Data Layer**: The application is pre-populated with realistic sample data from local JSON files to simulate a live environment. All changes are managed in-memory and reset on page refresh.
-   **Mock Authentication**: A simple, non-persistent login system allows you to explore the app using different user roles.
-   **Admin Control Center**: A comprehensive settings page to manage the application's core. This includes:
    -   **Accreditation Hub**: Dynamically create, update, and delete accreditation programs and their associated standards.
    -   **User Management**: Onboard new users, manage roles, and assign departments, with direct access to detailed user profiles.
    -   **Competency Library**: Centrally define and manage all official staff competencies, skills, and certifications for standardized tracking.
-   **Project Creation & Management**: Create projects based on dynamic accreditation programs. The system automatically generates comprehensive checklists from your library of standards.
-   **Project Finalization & Comprehensive Audit Trail**: Formally finalize projects with an electronic signature to create a locked, immutable record. A detailed, timestamped audit log tracks every significant action, providing the traceability required for regulatory compliance (Foundation for 21 CFR Part 11).
-   **Risk & Communication Hub**: Manage Corrective and Preventive Actions (CAPA) through a formal workflow and collaborate with an integrated commenting system on checklist items.
-   **Mock Survey Hub**: Conduct internal audits with a dedicated survey interface and generate comprehensive reports with actionable findings that can be applied back to the project.
-   **Analytics & Reporting**: A centralized dashboard with interactive filters to visualize compliance trends, compare departmental performance, and identify problematic standards.
-   **Compliance Calendar**: A unified, interactive calendar to schedule and visualize all compliance-related activities, including project deadlines, mock surveys, and document review dates.
-   **AI-Powered Tools**: Utilizes the Gemini API to suggest professional action plans, generate policy documents, analyze root causes, and provide high-level quality briefings.
-   **Training & Competency Management**:
    -   **Training Hub**: A full-featured module with interactive content, quizzes, and automated certificate generation.
    -   **User Profile & Competency Hub**: A detailed "digital HR file" for each staff member, tracking their job title, hire date, project involvement, training history, and a full list of their professional competencies and certifications with issue/expiry date tracking.
-   **Departmental Management**: Organize users into departments, view detailed performance dashboards, and assign tasks effectively.
-   **Bilingual & RTL Support**: Full support for English and Arabic, including a right-to-left (RTL) interface.
-   **Light & Dark Mode**: A comfortable viewing experience in any lighting condition.

## 3. Technology Stack

-   **Frontend**: React 18, TypeScript, Tailwind CSS (via CDN)
-   **Backend**: Mock Service Layer (see Section 6)
-   **State Management**: Zustand
-   **Charting**: Recharts
-   **AI Integration**: Google Gemini API (`@google/genai`)
-   **Build System**: None (utilizes modern browser features like `importmap`)

## 4. Architectural Approach

AccreditEx is built on a clean, scalable, and modular architecture designed for an easy transition to a live backend.

1.  **Frontend (React Application)**: Handles all UI, user interactions, and data presentation. It is composed of page components, reusable UI components, and domain-specific components. The application uses a custom client-side router (`MainRouter.tsx`) driven by a navigation state object.

2.  **State Management (Zustand)**: Global state is managed through feature-based stores (`useAppStore`, `useProjectStore`, `useUserStore`). These stores are the primary way the UI interacts with the `BackendService` to fetch and manipulate data, providing a clean, reactive state management solution.

3.  **Service Layer (`BackendService.ts`)**: The single source of truth for all application data and business logic. It currently uses a mock data service (`initialData.ts`) to simulate backend operations. This service encapsulates all data operations, interactions with the Gemini API, and core application logic, keeping the UI decoupled from data management.

4.  **Backend Layer (Mock)**: The application currently **does not have a live backend**. It uses the `initialData.ts` service to load data from JSON files in the `/data` directory into memory on startup. **Data is not persisted between sessions.** For instructions on connecting to a real backend, see `backend_development.md`.

5.  **AI Layer (`ai.ts`)**: This service isolates all interactions with the Google Gemini API, providing a clean interface for AI-powered features throughout the application.

## 5. Project Structure

The project is organized into a logical and scalable structure that separates concerns.

```
/
├── components/           # Reusable React components, organized by feature
├── data/                 # Static data, including localization and initial DB seed files
│   ├── locales/          # Modularized translation files (i18n)
│   ├── *.json            # JSON files used to seed the mock service on first launch
├── firebase/             # Firebase configuration and custom hooks (for future use)
├── hooks/                # Custom React hooks
├── pages/                # Top-level components for each view/page of the application
├── services/             # Core application logic and external API communication
│   ├── ai.ts             # Handles all communication with the Google Gemini API
│   ├── BackendService.ts # Central service layer, talks to the mock data service
│   ├── initialData.ts    # Mock data service that loads from JSON files
├── stores/               # Zustand state management stores
├── App.tsx               # Main application component, handles providers and initialization
├── index.html            # The single HTML entry point
└── types.ts              # Centralized TypeScript types and interfaces
```

## 6. Backend & Data Persistence

The application currently uses a **mock in-memory backend** for demonstration and development purposes.

### Initialization and Seeding

-   The `services/initialData.ts` service manages all mock data operations.
-   On application launch, this service loads the contents of the JSON files from the `/data` directory (e.g., `projects.json`, `users.json`) into memory.
-   The `BackendService.ts` interacts with this in-memory data, simulating API calls.

### Data Persistence

-   **There is no data persistence.** Any changes made during a session (e.g., creating a project, adding a comment) will be lost when the page is refreshed.
-   To transition to a persistent, live backend, follow the comprehensive guide provided in **`backend_development.md`**.

## 7. AI Integration

AI-powered features are provided by the Google Gemini API.

-   All API calls are centralized in `services/ai.ts`.
-   The application requires a valid Google Gemini API key to be available in the execution environment.
-   **API Key Configuration**: The API key **must** be available as `process.env.API_KEY`. The application is designed to use this key automatically without any user input.

## 8. Getting Started

The application is designed to run without a build step.

1.  **Run the Application**: Open the `index.html` file in a modern browser.
2.  The application will initialize, load the mock data from the JSON files, and display the login screen.

**Demo Credentials:**
-   **Email**: `e.reed@healthcare.com`
-   **Password**: `password123`
