# REST API Documentation

The Smart Leads Dashboard features a robust, RESTful backend API built with Express and TypeScript. It utilizes **Zod** for strict runtime validation and **JWT** for secure authentication.

## Base URL
Local Development: `http://localhost:5000/api/v1`
Docker: `http://localhost:5000/api/v1` (or proxied via frontend at `http://localhost:3000/api/v1`)

---

## 🔒 Authentication & RBAC

All protected routes require a valid JWT Bearer token in the `Authorization` header.

```http
Authorization: Bearer <your_jwt_token>
```

### Roles
The system enforces a strict Zero-Trust Role-Based Access Control (RBAC) architecture.
- **`admin`**: Full access to all endpoints, including Lead creation, editing, deletion, and CSV exporting.
- **`sales_user`**: Read-only access to leads and dashboard analytics. Can update specific fields (Notes, Status) but cannot delete leads or export data.

---

## 1. Authentication Endpoints

### `POST /auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "SecurePassword123",
  "role": "admin" // Optional: defaults to 'sales_user'
}
```

### `POST /auth/login`
Authenticate and receive a JWT.

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "_id": "60d5ecb8b392d...",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### `GET /auth/me`
Hydrate the current user session using the JWT.

---

## 2. Dashboard Analytics

### `GET /leads/stats`
*(Protected: `admin`, `sales_user`)*
Returns highly-optimized, parallel-aggregated statistics for the dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1284,
    "byStatus": {
      "new": 412,
      "contacted": 284,
      "qualified": 196,
      "converted": 94,
      "lost": 298
    },
    "bySource": {
      "website": 431,
      "referral": 287,
      "social": 193
    }
  }
}
```

---

## 3. Leads CRUD

### `GET /leads`
*(Protected: `admin`, `sales_user`)*
Retrieve a paginated, sorted, and filtered list of leads.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `sort` (string: `latest`, `oldest`, `alphabetical`)
- `search` (string: fuzzy matches name/email)
- `status` (string: exact enum match)
- `source` (string: exact enum match)

**Request Example:**
`GET /leads?page=1&limit=20&status=new&search=John`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb8b...",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "status": "new",
      "source": "website",
      "createdAt": "2024-05-18T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### `POST /leads`
*(Protected: `admin` only)*
Create a new lead in the pipeline.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+15550000000",
  "company": "Stripe",
  "status": "contacted",
  "source": "referral",
  "notes": "Introduced by John Doe."
}
```

### `PATCH /leads/:id`
*(Protected: `admin`, `sales_user`)*
Update an existing lead. Note: Backend service logic enforces that non-admins cannot mutate core identity fields (name, email), only relational fields (status, notes).

### `DELETE /leads/:id`
*(Protected: `admin` only)*
Permanently delete a lead.

---

## 4. Export

### `GET /leads/export`
*(Protected: `admin` only)*
Streams a fully escaped, formatting-safe CSV file containing all leads matching the current query filters (bypassing pagination limits).

**Query Parameters:**
Accepts the exact same parameters as `GET /leads` (e.g., `?status=new&search=Tech`).

**Response Header:**
`Content-Type: text/csv`
`Content-Disposition: attachment; filename="leads_export_2024-05-18.csv"`
