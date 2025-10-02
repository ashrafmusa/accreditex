# AccreditEx: Backend Development & Integration Guide

## 1. Introduction

This document provides a comprehensive, step-by-step guide for transitioning the AccreditEx application from its current state (using `LocalStorage` as a mock backend) to a production-ready application powered by a real database-driven backend API.

The application has been architected with a clear separation of concerns, centralizing all data and business logic into a dedicated service layer (`services/BackendService.ts`). This abstraction is the key to a smooth transition. The React components and Zustand state stores are already designed to interact with this service asynchronously. Therefore, **the vast majority of the frontend code will not need to be changed.**

The goal of this guide is to replace the mock implementations within `BackendService.ts` and `ai.ts` with real HTTP API calls to a new backend server that you will create.

---

## 2. Prerequisites

-   **Backend Technology Stack**: This guide assumes you will use a standard stack like:
    -   **Runtime**: Node.js
    -   **Framework**: Express.js (or a similar framework like NestJS)
    -   **Language**: TypeScript (recommended for type safety)
    -   **Database**: A relational database like PostgreSQL (recommended) or a NoSQL database like MongoDB.
    -   **ORM/ODM**: Prisma (recommended for its excellent TypeScript support) or another tool like TypeORM or Mongoose.
-   **Knowledge**: A solid understanding of building RESTful APIs, database design, and user authentication (specifically JWT).

---

## 3. Step-by-Step Transition Guide

### Step 1: Set Up the Backend Server

First, create a new Node.js project for your backend server.

1.  **Initialize Project**:
    ```bash
    mkdir accreditex-backend
    cd accreditex-backend
    npm init -y
    npm install express cors dotenv
    npm install -D typescript ts-node nodemon @types/express @types/cors
    ```

2.  **Configure `tsconfig.json`**:
    Create a `tsconfig.json` file with basic settings for a Node.js project.

3.  **Create a Basic Express Server** (`src/server.ts`):
    ```typescript
    import express from 'express';
    import cors from 'cors';
    import dotenv from 'dotenv';

    dotenv.config();

    const app = express();
    const port = process.env.PORT || 3001;

    app.use(cors()); // Configure with specific origins in production
    app.use(express.json());

    // --- API Routes will go here ---

    app.listen(port, () => {
      console.log(`Backend server is running on http://localhost:${port}`);
    });
    ```

### Step 2: Design the Database Schema

The frontend's `types.ts` file is your blueprint for the database schema. Using an ORM like Prisma makes translating these types into database models straightforward.

1.  **Install Prisma**:
    ```bash
    npm install prisma --save-dev
    npx prisma init --datasource-provider postgresql
    ```

2.  **Define Schema in `prisma/schema.prisma`**:
    Translate the interfaces from `types.ts` into Prisma models. Pay close attention to relations.

    **Example `schema.prisma` (partial):**
    ```prisma
    model User {
      id        String     @id @default(uuid())
      name      String
      email     String     @unique
      password  String     // This will be a hashed password
      role      UserRole
      // ... other fields
      projectsLed Project[] @relation("ProjectLead")
      assignedTasks ChecklistItem[] @relation("AssignedTo")
    }

    model Project {
      id          String       @id @default(uuid())
      name        String
      description String
      // ... other fields
      projectLead   User       @relation("ProjectLead", fields: [projectLeadId], references: [id])
      projectLeadId String
      checklist   ChecklistItem[]
    }

    model ChecklistItem {
      id         String    @id @default(uuid())
      item       String
      // ... other fields
      project    Project   @relation(fields: [projectId], references: [id])
      projectId  String
      assignedTo User?     @relation("AssignedTo", fields: [assignedToId], references: [id])
      assignedToId String?
    }

    enum UserRole {
      Admin
      ProjectLead
      TeamMember
      Auditor
    }
    ```
    *Continue this process for all types in `types.ts`.*

3.  **Migrate the Database**:
    ```bash
    npx prisma migrate dev --name init
    ```

### Step 3: Create API Endpoints

Build the RESTful API endpoints that the frontend will call. Structure your routes logically (e.g., `routes/projects.ts`, `routes/users.ts`).

**Example: Projects Route (`src/routes/projects.ts`)**
```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /api/projects
router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany({
    include: { projectLead: true, checklist: true /* ... other relations */ }
  });
  res.json(projects);
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const projectData = req.body;
  const updatedProject = await prisma.project.update({
    where: { id },
    data: projectData,
  });
  res.json(updatedProject);
});

// ... Implement POST, DELETE, etc. ...

export default router;
```

### Step 4: Modify `BackendService.ts`

This is the central task on the frontend. Replace every method that interacts with `dataService` with a `fetch` call to your new backend API.

**Before:**
```typescript
// services/BackendService.ts
class BackendService {
  getProjects = (): Project[] => dataService.getProjects();
  
  async updateProject(updatedProject: Project): Promise<Project> {
    const projects = this.getProjects().map(p => p.id === updatedProject.id ? updatedProject : p);
    await dataService.setProjects(projects);
    return updatedProject;
  }
}
```

**After:**
```typescript
// services/BackendService.ts
const API_BASE_URL = 'http://localhost:3001/api'; // Use environment variables for production

class BackendService {
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return await response.json();
  }
  
  async updateProject(updatedProject: Project): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${updatedProject.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        // Authorization header will be added in the next step
      },
      body: JSON.stringify(updatedProject),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return await response.json();
  }
}
```
*Apply this pattern to **all** methods in `BackendService.ts`.* The `offlineQueue` logic should be removed, as a real offline strategy requires a more robust solution like IndexedDB and a Service Worker sync manager.

### Step 5: Implement Authentication (JWT)

The current authentication is a simple mock. Replace it with a secure, token-based system.

1.  **Backend**: Create a `/api/auth/login` endpoint.
    -   It should accept an email and password.
    -   Use a library like `bcrypt` to compare the provided password with the hashed password in your database.
    -   If valid, generate a JSON Web Token (JWT) using a library like `jsonwebtoken` and return it to the client.
    -   Protect your other API routes with middleware that verifies the JWT from the `Authorization` header.

2.  **Frontend (`BackendService.ts`)**:
    -   Modify the `authenticateUser` method to call the `/api/auth/login` endpoint.
    -   Upon successful login, store the received JWT in `localStorage`.
    -   Modify all other API-calling methods to include the token in the headers:
      ```typescript
      async getProjects(): Promise<Project[]> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // ...
      }
      ```
      (A best practice is to create a wrapper function for `fetch` that automatically adds this header).

### Step 6: Secure the AI Service

**This is a critical security step.** The Gemini API key must never be exposed on the frontend. All AI calls must be proxied through your backend.

1.  **Backend**:
    -   Store your `API_KEY` securely in a `.env` file on your server.
    -   Create new endpoints for each AI feature, for example: `/api/ai/suggest-action-plan`.
    -   This endpoint will receive the prompt data from the frontend, make a secure, server-to-server call to the Google Gemini API, and return the result.

    **Example AI Endpoint:**
    ```typescript
    // In your backend server
    router.post('/ai/suggest-action-plan', async (req, res) => {
      const { standardDescription } = req.body;
      // Initialize your Gemini client on the server
      const prompt = `...`; // Construct the prompt as before
      const result = await gemini.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      res.json({ suggestion: result.text });
    });
    ```

2.  **Frontend (`services/ai.ts`)**:
    -   Remove the `GoogleGenAI` client initialization.
    -   Update each method to call your new backend API endpoints instead of calling the Gemini API directly.

    **Before:**
    ```typescript
    // services/ai.ts
    class AIService {
        async suggestActionPlan(standardDescription: string): Promise<string> {
            const prompt = `...`;
            const response = await this._ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            return response.text;
        }
    }
    ```

    **After:**
    ```typescript
    // services/ai.ts
    class AIService {
        async suggestActionPlan(standardDescription: string): Promise<string> {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/ai/suggest-action-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ standardDescription })
            });
            const data = await response.json();
            return data.suggestion;
        }
    }
    ```

---

## 4. Conclusion

By following this guide, you can methodically replace the mock `LocalStorage` backend with a robust, secure, and scalable API. The frontend's architecture is designed to accommodate these changes with minimal friction, allowing you to focus on building a powerful backend that brings AccreditEx to its full potential.
