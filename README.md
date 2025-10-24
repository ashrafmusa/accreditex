# AccreditEx - AI-Powered Healthcare Accreditation Management

## 1. Introduction

AccreditEx is a modern, responsive, and AI-powered desktop application designed to support healthcare institutions throughout their accreditation journey. It provides a comprehensive suite of tools to streamline the management of accreditation programs, ensure traceability, and help maintain compliance with complex standards.

This application is currently built with a **mock backend using local JSON data** to provide a fully interactive "as-live" prototype. The application is architected with a clean service layer, making it straightforward to transition to a live backend (see `backend_development.md`).

## 2. Core Features

AccreditEx is organized into several key modules, each addressing a critical aspect of accreditation management.

### **Dashboard & Hubs**
-   **Role-Based Dashboards**: Customized landing pages for Admins, Project Leads, and Team Members, providing relevant overviews and quick access to tasks.
-   **Central Hubs**: Dedicated hubs for Accreditation, Audits, Document Control, and Risk Management, offering centralized control and visibility.

### **Accreditation & Project Management**
-   **Dynamic Program Management**: Create, update, and delete accreditation programs and their associated standards.
-   **Automated Project Creation**: Generate projects from accreditation programs, which automatically creates comprehensive checklists from the library of standards.
-   **Task Management**: Assign, track, and manage tasks related to each project checklist item.

### **Document Control**
-   **Controlled Document Management**: A secure system for drafting, reviewing, approving, and archiving controlled documents.
-   **Version History**: Full version tracking for all documents.
-   **In-App Editor**: A rich text editor for creating and modifying documents directly within the application.
-   **Evidence Upload**: Link evidence and artifacts to checklist items.

### **Risk & Quality Management**
-   **Risk Register**: A centralized register to identify, assess, and track risks.
-   **CAPA System**: Manage Corrective and Preventive Actions (CAPA) from incidents or audit findings.
-   **Incident Reporting**: A simple interface for staff to report incidents.

### **User & Department Management**
-   **User Administration**: Onboard new users, manage roles (Admin, Project Lead, Team Member), and assign them to departments.
-   **Competency Library**: Define and manage staff competencies and certifications.

## 3. AI-Powered Capabilities

AccreditEx leverages Google's Generative AI to enhance productivity and provide intelligent insights.
-   **AI Assistant for Documents**:
    -   Generate document content based on selected accreditation standards.
    -   Improve the writing and clarity of existing text.
    -   Translate content into different languages.
-   **AI Quality Briefing**: Get AI-generated summaries and insights on quality metrics and performance.
-   **Root Cause Analysis**: Use AI to help identify the root causes of incidents or non-compliance issues.

## 4. Tech Stack

-   **Frontend**: React, Vite, TypeScript
-   **Styling**: Tailwind CSS
-   **State Management**: Zustand
-   **Data Visualization**: Recharts
-   **Animation**: Framer Motion
-   **Backend**: Mock service layer using local JSON files.
-   **AI**: Google Generative AI (`@google/genai`)

## 5. Getting Started

*(Instructions on how to install dependencies and run the project would go here. e.g., `npm install` and `npm run dev`)*

## 6. Backend Integration

The current implementation uses a mock backend that simulates API calls and data persistence in-memory. The data service layer is designed to be easily swappable with a live backend. For more details on transitioning to a production backend, please refer to the `backend_development.md` guide.
