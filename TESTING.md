# Testing Guide

This guide explains how to set up the database, run the application, and test the API endpoints.

## Database Setup

### Option 1: Using PostgreSQL locally

1. **Install PostgreSQL** (if not already installed):
   - macOS: `brew install postgresql@14` or download from [postgresql.org](https://www.postgresql.org/download/)
   - Linux: `sudo apt-get install postgresql` (Ubuntu/Debian)
   - Windows: Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Start PostgreSQL service**:
   ```bash
   # macOS (with Homebrew)
   brew services start postgresql@14
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows: Start from Services or use pgAdmin
   ```

3. **Create a database**:
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE social_network;
   
   # Create user (optional, or use default 'postgres' user)
   CREATE USER your_username WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE social_network TO your_username;
   
   # Exit psql
   \q
   ```

4. **Update `.env` file** with your database credentials:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/social_network
   ```

### Option 2: Using Docker

1. **Run PostgreSQL in Docker**:
   ```bash
   docker run --name postgres-social-network \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=social_network \
     -p 5432:5432 \
     -d postgres:14
   ```

2. **Update `.env` file**:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/social_network
   ```

### Option 3: Using a cloud database (e.g., Supabase, Railway, Neon)

1. Create a database on your preferred platform
2. Get the connection string
3. Update `.env` file with the connection string

## Running the Application

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run database migrations**:
   ```bash
   npm run migrate
   ```
   This will create the `users` and `posts` tables.

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Testing the API

### Using cURL

#### 1. Health Check
```bash
curl http://localhost:3000/health
```

#### 2. Register a User (internal API)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "password123"
  }'
```

#### 3. Login (internal API)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "rememberMe": false
  }'
```

Response:
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "userId": 1,
    "token": "jwt-token-here"
  }
}
```

**Note:** The JWT token is available as:
- `data.token` in the JSON body
- `Authorization` response header with value `Bearer <token>`

#### 4. Logout (internal API)
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {}
}
```

#### 5. Get Current User
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "id": 1,
    "email": "john@example.com",
    "login": "johndoe"
  }
}
```

#### 6. Create a Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post!"
  }'
```

Response:
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "post": {
      "id": 1,
      "title": "My First Post",
      "content": "This is the content of my first post!",
      "authorId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com"
      }
    }
  }
}
```

#### 7. Get All Posts
```bash
curl http://localhost:3000/api/posts
```

Response:
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "posts": [...],
    "limit": 50,
    "offset": 0
  }
}
```

With pagination:
```bash
curl "http://localhost:3000/api/posts?limit=10&offset=0"
```

#### 8. Get Post by ID
```bash
curl http://localhost:3000/api/posts/1
```

Response:
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "post": { ... }
  }
}
```

#### 9. Get Posts by Author
```bash
curl http://localhost:3000/api/posts/author/1
```

#### 10. Update a Post
```bash
curl -X PUT http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

Response:
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "post": { ... }
  }
}
```

#### 11. Delete a Post
```bash
curl -X DELETE http://localhost:3000/api/posts/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {}
}
```

#### 12. Login (Samurai-compatible)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "rememberMe": false
  }'
```

Response:
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "userId": 1,
    "token": "jwt-token-here"
  }
}
```

#### 13. Get Users (Samurai-compatible)

```bash
curl "http://localhost:3000/users?page=1&count=10&term="
```

Example response:
```json
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

#### 14. Get Profile

```bash
curl http://localhost:3000/profile/1
```

#### 15. Get Status

```bash
curl http://localhost:3000/profile/status/1
```

Response body is plain text status.

#### 16. Update Status

```bash
curl -X PUT http://localhost:3000/profile/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "new status from curl"
  }'
```

#### 17. Update Profile

```bash
curl -X PUT http://localhost:3000/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "aboutMe": "I am a developer",
    "contacts": {
      "facebook": "facebook.com/me",
      "github": "github.com/me",
      "instagram": null,
      "mainLink": null,
      "twitter": null,
      "vk": null,
      "website": null,
      "youtube": null
    },
    "lookingForAJob": true,
    "lookingForAJobDescription": "Looking for React/TS job",
    "fullName": "John Doe"
  }'
```

#### 18. Check Follow

```bash
curl http://localhost:3000/follow/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response: `true` or `false`.

#### 19. Follow User

```bash
curl -X POST http://localhost:3000/follow/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 20. Unfollow User

```bash
curl -X DELETE http://localhost:3000/follow/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 21. Get Captcha URL

```bash
curl http://localhost:3000/security/get-captcha-url
```

Response:
```json
{
  "url": "https://social-network.samuraijs.com/activecontent/images/captcha.jpg"
}
```

### Using Postman

1. **Import the collection** (create manually):
   - Base URL: `http://localhost:3000`
   - Create requests for each endpoint
   - Set up environment variables:
     - `base_url`: `http://localhost:3000`
     - `token`: (set after login)

2. **Workflow**:
   - Register/Login → Save token
   - Use token in Authorization header: `Bearer {{token}}`
   - Test all endpoints

### Using HTTPie

```bash
# Install HTTPie: brew install httpie (macOS) or pip install httpie

# Register
http POST localhost:3000/api/auth/register \
  email=john@example.com \
  username=johndoe \
  password=password123

# Login
http POST localhost:3000/api/auth/login \
  email=john@example.com \
  password=password123

# Create post (save token from login)
http POST localhost:3000/api/posts \
  Authorization:"Bearer YOUR_TOKEN" \
  title="My Post" \
  content="Post content"

# Get posts
http GET localhost:3000/api/posts
```

### Using a Test Script

Create a file `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "1. Health Check"
curl -s "$BASE_URL/health" | jq

echo -e "\n2. Register User"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}')
echo "$REGISTER_RESPONSE" | jq

echo -e "\n3. Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "$LOGIN_RESPONSE" | jq

echo -e "\n4. Get Current User"
curl -s "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n5. Create Post"
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Post","content":"This is a test post"}')
POST_ID=$(echo "$POST_RESPONSE" | jq -r '.post.id')
echo "$POST_RESPONSE" | jq

echo -e "\n6. Get All Posts"
curl -s "$BASE_URL/api/posts" | jq

echo -e "\n7. Get Post by ID"
curl -s "$BASE_URL/api/posts/$POST_ID" | jq

echo -e "\n8. Update Post"
curl -s -X PUT "$BASE_URL/api/posts/$POST_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Updated Post"}' | jq

echo -e "\n9. Delete Post"
curl -s -X DELETE "$BASE_URL/api/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN"
echo "Post deleted"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Expected Responses

All responses follow the **Operation Result Object** format:

### Success Responses (resultCode: 0)

**Register:**
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "username": "johndoe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Login (internal API):**
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "userId": 1,
    "token": "jwt-token-here"
  }
}
```

**Get Current User:**
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "id": 1,
    "email": "john@example.com",
    "login": "johndoe"
  }
}
```

**Post:**
```json
{
  "resultCode": 0,
  "messages": [],
  "data": {
    "post": {
      "id": 1,
      "title": "My Post",
      "content": "Post content",
      "authorId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com"
      }
    }
  }
}
```

### Error Responses (resultCode: 1)

**Validation Error:**
```json
{
  "resultCode": 1,
  "messages": [
    "Invalid email format",
    "Password must be at least 6 characters"
  ],
  "data": {}
}
```

**Unauthorized:**
```json
{
  "resultCode": 1,
  "messages": ["Authentication token required"],
  "data": {}
}
```

**Not Found:**
```json
{
  "resultCode": 1,
  "messages": ["Post not found"],
  "data": {}
}
```

## Troubleshooting

### Database Connection Issues

1. **Check if PostgreSQL is running**:
   ```bash
   # macOS/Linux
   pg_isready
   
   # Or check process
   ps aux | grep postgres
   ```

2. **Test connection manually**:
   ```bash
   psql -h localhost -U your_username -d social_network
   ```

3. **Check DATABASE_URL format**:
   - Format: `postgresql://username:password@host:port/database`
   - No spaces, proper encoding for special characters

### Server Issues

1. **Port already in use**:
   - Change `PORT` in `.env`
   - Or kill the process: `lsof -ti:3000 | xargs kill`

2. **Module not found**:
   - Run `npm install`

3. **TypeScript errors**:
   - Run `npm run build` to check for compilation errors

### Migration Issues

1. **Tables already exist**:
   - The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times

2. **Permission errors**:
   - Ensure the database user has proper permissions
   - Check PostgreSQL logs

