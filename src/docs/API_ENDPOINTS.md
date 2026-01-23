# MindCareX API Endpoints Reference

This document lists all API endpoints that the frontend expects from the Spring Boot backend.

## Base URL
```
VITE_API_BASE_URL=http://localhost:8080
```

## Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |

### Request/Response Examples

**POST /api/auth/register**
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "role": "PATIENT" // or "DOCTOR"
}

// Response
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "PATIENT"
}
```

**POST /api/auth/login**
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "jwt-token-here",
  "role": "PATIENT",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PATIENT"
  }
}
```

---

## Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/doctors` | Get list of all doctors | Yes |
| GET | `/api/users/me` | Get current user profile | Yes |

---

## Appointments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/appointments` | Create new appointment | Yes (PATIENT) |
| GET | `/api/appointments/my` | Get patient's appointments | Yes (PATIENT) |
| GET | `/api/doctor/appointments` | Get doctor's appointments | Yes (DOCTOR) |

### Request/Response Examples

**POST /api/appointments**
```json
// Request
{
  "doctorId": "doctor-uuid",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z"
}

// Response
{
  "id": "appointment-uuid",
  "doctorId": "doctor-uuid",
  "patientId": "patient-uuid",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "status": "BOOKED"
}
```

---

## Sessions (Video/Chat)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/sessions` | Create new session | Yes |
| GET | `/api/sessions/{id}` | Get session by ID | Yes |
| GET | `/api/sessions/my` | Get user's sessions | Yes |
| GET | `/api/doctor/sessions` | Get doctor's sessions | Yes (DOCTOR) |
| PUT | `/api/sessions/{id}` | Update session | Yes |
| POST | `/api/sessions/{id}/start` | Start session | Yes |
| POST | `/api/sessions/{id}/end` | End session | Yes |

### Request/Response Examples

**POST /api/sessions**
```json
// Request
{
  "doctorId": "doctor-uuid",
  "patientId": "patient-uuid",
  "scheduledTime": "2024-01-15T10:00:00Z"
}

// Response
{
  "id": "session-uuid",
  "doctor_id": "doctor-uuid",
  "patient_id": "patient-uuid",
  "start_time": null,
  "end_time": null,
  "status": "scheduled"
}
```

**GET /api/sessions/{id}**
```json
// Response
{
  "id": "session-uuid",
  "doctor_id": "doctor-uuid",
  "patient_id": "patient-uuid",
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": null,
  "status": "in-progress",
  "notes": "Session notes here"
}
```

---

## Session Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sessions/{id}/messages` | Get session messages | Yes |
| POST | `/api/sessions/{id}/messages` | Send message | Yes |

### Request/Response Examples

**POST /api/sessions/{id}/messages**
```json
// Request
{
  "content": "Hello, how are you feeling today?"
}

// Response
{
  "id": "message-uuid",
  "session_id": "session-uuid",
  "sender_id": "user-uuid",
  "content": "Hello, how are you feeling today?",
  "created_at": "2024-01-15T10:05:00Z",
  "senderRole": "DOCTOR"
}
```

---

## Emotion Analysis (Flask Backend)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sessions/{id}/emotions` | Get emotion metrics | Yes |
| POST | `/api/sessions/{id}/emotions/frame` | Submit frame for analysis | Yes |

### Request/Response Examples

**POST /api/sessions/{id}/emotions/frame**
```json
// Request
{
  "userId": "user-uuid",
  "imageBase64": "base64-encoded-image",
  "timestamp": "2024-01-15T10:05:00Z"
}

// Response
{
  "emotion": "happy",
  "confidence": 0.85,
  "rollingAverage": {
    "happy": 0.6,
    "neutral": 0.3,
    "sad": 0.1
  }
}
```

---

## Chat Analysis

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sessions/{id}/analysis` | Get chat analysis | Yes |

---

## Session Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sessions/{id}/summary` | Get session summary | Yes |
| POST | `/api/sessions/{id}/summary/generate` | Generate AI summary | Yes |

---

## WebSocket/Socket.IO Events

The frontend expects Socket.IO connection for real-time features:

### Connection
- **URL**: `ws://localhost:8080/socket.io`

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | Client→Server | Join a session room |
| `leave_room` | Client→Server | Leave a session room |
| `chat_message` | Bidirectional | Send/receive chat message |
| `chat_typing` | Bidirectional | Typing indicator |
| `webrtc_offer` | Bidirectional | WebRTC signaling |
| `webrtc_answer` | Bidirectional | WebRTC signaling |
| `webrtc_ice_candidate` | Bidirectional | WebRTC ICE candidate |
| `emotion_update` | Server→Client | Real-time emotion update |
| `risk_alert` | Server→Client | Risk alert notification |

---

## HTTP Headers

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Error Responses

Standard error format:
```json
{
  "error": "Error message",
  "status": 401,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized (token expired/invalid) |
| 403 | Forbidden (role mismatch) |
| 404 | Not Found |
| 500 | Internal Server Error |
