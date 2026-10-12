# HRMS Platform

A full-stack Human Resource Management System built with ASP.NET Core Web API, React, and PostgreSQL to streamline employee management, recruitment, travel and expenses, employee engagement, and game scheduling.

## Features

- **Authentication & Authorization:** JWT authentication, role-based access, and protected routes.
- **Employee Management:** Employee profiles, organizational hierarchy, and reporting relationships.
- **Recruitment:** Job listings, resume handling, employee referrals, and job sharing.
- **Travel & Expenses:** Travel planning, expense claims, document uploads, and approval workflows.
- **Employee Engagement:** Social posts, comments, reactions, achievements, and recognition.
- **Game Scheduling:** Game cycles, slot booking, waiting queues, and participation tracking.
- **Automation & Notifications:** Quartz.NET scheduled jobs and email notifications.

## Tech Stack

**Backend:** ASP.NET Core Web API (.NET 10), Entity Framework Core, PostgreSQL, JWT, AutoMapper, Quartz.NET, Scalar.

**Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query, Zustand, PrimeReact, Axios.

## Project Structure

```text
HRMS-Project/
├── HRMS-Backend-main/
│   ├── Controllers/
│   ├── Data/
│   ├── Model/
│   ├── Services/
│   ├── Middleware/
│   ├── Program.cs
│   └── HRMS-Backend.csproj
└── HRMS-Frontend-main/
    ├── src/
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## Getting Started

### Prerequisites

- .NET SDK 10
- Node.js 20+ and npm
- PostgreSQL

### Backend Setup

```bash
cd HRMS-Backend-main
dotnet restore
dotnet run
```

Configure the database connection string, JWT settings, and email settings in your local configuration before running the backend.

### Frontend Setup

```bash
cd HRMS-Frontend-main
npm install
npm run dev
```

Open the frontend at [http://localhost:5173](http://localhost:5173).

## Architecture

The application follows a layered architecture:

- **Controllers:** Handle API requests.
- **Services:** Implement business logic.
- **Data Layer:** Manage database operations using Entity Framework Core and PostgreSQL.
- **Middleware:** Handle cross-cutting request processing.
- **Frontend:** Provides role-based interfaces for HR, managers, and employees.
