#!/bin/bash

# API Testing Script
# Make sure the server is running: npm run dev

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "API Testing Script"
echo "=========================================="
echo ""

echo "1. Health Check"
echo "GET $BASE_URL/health"
curl -s "$BASE_URL/health" | jq '.' || echo "Response received"
echo ""
echo "------------------------------------------"
echo ""

echo "2. Register User"
echo "POST $BASE_URL/api/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }')
echo "$REGISTER_RESPONSE" | jq '.' || echo "$REGISTER_RESPONSE"
echo ""
echo "------------------------------------------"
echo ""

echo "3. Login"
echo "POST $BASE_URL/api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)
echo "$LOGIN_RESPONSE" | jq '.' || echo "$LOGIN_RESPONSE"
echo ""
echo "Token: $TOKEN"
echo ""
echo "------------------------------------------"
echo ""

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "ERROR: Could not get token. Please check if user was created successfully."
  exit 1
fi

echo "4. Get Current User"
echo "GET $BASE_URL/api/auth/me"
curl -s "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.' || echo "Response received"
echo ""
echo "------------------------------------------"
echo ""

echo "5. Create Post"
echo "POST $BASE_URL/api/posts"
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "My First Test Post",
    "content": "This is a test post created by the API testing script."
  }')
POST_ID=$(echo "$POST_RESPONSE" | jq -r '.post.id' 2>/dev/null)
echo "$POST_RESPONSE" | jq '.' || echo "$POST_RESPONSE"
echo ""
echo "Post ID: $POST_ID"
echo ""
echo "------------------------------------------"
echo ""

echo "6. Get All Posts"
echo "GET $BASE_URL/api/posts"
curl -s "$BASE_URL/api/posts" | jq '.' || echo "Response received"
echo ""
echo "------------------------------------------"
echo ""

if [ -n "$POST_ID" ] && [ "$POST_ID" != "null" ]; then
  echo "7. Get Post by ID"
  echo "GET $BASE_URL/api/posts/$POST_ID"
  curl -s "$BASE_URL/api/posts/$POST_ID" | jq '.' || echo "Response received"
  echo ""
  echo "------------------------------------------"
  echo ""

  echo "8. Update Post"
  echo "PUT $BASE_URL/api/posts/$POST_ID"
  curl -s -X PUT "$BASE_URL/api/posts/$POST_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "title": "Updated Test Post Title",
      "content": "This post has been updated by the API testing script."
    }' | jq '.' || echo "Response received"
  echo ""
  echo "------------------------------------------"
  echo ""

  echo "9. Delete Post"
  echo "DELETE $BASE_URL/api/posts/$POST_ID"
  curl -s -X DELETE "$BASE_URL/api/posts/$POST_ID" \
    -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n"
  echo ""
  echo "------------------------------------------"
  echo ""
fi

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="

