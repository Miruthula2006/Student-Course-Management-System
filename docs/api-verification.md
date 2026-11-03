# API Verification Checklist

Run the backend and use Postman with a base URL of `http://localhost:5000`. Keep the JWT in a Postman variable named `token` and send it as `Authorization: Bearer {{token}}` for protected calls. Do not commit credentials or tokens.

## Authentication and authorization

- `POST /api/v1/auth/register`: valid student data returns `201`; malformed input or a password shorter than 12 characters returns `400`; duplicate email/register number returns `409`.
- `POST /api/v1/auth/login`: valid credentials return `200` and a JWT; invalid credentials return `401`.
- `GET /api/v1/profile`: no/invalid/expired token returns `401`; a valid student or admin token returns only that account's profile.
- `GET /api/v1/students`: student token returns `403`; admin token returns student records without password hashes.
- Delete or change a user's role in MongoDB, then retry with their old token. The next protected request must reject the deleted account or use the updated role.

## Student, course, enrollment, and progress operations

- Admin-only student CRUD: `GET /api/v1/students`, `GET /api/v1/students/:id`, `POST /api/v1/students`, `PUT /api/v1/students/:id`, and `DELETE /api/v1/students/:id`.
- Public course reads: `GET /api/v1/courses` and `GET /api/v1/courses/:id`. Admin-only writes: `POST`, `PUT /:id`, and `DELETE /:id` under `/api/v1/courses`.
- Student enrollments: `POST /api/v1/enrollments` with `{ "courseId": "..." }`, `GET /api/v1/enrollments/mine`, and `PATCH /api/v1/enrollments/:courseId/withdraw`. Re-enrolling after withdrawal reactivates the existing row.
- Student progress: `PUT /api/v1/progress/:courseId` with integer `completedLessons` and `totalLessons`; progress without an active/completed enrollment returns `403`.
- Completing all lessons allows `PATCH /api/v1/enrollments/:courseId/complete` and creates one certificate. A certificate ID belonging to another student returns `404`.
- Invalid MongoDB IDs return `400`; unknown API paths return `404`; duplicate indexes return `409`.

## Messaging and notifications

- Connect two clients to Socket.IO using `auth: { token }`. A missing/invalid token must be rejected.
- Emit `send_message` with a valid `recipientId` and `text`; both user rooms receive `receive_message`, the recipient receives `new_notification`, and the sender receives an acknowledgement.
- `GET /api/v1/messages/:userId` returns only the conversation involving the current user. `GET /api/v1/notifications` and `PATCH /api/v1/notifications/:id/read` are recipient-scoped.
- Repeat requests without credentials and with another user's notification/certificate IDs to verify access is denied.

This checklist is a test procedure, not a claim that external Postman or production tests have already been run.