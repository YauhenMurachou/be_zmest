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
    "password": "password123",
    "rememberMe": false
  }')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.userId' 2>/dev/null)
RESULT_CODE=$(echo "$LOGIN_RESPONSE" | jq -r '.resultCode' 2>/dev/null)
echo "$LOGIN_RESPONSE" | jq '.' || echo "$LOGIN_RESPONSE"
echo ""
echo "User ID: $USER_ID"
echo "Result Code: $RESULT_CODE"
echo ""
echo "------------------------------------------"
echo ""

if [ "$RESULT_CODE" != "0" ]; then
  echo "ERROR: Login failed. Please check if user was created successfully."
  exit 1
fi

echo "Note: For authenticated requests, you need to obtain the JWT token."
echo "The token should be stored after successful login."
echo "For this test script, you may need to manually set TOKEN variable."
TOKEN="YOUR_TOKEN_HERE"

if [ "$TOKEN" != "YOUR_TOKEN_HERE" ]; then
  echo "4. Get Current User"
  echo "GET $BASE_URL/api/auth/me"
  curl -s "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN" | jq '.' || echo "Response received"
  echo ""
  echo "------------------------------------------"
  echo ""

  echo "5. Logout"
  echo "POST $BASE_URL/api/auth/logout"
  curl -s -X POST "$BASE_URL/api/auth/logout" \
    -H "Authorization: Bearer $TOKEN" | jq '.' || echo "Response received"
  echo ""
  echo "------------------------------------------"
  echo ""

  echo "6. Create Post"
  echo "POST $BASE_URL/api/posts"
  POST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "title": "My First Test Post",
      "content": "This is a test post created by the API testing script."
    }')
  POST_ID=$(echo "$POST_RESPONSE" | jq -r '.data.post.id' 2>/dev/null)
  echo "$POST_RESPONSE" | jq '.' || echo "$POST_RESPONSE"
  echo ""
  echo "Post ID: $POST_ID"
  echo ""
  echo "------------------------------------------"
  echo ""

  echo "7. Get All Posts"
  echo "GET $BASE_URL/api/posts"
  curl -s "$BASE_URL/api/posts" | jq '.' || echo "Response received"
  echo ""
  echo "------------------------------------------"
  echo ""

  if [ -n "$POST_ID" ] && [ "$POST_ID" != "null" ]; then
    echo "8. Get Post by ID"
    echo "GET $BASE_URL/api/posts/$POST_ID"
    curl -s "$BASE_URL/api/posts/$POST_ID" | jq '.' || echo "Response received"
    echo ""
    echo "------------------------------------------"
    echo ""

    echo "9. Update Post"
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

    echo "10. Delete Post"
    echo "DELETE $BASE_URL/api/posts/$POST_ID"
    curl -s -X DELETE "$BASE_URL/api/posts/$POST_ID" \
      -H "Authorization: Bearer $TOKEN" | jq '.' || echo "Response received"
    echo ""
    echo "------------------------------------------"
    echo ""
  fi
else
  echo "Skipping authenticated endpoints (token not set)"
  echo ""
  echo "7. Get All Posts (public)"
  echo "GET $BASE_URL/api/posts"
  curl -s "$BASE_URL/api/posts" | jq '.' || echo "Response received"
  echo ""
  echo "------------------------------------------"
  echo ""
fi

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="

