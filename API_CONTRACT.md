# Dayflow HRMS — Mock REST API Specification & Contract

This document specifies the RESTful endpoints, schemas, headers, status codes, and error models simulated by the Dayflow client store architecture.

---

## 1. Authentication & Identity Endpoints

### `POST /api/v1/auth/login`
Authenticates a user session using either their generated **Login ID** or **Work Email**.

#### Request Headers
```http
Content-Type: application/json
Accept: application/json
```

#### Request Body
```json
{
  "identifier": "DFSAJE20260001",
  "password": "password123",
  "rememberMe": true
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-admin-01",
    "loginId": "DFSAJE20260001",
    "name": "Sarah Jenkins",
    "email": "sarah.jenkins@dayflow.io",
    "role": "admin",
    "companyName": "Dayflow Technologies",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
    "employeeId": "emp-001"
  }
}
```

#### Error Response `401 Unauthorized`
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid Login ID or password combination provided."
}
```

---

### `POST /api/v1/auth/signup`
Provisions a new employee, generates their unique corporate Login ID, and creates an active session.

#### Request Body
```json
{
  "companyName": "Odoo India",
  "name": "John Doe",
  "email": "john.doe@company.com",
  "phone": "+91 98765 43210",
  "password": "password123",
  "role": "employee",
  "department": "Engineering",
  "jobTitle": "Lead Frontend Architect",
  "location": "Bengaluru, IND",
  "monthlyWage": 120000
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "loginId": "OIJODO20261001",
  "employeeId": "emp-1724302910000",
  "message": "Employee onboarded and credentials provisioned."
}
```

---

## 2. Employee Management Endpoints

### `GET /api/v1/employees`
Returns list of employees with support for search, division, and status filtering.

#### Query Parameters
- `q` (string, optional): Search query matching Name, Login ID, or Title.
- `department` (string, optional): Division filter.
- `status` (string, optional): `present` | `absent` | `on_leave`.

#### Response `200 OK`
```json
[
  {
    "id": "emp-001",
    "loginId": "DFSAJE20260001",
    "name": "Sarah Jenkins",
    "email": "sarah.jenkins@dayflow.io",
    "phone": "+1 (555) 234-8901",
    "avatar": "https://images.unsplash.com/...",
    "companyName": "Dayflow Technologies",
    "department": "Human Resources",
    "jobTitle": "VP of People & Culture",
    "manager": "Board of Directors",
    "location": "San Francisco, CA (HQ)",
    "status": "present",
    "role": "admin",
    "resume": {
      "jobDescription": "Directs all global HR operations...",
      "biography": "Over 14 years of senior HR leadership...",
      "skills": ["Executive Leadership", "Workforce Planning"],
      "certifications": ["SHRM-SCP"],
      "experienceYears": 14
    },
    "privateInfo": {
      "dob": "1986-04-12",
      "residingAddress": "742 Evergreen Terrace, San Francisco, CA 94107",
      "nationality": "American",
      "gender": "Female",
      "joiningDate": "2021-01-15",
      "bankDetails": {
        "accountNumber": "987654321098",
        "ifscCode": "HDFC0001234",
        "panNumber": "ABCDE1234F",
        "uanNumber": "100987654321",
        "bankName": "HDFC Bank Enterprise"
      }
    },
    "salaryStructure": {
      "wageType": "monthly",
      "monthlyWage": 185000,
      "yearlyWage": 2220000,
      "basic": 92500,
      "hra": 46250,
      "standardAllowance": 30839.5,
      "performanceBonus": 15410.5,
      "lta": 15410.5,
      "fixedAllowance": 0,
      "pfDeduction": 11100,
      "professionalTax": 200,
      "grossMonthly": 185000,
      "totalDeductions": 11300,
      "netMonthly": 173700
    }
  }
]
```

---

### `PATCH /api/v1/employees/:id`
Updates employee record with RBAC field restriction validation.

#### Request Headers
```http
Authorization: Bearer <TOKEN>
X-User-Role: employee | admin
```

#### Request Body (Employee Self-Service)
```json
{
  "phone": "+1 (555) 999-8888",
  "privateInfo": {
    "residingAddress": "1200 Market St, San Francisco, CA"
  }
}
```

#### Error Response `403 Forbidden` (If Employee updates restricted field)
```json
{
  "success": false,
  "error": "RBAC_RESTRICTION",
  "message": "Employees may only modify Phone, Residing Address, and Avatar."
}
```

---

## 3. Attendance Endpoints

### `POST /api/v1/attendance/punch`
Toggles real-time check-in / check-out status.

#### Request Body
```json
{
  "employeeId": "emp-002",
  "action": "check_in" | "check_out"
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "isCheckedIn": true,
  "timestamp": "2026-08-22T09:00:00.000Z",
  "record": {
    "id": "att-002",
    "employeeId": "emp-002",
    "date": "2026-08-22",
    "checkIn": "09:00 AM",
    "checkOut": null,
    "workHours": 0.1,
    "status": "present"
  }
}
```

---

## 4. Time Off Endpoints

### `POST /api/v1/timeoff/requests`
Submits a new time-off petition with calculated working days.

#### Request Body
```json
{
  "employeeId": "emp-002",
  "leaveType": "paid",
  "startDate": "2026-09-01",
  "endDate": "2026-09-05",
  "daysCount": 5,
  "reason": "Annual family vacation."
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "id": "req-1724303910000",
  "status": "pending",
  "appliedAt": "2026-08-22T10:00:00.000Z"
}
```

---

### `PATCH /api/v1/timeoff/requests/:id/decision` (Admin Only)
Approves or rejects a time-off petition.

#### Request Body
```json
{
  "decision": "approved" | "rejected",
  "reviewerName": "Sarah Jenkins",
  "comment": "Approved under annual leave allowance."
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "id": "req-003",
  "status": "approved",
  "reviewedBy": "Sarah Jenkins",
  "reviewedAt": "2026-08-22T10:15:00.000Z"
}
```
