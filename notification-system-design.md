# Notification System Design
# Stage 1

## Core Actions

1. Create Notification
2. Get Notifications
3. Get Notification by ID
4. Mark Notification as Read
5. Mark All Notifications as Read
6. Delete Notification

## API Design

### Create Notification

POST /api/notifications

Headers:
Content-Type: application/json

Request:
{
  "type": "Placement",
  "message": "Microsoft is hiring",
  "recipientId": "123"
}

Response:
{
  "id": "uuid",
  "message": "Notification created"
}

### Get Notifications

GET /api/notifications?userId=123

Response:
{
  "notifications": [...]
}

### Get Notification By ID

GET /api/notifications/{id}

### Mark As Read

PATCH /api/notifications/{id}/read

### Mark All As Read

PATCH /api/notifications/read-all

### Delete Notification

DELETE /api/notifications/{id}

## Real-Time Notifications

Use WebSockets (Socket.IO)

Flow:
Server → Notification Service → WebSocket → Frontend Client

Benefits:
- Real-time delivery
- Low latency
- Bidirectional communication