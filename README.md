# Social Network Backend API

A RESTful API backend for a social network built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- User authentication (registration, login, JWT tokens)
- Post CRUD operations (create, read, update, delete)
- Authorization middleware for protected routes
- Input validation using Zod
- Error handling middleware
- Type-safe codebase (TypeScript with strict mode)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (use `.env.example` as a template):
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=604800
   PORT=3000
   NODE_ENV=development
   ```
   
   Note: `JWT_EXPIRES_IN` should be specified in seconds (default: 604800 = 7 days)

4. Create the database and run migrations:
   ```bash
   npm run migrate
   ```

   **Note**: See [TESTING.md](./TESTING.md) for detailed database setup instructions and testing guide.

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Overview

The API is organized around the following domains:

- **Authentication** — registration, login, logout, and session management
- **Users & Profiles** — user discovery, profile data, and status management
- **Follow** — subscribe / unsubscribe mechanics
- **Posts** — create, read, update, and delete posts
- **Dialogs** — messaging between users
- **Security** — captcha and auxiliary endpoints

All endpoints are prefixed with `/api/` (except the health check at `/health`).

For a complete list of routes, request/response schemas, and curl examples, see **[TESTING.md](./TESTING.md)**.

## Architecture

The project follows a **layered (clean) architecture** that separates concerns into distinct layers. Each layer has a single responsibility and communicates only with the adjacent layer.

### Request Flow

```
Client Request
    ↓
Routes (URL mapping & HTTP method)
    ↓
Middleware (auth, validation, CORS, error handling)
    ↓
Controllers (parse request, delegate to services, format response)
    ↓
Services (business logic, rules, data orchestration)
    ↓
Database (SQL queries via connection module)
    ↓
PostgreSQL
```

### Layers

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **Routes** | Declare URL paths and bind them to controller functions | `auth.routes.ts` maps `POST /api/auth/login` → `login` controller |
| **Middleware** | Intercept requests for cross-cutting concerns (authentication, input validation, centralized error handling) | `authenticateToken` verifies JWT; `validateBody` checks Zod schemas |
| **Controllers** | Handle the HTTP layer: extract params/body, call services, and send JSON responses | `auth.controller.ts` handles registration and login flows |
| **Services** | Encapsulate business logic and database interactions | `user.service.ts` manages user creation, password hashing, and lookups |
| **Database** | Connection management and SQL migrations | `connection.ts` provides the query interface; `migrate.ts` runs schema setup |
| **Types** | Shared TypeScript type definitions used across all layers | `request.types.ts`, `user.types.ts`, `post.types.ts`, etc. |
| **Utils** | Pure helper functions with no external dependencies | `jwt.util.ts`, `password.util.ts`, `validation.util.ts` |

### Key Principles

- **Single Responsibility** — controllers know about HTTP, services know about business rules, routes know only about URL mapping.
- **No business logic in controllers** — controllers delegate to services, keeping the HTTP layer thin.
- **Shared types** — all layers consume types from `src/types/` to maintain type safety end-to-end.
- **Middleware reuse** — authentication and validation logic is written once and applied declaratively on routes.

## Project Structure

```
src/
├── controllers/          # HTTP request handlers (thin layer)
│   ├── auth.controller.ts
│   ├── dialog.controller.ts
│   ├── follow.controller.ts
│   ├── post.controller.ts
│   ├── profile.controller.ts
│   ├── security.controller.ts
│   └── users.controller.ts
├── database/             # DB connection and migrations
│   ├── connection.ts
│   └── migrate.ts
├── middleware/           # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── routes/               # Route definitions (URL → controller)
│   ├── auth.routes.ts
│   ├── dialog.routes.ts
│   ├── follow.routes.ts
│   ├── post.routes.ts
│   ├── profile.routes.ts
│   ├── security.routes.ts
│   └── users.routes.ts
├── services/             # Business logic and DB operations
│   ├── dialog.service.ts
│   ├── follow.service.ts
│   ├── post.service.ts
│   ├── profile.service.ts
│   └── user.service.ts
├── types/                # TypeScript type definitions
│   ├── database.types.ts
│   ├── dialog.types.ts
│   ├── post.types.ts
│   ├── profile.types.ts
│   ├── request.types.ts
│   └── user.types.ts
├── utils/                # Helper utilities
│   ├── jwt.util.ts
│   ├── password.util.ts
│   └── validation.util.ts
├── app.ts                # Express application factory
└── index.ts              # Entry point (server bootstrap)
```

## Deployment

This project can be deployed to free hosting platforms. See deployment guides:

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick start guide (5 minutes)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment instructions

### Recommended Free Platforms:
- **Render** - Truly free, 750 hours/month, includes PostgreSQL
- **Fly.io** - Always-on, no sleep, 3 free VMs
- **Railway** - $5 free credit/month

### Frontend Integration:
Set `FRONTEND_URL` environment variable to your frontend domain for CORS configuration.

## Best Practices

This project follows:
- **DRY** (Don't Repeat Yourself)
- **YAGNI** (You Aren't Gonna Need It)
- **KISS** (Keep It Simple, Stupid)
- TypeScript strict mode
- No use of `any`, `unknown`, or `interface` (using `type` instead)
- Minimal use of `as` keyword
- Clear, descriptive naming conventions

## License

ISC

