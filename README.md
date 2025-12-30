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

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Posts

- `GET /api/posts` - Get all posts (with pagination: `?limit=50&offset=0`)
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/author/:authorId` - Get posts by author (with pagination)
- `POST /api/posts` - Create a new post (requires authentication)
- `PUT /api/posts/:id` - Update a post (requires authentication, author only)
- `DELETE /api/posts/:id` - Delete a post (requires authentication, author only)

### Health Check

- `GET /health` - Health check endpoint

## Request/Response Examples

### Register User
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { ... },
  "token": "jwt-token-here"
}
```

### Create Post
```json
POST /api/posts
Headers: Authorization: Bearer <token>
{
  "title": "My First Post",
  "content": "This is the content of my post"
}
```

## Project Structure

```
src/
├── controllers/     # Request handlers
├── database/        # Database connection and migrations
├── middleware/      # Express middleware (auth, error handling, validation)
├── routes/          # Route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express app configuration
└── index.ts         # Application entry point
```

## Deployment

This project can be deployed to free hosting platforms. See deployment guides:

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick start guide (5 minutes)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment instructions

### Recommended Free Platforms:
- **Railway** - Easiest setup, includes PostgreSQL
- **Render** - Good free tier, automatic SSL
- **Fly.io** - Fast performance, global edge

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

