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

# Stage 5

## Problems with the Current Implementation

The current implementation processes students one by one.

```text
for each student:
    send_email()
    save_to_db()
    push_to_app()
```

This approach has several issues:

1. It is slow because each operation is performed sequentially.
2. If sending an email fails for some students, the process may stop midway.
3. There is no retry mechanism for failed notifications.
4. A single failure can affect the entire batch.
5. Sending notifications to 50,000 students can take a very long time.

For example, if email delivery fails for 200 students midway, it becomes difficult to determine who received notifications and who did not.

---

## Should saving to DB and sending emails happen together?

No.

Saving notifications and sending emails should be separated.

The database should be treated as the source of truth. First, create notification records in the database and then process email and push notifications asynchronously.

This ensures that even if an email service fails temporarily, the notification information is not lost.

---

## Proposed Solution

I would use a message queue such as RabbitMQ, Kafka, or AWS SQS.

### Flow

1. HR clicks "Notify All".
2. Notification records are created in the database.
3. Notification jobs are pushed into a queue.
4. Multiple worker services consume jobs from the queue.
5. Workers send emails and push notifications independently.
6. Failed jobs are retried automatically.

This design is scalable, fault tolerant, and much faster.

---

## Revised Pseudocode

```text
function notify_all(student_ids, message):

    for student_id in student_ids:

        notification_id = save_to_db(student_id, message)

        publish_to_queue({
            notification_id,
            student_id,
            message
        })


worker():

    while queue_not_empty:

        job = consume_job()

        try:
            send_email(job.student_id, job.message)

            push_to_app(job.student_id, job.message)

            mark_as_sent(job.notification_id)

        catch error:

            retry_job(job)
```

---

## Benefits

* Faster processing through parallel workers.
* Failed notifications can be retried.
* Database remains consistent.
* No notifications are lost.
* Easily scalable for 50,000+ students.
* Better reliability and fault tolerance.

## Tradeoffs

* Additional infrastructure is required for the message queue.
* Monitoring and worker management become necessary.
* Slightly higher system complexity.

However, the reliability and scalability benefits outweigh these drawbacks for a large-scale notification system.

## Stage 6

To implement the Priority Inbox feature, I assigned a weight to each notification type:

* Placement = 3
* Result = 2
* Event = 1

A priority score is calculated using both the notification type weight and notification timestamp. Notifications with higher type priority are ranked first, and notifications of the same type are sorted by recency.

The application fetches notifications from the provided API, calculates a priority score for each notification, sorts them in descending order, and displays the top 10 notifications.

Example ordering:

1. Placement notifications
2. Result notifications
3. Event notifications

To efficiently maintain the top 10 notifications as new notifications arrive, a min-heap (priority queue) of size 10 can be used. This allows insertion of new notifications in O(log n) time while keeping memory usage low.

Time Complexity:

* Priority score calculation: O(n)
* Sorting: O(n log n)

Optimized Approach:

* Use a priority queue of size 10
* Complexity: O(n log 10) ≈ O(n)

This approach ensures that the most important and most recent notifications are always displayed to the user.

