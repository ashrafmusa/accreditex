
# AccreditEx - Healthcare Accreditation Management

## Introduction

AccreditEx is a modern, AI-powered desktop application designed to support healthcare institutions throughout their accreditation journey. By providing a centralized, intuitive platform with a **persistent backend simulated via LocalStorage**, it streamlines the management of accreditation programs (like JCI, DNV, and OSAHI), ensures traceability of all actions, and helps maintain a high level of compliance across the entire organization.

## Features

-   **Persistent Data Storage**: All changes are saved automatically, ensuring your work is preserved across sessions.
-   **Admin Control Center**: A comprehensive settings page to manage the application's core. This includes:
    -   **Accreditation Hub**: Dynamically create, update, and delete accreditation programs and their associated standards.
    -   **User Management**: Onboard new users, manage roles, and assign departments, with direct access to detailed user profiles.
    -   **Competency Library**: Centrally define and manage all official staff competencies, skills, and certifications for standardized tracking.
    -   **Data Management**: Export all application data for backup and import from a file to restore state.
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

## Technology Stack

-   **Frontend**: React 18, TypeScript, Tailwind CSS (via CDN)
-   **State Management**: Zustand
-   **Charting**: Recharts
-   **AI Integration**: Google Gemini API (`@google/genai`)
-   **Backend Simulation**: Browser `LocalStorage`
-   **Build System**: None (utilizes modern browser features like `importmap`)

## Architectural Approach

AccreditEx is built on a clean, scalable, and modular architecture to ensure long-term maintainability.

1.  **Frontend (React Application)**: Handles all UI, user interactions, and data presentation. It is composed of page components, reusable UI components, and domain-specific components. The application uses a custom client-side router (`MainRouter.tsx`) driven by a navigation state object.

2.  **State Management (Zustand)**: Global state is managed through feature-based stores (`useAppStore`, `useProjectStore`, `useUserStore`). These stores are the primary way the UI interacts with the `BackendService` to fetch and manipulate data, providing a clean, reactive state management solution.

3.  **Service Layer (`BackendService.ts`)**: The single source of truth for all application data and business logic. It encapsulates all database operations, interactions with the Gemini API, and core application logic. The frontend interacts exclusively with this service via `async` methods, keeping the UI decoupled from data management.

4.  **Data Layer (`data.ts`)**: This service simulates a persistent database. On first launch, it seeds a "database" (using the browser's `LocalStorage`) from the `data/db.json` file. All subsequent data modifications are persisted, ensuring state is maintained across sessions.

5.  **AI Layer (`ai.ts`)**: This service isolates all interactions with the Google Gemini API, providing a clean interface for AI-powered features throughout the application.

## Project Structure

The project is organized into a logical and scalable structure that separates concerns.

```
/
├── components/           # Reusable React components, organized by feature
│   ├── accreditation/    # Components for the Accreditation Hub (ProgramCard, StandardModal, etc.)
│   ├── analytics/        # Chart and table components for the Analytics page
│   ├── calendar/         # Components for the Calendar page (Grid, Header, Modals)
│   ├── common/           # App-wide components (Layout, Header, Modals, Providers)
│   ├── competencies/     # Components for managing competencies
│   ├── departments/      # Components for the Departments Hub
│   ├── documents/        # Components for document management and editors
│   ├── quality-insights/ # Components for the Quality Insights page
│   ├── risk/             # Components for the Risk Hub (CAPA, Risk Matrix, etc.)
│   ├── settings/         # Components for the Settings sections
│   ├── training/         # Components for the Training Hub
│   └── users/            # Components for user management and profiles
├── data/                 # Static data, including localization and DB seed
│   ├── locales/          # Modularized translation files (i18n)
│   │   ├── ar/           # Arabic translations
│   │   └── en/           # English translations
│   ├── seed/             # Original seed data files (for reference)
│   └── db.json           # Consolidated JSON file used to seed the database on first launch
├── hooks/                # Custom React hooks
│   ├── useToast.ts       # Hook for managing toast notifications
│   └── useTranslation.ts # Hook for handling localization
├── pages/                # Top-level components for each view/page of the application
├── services/             # Core application logic and external API communication
│   ├── ai.ts             # Handles all communication with the Google Gemini API
│   ├── BackendService.ts # Central service layer, orchestrates data and AI services
│   └── data.ts           # Simulates the database using LocalStorage
├── stores/               # Zustand state management stores
│   ├── useAppStore.ts    # Manages global app data (standards, documents, settings)
│   ├── useProjectStore.ts# Manages project-related state
│   └── useUserStore.ts   # Manages users and authentication state
├── App.tsx               # Main application component, handles providers and initialization
├── index.html            # The single HTML entry point
├── index.tsx             # The React application entry point
├── metadata.json         # Application metadata
├── README.md             # This file
└── types.ts              # Centralized TypeScript types and interfaces
```

## Backend & Data Persistence

The application uses the browser's `LocalStorage` to simulate a persistent SQLite database, ensuring all data is saved across sessions.

### Initialization and Seeding

-   The `services/data.ts` service manages all data operations.
-   On the application's first launch, the service checks for a `accreditex_db_seeded` flag in `LocalStorage`.
-   If the flag is not present, it fetches the initial data from `data/db.json` and populates `LocalStorage`.
-   On subsequent launches, the service loads all data directly from `LocalStorage`.

### Data Storage

-   All application data (projects, users, standards, etc.) is stored as a single serialized JSON object under the `accreditex_db` key.
-   Every data modification (create, update, delete) is an `async` operation that updates the in-memory state and then writes the entire state back to `LocalStorage`, ensuring data integrity.

### Resetting the Database

To reset the application to its initial seed state, you can either:
1.  Use the **"Reset Application"** button located in `Settings > Data Management`.
2.  Manually clear your browser's `LocalStorage` for this site and refresh the page.

## AI Integration

AI-powered features are provided by the Google Gemini API.

-   All API calls are centralized in `services/ai.ts`.
-   The application requires a valid Google Gemini API key to be available in the execution environment.
-   **API Key Configuration**: The API key **must** be available as `process.env.API_KEY`. The application is designed to use this key automatically without any user input.
## Integration with Diffrent HIS systems 


## Getting Started

The application is designed to run without a build step.

1.  Ensure you have a modern web browser (like Chrome, Firefox, or Edge).
2.  Open the `index.html` file in your browser.
3.  The application will initialize and load the necessary data. If it's the first time, it will seed the database from `data/db.json`.

## Licensing

AccreditEx is dual-licensed.

* **GNU AGPL-3.0:** This license is suitable for open-source projects and non-commercial use. It requires that any derived work, especially if used as a network service, must also be open-source.

* **Commercial License:** For organizations that need to use AccreditEx in a proprietary, closed-source application, a separate commercial license is available. This license removes the obligations of the AGPL.

For commercial inquiries and to purchase a license, please contact us at: **ashraf.a.m.ishag@gmail.com**
