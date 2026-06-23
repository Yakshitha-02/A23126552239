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
# Stage 2

## Database Choice

I would use PostgreSQL as the primary database because:

* ACID compliance ensures reliable notification delivery.
* Supports indexing and efficient querying.
* Scales well for medium to large workloads.
* Supports JSON fields for future extensibility.

## Database Schema

### students

| Column     | Type         |
| ---------- | ------------ |
| id         | UUID (PK)    |
| name       | VARCHAR(100) |
| email      | VARCHAR(255) |
| created_at | TIMESTAMP    |

### notifications

| Column            | Type                               |
| ----------------- | ---------------------------------- |
| id                | UUID (PK)                          |
| student_id        | UUID (FK)                          |
| notification_type | ENUM('Placement','Result','Event') |
| message           | TEXT                               |
| is_read           | BOOLEAN                            |
| created_at        | TIMESTAMP                          |

## Indexes

```sql
CREATE INDEX idx_notifications_student
ON notifications(student_id);

CREATE INDEX idx_notifications_read
ON notifications(is_read);

CREATE INDEX idx_notifications_created
ON notifications(created_at);
```

## Potential Scaling Problems

As data grows:

* Slow notification retrieval.
* Increased storage requirements.
* High write volume during bulk notifications.
* Database contention during peak placement seasons.

## Solutions

### Database Indexing

Create indexes on frequently queried columns.

### Pagination

Retrieve notifications in pages instead of loading everything.

Example:

```sql
SELECT *
FROM notifications
WHERE student_id = '123'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Partitioning

Partition notifications by creation date.

### Read Replicas

Use read replicas to distribute read traffic.

### Caching

Use Redis to cache frequently accessed notifications.

## Example Queries

### Create Notification

```sql
INSERT INTO notifications
(id, student_id, notification_type, message, is_read, created_at)
VALUES
(uuid_generate_v4(),
'student123',
'Placement',
'Microsoft hiring',
false,
NOW());
```

### Get Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = 'student123'
ORDER BY created_at DESC;
```

### Mark Notification Read

```sql
UPDATE notifications
SET is_read = true
WHERE id = 'notification123';
```

### Delete Notification

```sql
DELETE FROM notifications
WHERE id = 'notification123';
```

# Stage 3

## Query Analysis

### Given Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

### Is the query accurate?

Yes, the query is accurate. It retrieves all unread notifications for the student with ID `1042` and displays them in the order they were created.

### Why is this query slow?

Initially, when the database contained only a small amount of data, this query may have worked well. However, the system now contains around 50,000 students and 5,000,000 notifications.

If there are no proper indexes, the database has to search through a very large number of records to find unread notifications for a specific student. After filtering the data, it must also sort the results by `createdAt`.

As the size of the table increases, this process becomes slower and can affect API performance.

### What would I change?

I would create a composite index on the columns that are most frequently used in filtering and sorting.

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

This index helps the database quickly find notifications for a particular student, filter unread notifications, and return them in the required order without performing expensive scans and sorting operations.

### Computational Cost

Without indexing, the query may require scanning the entire notifications table.

**Time Complexity:** O(N)

After creating the composite index, the database can locate matching records much faster.

**Time Complexity:** O(log N + K)

Where:

* N = Total notifications
* K = Matching notifications returned

### Should we add indexes on every column?

No. Adding indexes on every column is not a good practice.

Although indexes improve read performance, they also:

* Increase storage usage
* Slow down INSERT, UPDATE and DELETE operations
* Increase database maintenance overhead

Indexes should only be added to columns that are frequently used in filtering, searching, joining, or sorting.

### Query to find students who received Placement notifications in the last 7 days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL 7 DAY;
```

To improve the performance of this query, the following index can be created:

```sql
CREATE INDEX idx_notifications_type_created
ON notifications(notificationType, createdAt);
```

This allows the database to efficiently locate Placement notifications created within the last seven days.

# Stage 4

## Problem

Currently, notifications are fetched from the database every time a student loads a page. As the number of students and notifications grows, this creates a large number of database queries and increases response time. This can overload the database and negatively affect user experience.

## Suggested Solutions

### 1. Caching Frequently Accessed Notifications

I would use a caching system such as Redis to store recently fetched notifications.

#### How it works

* When a user requests notifications, the application first checks Redis.
* If the data exists in Redis, it is returned immediately.
* If not, the application fetches data from the database and stores it in Redis for future requests.

#### Benefits

* Reduces database load significantly.
* Faster response times.
* Better user experience.

#### Tradeoff

* Additional infrastructure is required.
* Cached data may become slightly outdated if not refreshed properly.

---

### 2. Pagination

Instead of loading all notifications at once, only a limited number should be fetched.

Example:

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
ORDER BY createdAt DESC
LIMIT 20 OFFSET 0;
```

#### Benefits

* Smaller result sets.
* Faster query execution.
* Reduced network traffic.

#### Tradeoff

* Users need to load additional pages to view older notifications.

---

### 3. Fetch Only Unread Notifications Initially

Most users are interested in recent or unread notifications.

Instead of fetching all notifications, the application can initially fetch only unread notifications and provide a separate option to view older notifications.

#### Benefits

* Less data transferred.
* Faster page loading.

#### Tradeoff

* Additional API endpoints may be required.

---

### 4. Real-Time Notification Delivery

Instead of repeatedly fetching notifications on every page load, WebSockets or Server-Sent Events (SSE) can be used.

#### How it works

* The client establishes a persistent connection.
* New notifications are pushed to users instantly.

#### Benefits

* Near real-time updates.
* Eliminates unnecessary polling requests.
* Better user experience.

#### Tradeoff

* More complex implementation.
* Additional server resources required for maintaining connections.

---

## Recommended Approach

I would combine:

1. Proper database indexing
2. Redis caching
3. Pagination
4. WebSockets for real-time updates

This approach minimizes database load, improves response time, and provides a smooth experience for students even as the system scales to millions of notifications.
