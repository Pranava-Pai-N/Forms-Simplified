# Forms Simplified

<div align="center">

A modern full-stack survey and form-building platform that lets users create branded surveys, share public links, collect responses, and manage submissions from a single dashboard.

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=for-the-badge)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178c6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-646cff?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06b6d4?logo=tailwind-css&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Hono](https://img.shields.io/badge/Hono-API-ff5e5b?logo=hono&logoColor=white&style=for-the-badge)](https://hono.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-Deploy-f38020?logo=cloudflare&logoColor=white&style=for-the-badge)](https://workers.cloudflare.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma&logoColor=white&style=for-the-badge)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/docker%2B-f69220?logo=docker&logoColor=blue&style=for-the-badge)](https://hub.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-336791?logo=postgresql&logoColor=white&style=for-the-badge)](https://www.postgresql.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9%2B-f69220?logo=pnpm&logoColor=white&style=for-the-badge)](https://pnpm.io/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Contribution Guidelines](#contribution-guidelines)
- [Developers](#developers)
- [License](#license)

---

<a id="overview"></a>
## Overview

Forms Simplified is organized as a **monorepo** with two main applications:

| Component | Description |
|-----------|-------------|
| **Web App** | React + TypeScript frontend for creating and managing surveys |
| **API** | Hono-based backend running on Cloudflare Workers with Prisma and PostgreSQL |

The product focuses on a smooth creator experience with authentication, survey creation, public sharing, QR-code distribution, and response management.

## Live Deployment
<a id="deployment"></a>
The project is deployed and can be accessed via the link below:

<a id="deployment"></a>
<div align="center">
  <a href="https://forms.pranava-pai.live" target="_blank">
    <img src="https://img.shields.io/badge/Live-Demo-red?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo" />
  </a>
</div>

---

<a id="features"></a>
## Features

- User authentication and protected dashboards
- Create and edit surveys with title, description, cover image, and theme color
- Publish and share public survey links
- Generate QR codes for sharing
- Collect and review survey responses in real-time
- Manage surveys from a centralized dashboard
- Responsive design for mobile and desktop

---

<a id="tech-stack"></a>
## Tech Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS
- **UI Components**: Custom & shadcn/ui

### Backend
- **Framework**: Hono
- **Infrastructure**: Cloudflare Workers
- **Database ORM**: Prisma
- **Database**: PostgreSQL-compatible deployed on [Neon](https://neon.tech)
- **Validation**: Zod
- **Authentication**: JWT-based (Session)

### Developer Experience
- **Monorepo Manager**: pnpm workspaces
- **Code Quality**: Biome (formatting, linting, imports)
- **Deployment**: Wrangler (Cloudflare) ,Cloudflare Pages for Frontend, Cloudflare Workers for Backend
- **Process Manager**: concurrently - Run multiple packages simultaneously

---

<a id="architecture"></a>
## Architecture

Forms Simplified follows a **clean separation** between client and API layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Forms Simplified                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │   Web Frontend       │      │   API Backend        │    │
│  │  (React + TS)        │◄────►│  (Hono + Workers)    │    │
│  │  - Routes            │      │  - Controllers       │    │
│  │  - Components        │      │  - Middleware        │    │
│  │  - State Mgmt        │      │  - Routes            │    │
│  └──────────────────────┘      └──────────────────────┘    │
│                                        │                    │
│                                        ▼                    │
│                         ┌──────────────────────┐            │
│                         │  Prisma ORM          │            │
│                         │  - Schema            │            │
│                         │  - Migrations        │            │
│                         └──────────────────────┘            │
│                                        │                    │
│                                        ▼                    │
│                         ┌──────────────────────┐            │
│                         │  PostgreSQL Database │            │
│                         │  - Users             │            │
│                         │  - Surveys           │            │
│                         │  - Responses         │            │
│                         └──────────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
Forms-Simplified/
├── web/                          # React frontend
│   ├── src/
│   │   ├── components/          # React + Shadcn components
│   │   ├── routes/              # TanStack Router pages
│   │   ├── hooks/               # Custom React hooks
│   │   └── lib/                 # Utilities and API client
│   ├── package.json
│   └── tsconfig.json
│
├── api/                          # Hono backend (Cloudflare Workers)
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   ├── routes/              # API endpoints
│   │   ├── middlewares/         # Authentication & file upload
│   │   ├── lib/                 # Database setup
│   │   └── utils/               # Helpers & validations
│   ├── prisma/
│   │   ├── schema.prisma        # Data model
│   │   └── migrations/          # Database migrations
│   ├── wrangler.jsonc           # Cloudflare config
│   └── package.json
│
└── biome.json                    # Code quality config
```

---

<a id="getting-started"></a>
## Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | 20.0.0+ |
| **pnpm** | 9.0.0+ |
| **Database** | PostgreSQL-compatible |
| **Wrangler** | Latest (for Cloudflare deployment) |

### Installation Steps

**1. Clone the repository**
```bash
git clone https://github.com/Pranava-Pai-N/Forms-Simplified.git
cd Forms-Simplified
```

**2. Install dependencies**
```bash
pnpm install
```

**3. Configure environment variables**

Frontend:
```bash
cd web && cp .env.example .env
```

Backend:
```bash
cd api && cp .env.example .env
```

**4. Set up the database**
```bash
pnpm db:migrate
```

**5. Start the database via docker**
```docker
docker run -it -p 5432:5432 -e POSTGRES_USER=username -e POSTGRES_PASSWORD=password postgres
```

**6. Migrate the Database**
```bash
npx prisma migrate dev
```

**7. Generate the Prisma Client**
```bash
npx prisma generate
```


**8. Start development servers**
```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8787 |

---



## Deployment

Deployments for this monorepo use Cloudflare Pages for the frontend and Cloudflare Workers (Wrangler) for the API. Quick steps:

- Frontend (Cloudflare Pages)

```bash
# build the frontend
cd web
pnpm build
```

- Backend (Cloudflare Workers)

```bash
cd api
wrangler publish
```

<a id="available-scripts"></a>
## Available Scripts

From the repository root:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run frontend and API concurrently |
| `pnpm build` | Build frontend for production |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm check` | Run Biome lint and format validation |
| `pnpm check:fix` | Auto-fix Biome issues |
| `pnpm format` | Format code with Biome |
| `pnpm lint` | Run Biome linter only |


### Quick Reference
```bash
# Development
pnpm dev                    # Start development servers

# Code Quality
pnpm check                  # Lint and format check
pnpm check:fix              # Auto-fix issues
pnpm typecheck              # TypeScript validation

# Production
pnpm build                  # Build for production
```

---

<a id="configuration"></a>
## Developer Configuration

### Biome Configuration

This project uses **Biome** as the unified tool for code formatting and linting. Configuration is defined in `biome.json`:

| Setting | Value |
|---------|-------|
| **Indentation** | 2 spaces |
| **Quotes** | Single quotes |
| **Semicolons** | Included |
| **Trailing Commas** | All |
| **Line Width** | 80 |

**Key Features:**
- JavaScript/TypeScript formatting
- Tailwind CSS support
- Import organization
- Recommended lint rules
- CSS-in-JS awareness

**Recommended Workflow:**
```bash
pnpm check          # Validate formatting and linting
pnpm check:fix      # Auto-fix all issues
pnpm format         # Reformat code
```

---

<a id="contribution-guidelines"></a>
## Contribution Guidelines

We welcome contributions! Please follow this professional workflow:

### 1. Prepare Your Changes
```bash
git checkout -b feature/your-feature-name
```

### 2. Make & Validate Changes
- Keep changes focused and well-scoped
- Follow existing code style and naming conventions
- Write clear, descriptive commit messages

### 3. Pre-Submission Checks
```bash
pnpm check          # Lint and format validation
pnpm typecheck      # TypeScript type checking
pnpm build          # Verify build succeeds
```

### 4. Commit Message Format
Follow conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `chore:` for maintenance and tooling
- `docs:` for documentation updates
- `refactor:` for code restructuring
- `test:` for test additions

### 5. Create a Pull Request
- Open PR with a clear summary
- Link related issues
- Describe the changes and their impact
- Ensure CI checks pass

### Example
```bash
git add .
git commit -m "feat: add user profile customization"
git push origin feature/your-feature-name
# Create PR on GitHub
```


---

<a id="license"></a>
## License

This project is licensed under the [MIT License](./LICENSE) - see the LICENSE file for details.


<a id="developers"></a>
## Developed by:

**Pranava Pai N**
- GitHub: [Pranava-Pai-N](https://github.com/Pranava-Pai-N)
- Website: [Portfolio Website](https://pranava-pai.live)
- Role: Full-Stack Developer and ML Engineer