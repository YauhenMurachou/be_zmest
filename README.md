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

### Samurai-compatible endpoints (for existing frontend)

These match the structure from the SamuraiJS Social Network API docs.

- `POST /auth/login`
- `DELETE /auth/login` (logout)
- `GET /auth/me`
- `GET /users`
- `GET /profile/{userId}`
- `GET /profile/status/{userId}`
- `PUT /profile/status`
- `PUT /profile`
- `PUT /profile/photo` (stubbed success)
- `GET /follow/{userId}`
- `POST /follow/{userId}`
- `DELETE /follow/{userId}`
- `GET /security/get-captcha-url`

### Internal JSON API endpoints

Authentication:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user (returns `userId` and `token` in response)
- `POST /api/auth/logout` - Logout user (requires authentication)
- `GET /api/auth/me` - Get current user (requires authentication)

Posts:

- `GET /api/posts` - Get all posts (with pagination: `?limit=50&offset=0`)
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/author/:authorId` - Get posts by author (with pagination)
- `POST /api/posts` - Create a new post (requires authentication)
- `PUT /api/posts/:id` - Update a post (requires authentication, author only)
- `DELETE /api/posts/:id` - Delete a post (requires authentication, author only)

Health Check:

- `GET /health` - Health check endpoint

## Response Format

All API responses follow the **Operation Result Object** format:

```json
{
  "resultCode": 0,      // 0 = success, 1 = error
  "messages": [],       // Empty array if success, error messages if error
  "data": {}            // Response data (varies by endpoint)
}
```

## Request/Response Examples

### Register User
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123"
}

Response:
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}

Response:
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "userId": 1,
    "token": "jwt-token-here"
  }
}
```

**Note:** The JWT token is returned both:
- In the response body as `data.token`
- In the `Authorization` response header as `Bearer <token>`

### Get Current User
```json
GET /api/auth/me
Headers: Authorization: Bearer <token>

Response:
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "id": 1,
    "email": "user@example.com",
    "login": "johndoe"
  }
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

Response:
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "post": {
      "id": 1,
      "title": "My First Post",
      "content": "This is the content of my post",
      "authorId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": 1,
        "username": "johndoe",
        "email": "user@example.com"
      }
    }
  }
}
```

### Get Users (Samurai style)

```json
GET /users?page=1&count=10&term=john

Response:
{
  "items": [
    {
      "id": 1,
      "name": "johndoe",
      "status": "Hello world",
      "photos": {
        "small": null,
        "large": null
      },
      "followed": false
    }
  ],
  "totalCount": 1,
  "error": null
}
```

### Get Profile

```json
GET /profile/1

Response:
{
  "aboutMe": "about me text",
  "contacts": {
    "facebook": null,
    "github": null,
    "instagram": null,
    "mainLink": null,
    "twitter": null,
    "vk": null,
    "website": null,
    "youtube": null
  },
  "lookingForAJob": true,
  "lookingForAJobDescription": "Looking for a job",
  "fullName": "samurai dmitry",
  "userId": 1,
  "status": "my status",
  "photos": {
    "small": null,
    "large": null
  }
}
```

### Get / Update Status

```text
GET /profile/status/1
Response body: "my status"
```

```json
PUT /profile/status
Headers: Authorization: Bearer <token>
{
  "status": "new status"
}

Response:
{
  "resultCode": 0,
  "messages": [],
  "data": {}
}
```

### Follow / Unfollow

```text
GET /follow/1
Headers: Authorization: Bearer <token>
Response body: true  // or false
```

```json
POST /follow/1
Headers: Authorization: Bearer <token>

Response:
{
  "resultCode": 0,
  "messages": [],
  "data": {}
}
```

```json
DELETE /follow/1
Headers: Authorization: Bearer <token>

Response:
{
  "resultCode": 0,
  "messages": [],
  "data": {}
}
```

### Security Captcha URL

```json
GET /security/get-captcha-url

Response:
{
  "url": "https://social-network.samuraijs.com/activecontent/images/captcha.jpg"
}
```

### Error Response
```json
{
  "resultCode": 1,
  "messages": ["Error message here"],
  "data": {}
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

## API Compatibility

This API follows the **Operation Result Object** format compatible with social network frontend applications. All responses use the standardized format:

- `resultCode: 0` - Success
- `resultCode: 1` - Error
- `messages: []` - Array of messages (empty on success)
- `data: {}` - Response payload

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

