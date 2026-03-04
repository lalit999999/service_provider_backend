# Local Service Provider - Backend API Testing Guide

## Base URL

```
http://localhost:3000/api
```

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Categories](#categories)
3. [Services](#services)
4. [Bookings](#bookings)
5. [Reviews](#reviews)
6. [Testing Workflow](#testing-workflow)

---

## 🔐 Authentication

### 1. Register User

**POST** `/auth/register`

**Public** ✅ (No token required)

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "pass123",
  "role": "customer",
  "city": "Patna",
  "area": "Boring Road"
}
```

**Role options:** `customer`, `provider`, `admin`

**Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "pass123",
    "role": "customer",
    "city": "Patna",
    "area": "Boring Road"
  }'
```

---

### 2. Login

**POST** `/auth/login`

**Public** ✅ (No token required)

**Body:**

```json
{
  "email": "john@example.com",
  "password": "pass123"
}
```

**Response (200):**

```json
{
  "message": "Logged in successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "pass123"
  }'
```

---

### 3. Logout

**POST** `/auth/logout`

**Protected** 🔒 (All authenticated users)

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

**cURL:**

```bash
TOKEN="your_jwt_token"
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📂 Categories

### 1. Create Category

**POST** `/categories`

**Protected** 🔒 **Admin Only**

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Plumbing",
  "description": "All plumbing services including repairs, installations, and maintenance"
}
```

**Response (201):**

```json
{
  "message": "Category created successfully",
  "category": {
    "_id": "category_id",
    "name": "Plumbing",
    "description": "All plumbing services...",
    "createdAt": "2026-03-04T10:00:00Z",
    "updatedAt": "2026-03-04T10:00:00Z"
  }
}
```

**cURL:**

```bash
ADMIN_TOKEN="admin_jwt_token"
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plumbing",
    "description": "All plumbing services including repairs, installations, and maintenance"
  }'
```

---

### 2. Get All Categories

**GET** `/categories`

**Public** ✅ (No token required)

**Response (200):**

```json
{
  "message": "Categories retrieved successfully",
  "count": 5,
  "categories": [
    {
      "_id": "cat_id",
      "name": "Plumbing",
      "description": "...",
      "createdAt": "2026-03-04T10:00:00Z",
      "updatedAt": "2026-03-04T10:00:00Z"
    }
  ]
}
```

**cURL:**

```bash
curl -X GET http://localhost:3000/api/categories
```

---

### 3. Get Single Category

**GET** `/categories/:id`

**Public** ✅ (No token required)

**Response (200):**

```json
{
  "message": "Category retrieved successfully",
  "category": {
    "_id": "cat_id",
    "name": "Plumbing",
    "description": "..."
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:3000/api/categories/CATEGORY_ID
```

---

### 4. Update Category

**PUT** `/categories/:id`

**Protected** 🔒 **Admin Only**

**Body:**

```json
{
  "name": "Advanced Plumbing",
  "description": "Professional plumbing services"
}
```

**cURL:**

```bash
ADMIN_TOKEN="admin_jwt_token"
curl -X PUT http://localhost:3000/api/categories/CATEGORY_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Plumbing",
    "description": "Professional plumbing services"
  }'
```

---

### 5. Delete Category

**DELETE** `/categories/:id`

**Protected** 🔒 **Admin Only**

**cURL:**

```bash
ADMIN_TOKEN="admin_jwt_token"
curl -X DELETE http://localhost:3000/api/categories/CATEGORY_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🔧 Services

### 1. Create Service

**POST** `/services`

**Protected** 🔒 **Provider Only**

**Headers:**

```
Authorization: Bearer <provider_token>
Content-Type: application/json
```

**Body:**

```json
{
  "categoryId": "category_id",
  "title": "Professional Plumbing",
  "description": "Expert plumbing repairs and installations",
  "basePrice": 500
}
```

**Response (201):**

```json
{
  "message": "Service created successfully",
  "service": {
    "_id": "service_id",
    "providerId": {
      "_id": "provider_id",
      "name": "Provider Name",
      "email": "provider@example.com",
      "city": "Patna",
      "area": "Boring Road"
    },
    "categoryId": {
      "_id": "category_id",
      "name": "Plumbing"
    },
    "title": "Professional Plumbing",
    "description": "Expert plumbing repairs...",
    "basePrice": 500
  }
}
```

**cURL:**

```bash
PROVIDER_TOKEN="provider_jwt_token"
CATEGORY_ID="category_id"

curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "'$CATEGORY_ID'",
    "title": "Professional Plumbing",
    "description": "Expert plumbing repairs and installations",
    "basePrice": 500
  }'
```

---

### 2. Get All Services

**GET** `/services`

**Public** ✅ (No token required)

**Query Parameters:**

- `category` - Filter by category name (optional)
- `city` - Filter by provider city (optional)

**Examples:**

```
GET /services
GET /services?category=plumbing
GET /services?city=Patna
GET /services?category=plumbing&city=Patna
```

**Response (200):**

```json
{
  "message": "Services retrieved successfully",
  "count": 3,
  "services": [
    {
      "_id": "service_id",
      "providerId": {
        "name": "Provider",
        "city": "Patna",
        "area": "Boring Road"
      },
      "categoryId": {
        "name": "Plumbing"
      },
      "title": "Professional Plumbing",
      "basePrice": 500
    }
  ]
}
```

**cURL:**

```bash
# Get all services
curl -X GET http://localhost:3000/api/services

# Filter by category
curl -X GET "http://localhost:3000/api/services?category=plumbing"

# Filter by city
curl -X GET "http://localhost:3000/api/services?city=Patna"

# Filter by both
curl -X GET "http://localhost:3000/api/services?category=plumbing&city=Patna"
```

---

### 3. Get Single Service

**GET** `/services/:id`

**Public** ✅ (No token required)

**cURL:**

```bash
curl -X GET http://localhost:3000/api/services/SERVICE_ID
```

---

### 4. Update Service

**PUT** `/services/:id`

**Protected** 🔒 **Provider Only** (Own services only)

**Body:**

```json
{
  "title": "Premium Plumbing Services",
  "description": "High-quality solutions",
  "basePrice": 600
}
```

**cURL:**

```bash
PROVIDER_TOKEN="provider_jwt_token"
curl -X PUT http://localhost:3000/api/services/SERVICE_ID \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Plumbing",
    "description": "High-quality solutions",
    "basePrice": 600
  }'
```

---

### 5. Delete Service

**DELETE** `/services/:id`

**Protected** 🔒 **Provider Only** (Own services only)

**cURL:**

```bash
PROVIDER_TOKEN="provider_jwt_token"
curl -X DELETE http://localhost:3000/api/services/SERVICE_ID \
  -H "Authorization: Bearer $PROVIDER_TOKEN"
```

---

## 📕 Bookings

### 1. Create Booking

**POST** `/bookings`

**Protected** 🔒 **Customer Only**

**Requirements:**

- ✅ Booking is not your own service
- ✅ Provider must be approved (`isApproved = true`)
- ✅ Provider must be available (`isAvailable = true`)

**Body:**

```json
{
  "serviceId": "service_id",
  "address": "123 Main Street, Patna",
  "dateTime": "2026-03-15T10:00:00Z",
  "notes": "Please call before arrival"
}
```

**Response (201):**

```json
{
  "message": "Booking created successfully",
  "booking": {
    "_id": "booking_id",
    "customerId": {
      "name": "Customer Name",
      "email": "customer@example.com"
    },
    "providerId": {
      "name": "Provider Name",
      "isApproved": true,
      "isAvailable": true
    },
    "serviceId": {
      "title": "Professional Plumbing",
      "basePrice": 500
    },
    "status": "Requested",
    "priceAtBooking": 500,
    "address": "123 Main Street, Patna",
    "dateTime": "2026-03-15T10:00:00Z"
  }
}
```

**cURL:**

```bash
CUSTOMER_TOKEN="customer_jwt_token"
SERVICE_ID="service_id"

curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "'$SERVICE_ID'",
    "address": "123 Main Street, Patna",
    "dateTime": "2026-03-15T10:00:00Z",
    "notes": "Please call before arrival"
  }'
```

---

### 2. Get My Bookings

**GET** `/bookings`

**Protected** 🔒 (Customer sees own, Provider sees their service bookings)

**Response (200):**

```json
{
  "message": "Bookings retrieved successfully",
  "count": 2,
  "bookings": [...]
}
```

**cURL:**

```bash
TOKEN="jwt_token"
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Get Single Booking

**GET** `/bookings/:id`

**Protected** 🔒 (Only customer or provider of that booking)

**cURL:**

```bash
TOKEN="jwt_token"
curl -X GET http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Accept Booking

**PATCH** `/bookings/:id/accept`

**Protected** 🔒 **Provider Only**

**Status Change:** `Requested` → `Confirmed`

**cURL:**

```bash
PROVIDER_TOKEN="provider_jwt_token"
curl -X PATCH http://localhost:3000/api/bookings/BOOKING_ID/accept \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 5. Update Booking Status

**PATCH** `/bookings/:id/status`

**Protected** 🔒 **Provider Only**

**Valid Transitions:**

- `Requested` → `Confirmed` ✅
- `Confirmed` → `In-progress` ✅
- `In-progress` → `Completed` ✅

**Body:**

```json
{
  "status": "In-progress"
}
```

**cURL:**

```bash
PROVIDER_TOKEN="provider_jwt_token"
curl -X PATCH http://localhost:3000/api/bookings/BOOKING_ID/status \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "In-progress"}'
```

---

### 6. Cancel Booking

**PATCH** `/bookings/:id/cancel`

**Protected** 🔒 (Customer or Provider)

**Customer Restrictions:**

- ✅ Can cancel if status = `Requested`
- ✅ Can cancel if status = `Confirmed`
- ❌ Cannot cancel if status = `In-progress` or `Completed`

**cURL:**

```bash
TOKEN="jwt_token"
curl -X PATCH http://localhost:3000/api/bookings/BOOKING_ID/cancel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## ⭐ Reviews

API_TESTING_GUIDE

### 1. Create Review

**POST** `/reviews`

**Protected** 🔒 **Customer Only**

**Requirements:**

- ✅ Booking status must be `Completed`
- ✅ Customer must own that booking
- ✅ Only one review per booking

**Body:**

```json
{
  "bookingId": "booking_id",
  "rating": 5,
  "comment": "Excellent service! Provider was very professional and on time."
}
```

**Constraints:**

- `rating`: 1-5
- `comment`: 10-500 characters

**Response (201):**

```json
{
  "message": "Review created successfully",
  "review": {
    "_id": "review_id",
    "bookingId": "booking_id",
    "rating": 5,
    "comment": "Excellent service...",
    "providerId": {
      "name": "Provider Name",
      "email": "provider@example.com"
    },
    "customerId": {
      "name": "Customer Name"
    },
    "createdAt": "2026-03-04T10:00:00Z"
  }
}
```

**cURL:**

```bash
CUSTOMER_TOKEN="customer_jwt_token"
BOOKING_ID="booking_id"

curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "'$BOOKING_ID'",
    "rating": 5,
    "comment": "Excellent service! Provider was very professional and on time."
  }'
```

---

### 2. Get Provider Reviews

**GET** `/reviews/provider/:providerId`

**Public** ✅ (No token required)

**Includes:**

- Average rating (aggregated)
- Total reviews count
- Min/Max ratings
- Review list sorted by newest first

**Response (200):**

```json
{
  "message": "Reviews retrieved successfully",
  "count": 5,
  "averageRating": 4.6,
  "minRating": 4,
  "maxRating": 5,
  "totalReviews": 5,
  "reviews": [
    {
      "_id": "review_id",
      "rating": 5,
      "comment": "Excellent service...",
      "customer": {
        "name": "Customer Name",
        "city": "Patna"
      }
    }
  ]
}
```

**cURL:**

```bash
curl -X GET http://localhost:3000/api/reviews/provider/PROVIDER_ID
```

---

### 3. Get Booking Review

**GET** `/reviews/booking/:bookingId`

**Public** ✅ (No token required)

**cURL:**

```bash
curl -X GET http://localhost:3000/api/reviews/booking/BOOKING_ID
```

---

### 4. Update Review

**PUT** `/reviews/:id`

**Protected** 🔒 **Customer Only** (Review author only)

**Body:**

```json
{
  "rating": 4,
  "comment": "Good service with minor delays."
}
```

**cURL:**

```bash
CUSTOMER_TOKEN="customer_jwt_token"
curl -X PUT http://localhost:3000/api/reviews/REVIEW_ID \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Good service with minor delays."
  }'
```

---

### 5. Delete Review

**DELETE** `/reviews/:id`

**Protected** 🔒 **Customer Only** (Review author only)

**cURL:**

```bash
CUSTOMER_TOKEN="customer_jwt_token"
curl -X DELETE http://localhost:3000/api/reviews/REVIEW_ID \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

---

## 🧪 Testing Workflow

### Step 1: Register Users

```bash
# Register as customer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Customer",
    "email": "alice@example.com",
    "password": "pass123",
    "role": "customer",
    "city": "Patna",
    "area": "Boring Road"
  }'

# Register as provider
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Provider",
    "email": "bob@example.com",
    "password": "pass123",
    "role": "provider",
    "city": "Patna",
    "area": "Patliputra"
  }'

# Register as admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "pass123",
    "role": "admin",
    "city": "Patna",
    "area": "Kankarbagh"
  }'
```

### Step 2: Login & Get Tokens

```bash
# Customer login
CUSTOMER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"pass123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Provider login
PROVIDER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"pass123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Admin login
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pass123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Customer: $CUSTOMER_TOKEN"
echo "Provider: $PROVIDER_TOKEN"
echo "Admin: $ADMIN_TOKEN"
```

### Step 3: Create Categories (Admin)

```bash
CATEGORY_ID=$(curl -s -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plumbing",
    "description": "All plumbing services"
  }' | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

echo "Category ID: $CATEGORY_ID"
```

### Step 4: Create Service (Provider)

```bash
SERVICE_ID=$(curl -s -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "'$CATEGORY_ID'",
    "title": "Professional Plumbing",
    "description": "Expert plumbing repairs",
    "basePrice": 500
  }' | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "Service ID: $SERVICE_ID"
```

### Step 5: Create Booking (Customer)

```bash
BOOKING_ID=$(curl -s -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "'$SERVICE_ID'",
    "address": "123 Main Street, Patna",
    "dateTime": "2026-03-15T10:00:00Z",
    "notes": "Please call before arrival"
  }' | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "Booking ID: $BOOKING_ID"
```

### Step 6: Accept & Complete Booking (Provider)

```bash
# Accept booking
curl -X PATCH http://localhost:3000/api/bookings/$BOOKING_ID/accept \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json"

# Update to In-progress
curl -X PATCH http://localhost:3000/api/bookings/$BOOKING_ID/status \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "In-progress"}'

# Mark as Completed
curl -X PATCH http://localhost:3000/api/bookings/$BOOKING_ID/status \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

### Step 7: Create Review (Customer)

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "'$BOOKING_ID'",
    "rating": 5,
    "comment": "Excellent service! Very professional and punctual."
  }'
```

### Step 8: View Provider Reviews

```bash
curl -X GET http://localhost:3000/api/reviews/provider/PROVIDER_ID
```

---

## ⚠️ Error Scenarios

### 1. Unauthorized Access

```bash
# No token
curl -X POST http://localhost:3000/api/services
# Response: 401 Unauthorized

# Invalid token
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer invalid_token"
# Response: 401 Invalid or expired token
```

### 2. Forbidden Access

```bash
# Customer trying to create service (provider only)
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Response: 403 Access denied. Only provider can access this
```

### 3. Validation Errors

```bash
# Missing required fields
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
# Response: 400 Please provide bookingId, rating, and comment
```

### 4. Business Logic Violations

```bash
# Booking not completed
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Response: 400 Booking must be Completed to review
```

---

## 📌 Status Codes Reference

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success (GET, PUT)                   |
| 201  | Created (POST)                       |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (no/invalid token)      |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 500  | Server Error                         |

---

## 🔑 Token Storage Tips

Save tokens in environment variables for easier testing:

```bash
# In ~/.bashrc or ~/.zshrc
export CUSTOMER_TOKEN="your_token_here"
export PROVIDER_TOKEN="your_token_here"
export ADMIN_TOKEN="your_token_here"

# Then use in curl
curl -H "Authorization: Bearer $CUSTOMER_TOKEN" ...
```

Or use Postman/Insomnia with environment variables.

---

**Version:** 1.0  
**Last Updated:** 2026-03-04
