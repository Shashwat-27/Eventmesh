# EventMesh — Backend Foundation Notes

### Steps 1–5 | Revision Notes

---

## 1. EventMesh kya hai?

**EventMesh = Reliable Event Delivery Infrastructure**

Iska kaam application ke events ko reliably registered consumers/webhooks tak deliver karna hai.

Basic idea:

```text
Application
    │
    │ "payment.success"
    ▼
EventMesh
    │
    │ reliable async delivery
    ▼
Webhook Consumer
    │
    ▼
Business Logic
```

EventMesh khud payment process, email ya SMS business logic nahi karta.

It handles infrastructure concerns:

* Event ingestion
* Authentication
* Authorization
* Queueing
* Webhook delivery
* Retry
* Exponential backoff
* Timeout
* Delivery tracking
* DLQ
* HMAC signatures
* Rate limiting
* Idempotency
* Multi-tenancy

---

# 2. Hum Monorepo kyun use kar rahe hain?

EventMesh mein multiple applications hongi:

```text
eventmesh/
│
├── apps/
│   ├── api/        → Express backend
│   ├── worker/     → BullMQ workers
│   └── dashboard/  → Next.js frontend
│
├── packages/
│   ├── types/      → shared TypeScript types
│   ├── config/     → shared configuration
│   └── utils/      → shared utilities
│
├── docs/
└── docker/
```

Sab ek hi Git repository mein hain, isliye ise **monorepo** kehte hain.

Root `package.json`:

```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

npm ko batata hai ki `apps` aur `packages` ke andar ke projects workspaces hain.

---

# 3. `--workspace` ka meaning

API ka package:

```json
{
  "name": "@eventmesh/api"
}
```

Aur usme:

```json
"scripts": {
  "dev": "tsx watch src/server.ts"
}
```

Isliye:

```bash
npm run dev --workspace=@eventmesh/api
```

ka meaning:

> `@eventmesh/api` workspace ka `dev` script run karo.

Flow:

```text
npm
 ↓
@eventmesh/api
 ↓
dev script
 ↓
tsx watch src/server.ts
 ↓
Express API
```

`--workspace` = specific workspace.

`--workspaces` = all workspaces.

---

# 4. Current Technology Stack

Abhi backend foundation:

```text
Node.js
   ↓
TypeScript
   ↓
Express.js
```

Supporting packages:

```text
express     → HTTP server/routing
cors        → cross-origin requests
helmet      → security-related HTTP headers
dotenv      → environment variables
tsx         → development mein TS run karna
TypeScript  → type safety
```

Later:

```text
PostgreSQL
Prisma
Redis
BullMQ
```

add honge.

---

# 5. Node.js + Express ka role

### Node.js

JavaScript/TypeScript backend code ko server par run karta hai.

### Express

Node.js ke upar HTTP application framework hai.

Express handle karta hai:

* HTTP requests
* Routes
* Middleware
* Responses

Example:

```ts
app.get("/health", handler);
```

Meaning:

> Jab `GET /health` request aaye, `handler` execute karo.

---

# 6. Current Project Structure

```text
apps/api/
│
├── src/
│   ├── config/
│   │   └── env.ts
│   │
│   ├── controllers/
│   │   └── health.controller.ts
│   │
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   └── request-logger.middleware.ts
│   │
│   ├── routes/
│   │   └── health.routes.ts
│   │
│   ├── services/
│   │
│   ├── utils/
│   │   └── app-error.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

Empty folders abhi intentionally empty hain.

---

# 7. `server.ts` ka role

`server.ts` ka main kaam:

> Actual HTTP server start karna.

Concept:

```ts
app.listen(env.port)
```

Flow:

```text
server.ts
   ↓
app import
   ↓
Express application
   ↓
listen()
   ↓
Port 3000
```

Current:

```text
http://localhost:3000
```

par API run kar rahi hai.

---

# 8. `app.ts` ka role

`app.ts` application configure karta hai.

Current flow:

```text
app.ts
 │
 ├── Helmet
 ├── CORS
 ├── JSON parser
 ├── Request Logger
 ├── Routes
 └── Error Handler
```

Important distinction:

```text
server.ts → server start
app.ts    → application configure
```

Ye separation future testing ke liye useful hai.

---

# 9. Middleware kya hota hai?

Middleware request aur final handler ke beech execute hota hai.

General flow:

```text
Request
   ↓
Middleware 1
   ↓
Middleware 2
   ↓
Middleware 3
   ↓
Route
   ↓
Controller
   ↓
Response
```

Middleware `next()` call karke request ko next layer mein bhejta hai.

Example:

```ts
app.use(express.json());
```

JSON request body ko parse karta hai.

---

# 10. Current Middleware

### Helmet

```ts
app.use(helmet());
```

Security-related HTTP headers configure karta hai.

### CORS

```ts
app.use(cors());
```

Browser ke cross-origin request rules handle karne mein help karta hai.

### JSON Parser

```ts
app.use(express.json());
```

JSON body ko:

```ts
req.body
```

mein available karata hai.

### Request Logger

Request ka:

* HTTP method
* URL
* status code
* response time

log karta hai.

Example:

```text
GET /health 200 - 5ms
```

---

# 11. Routes vs Controllers

Humne `/health` ko separate kiya:

```text
Route
   ↓
Controller
```

### Route

`health.routes.ts`

```ts
router.get("/health", healthCheck);
```

Route decide karta hai:

> Kis HTTP request ko kis handler ke paas bhejna hai?

### Controller

`health.controller.ts`

```ts
healthCheck()
```

Controller HTTP response handle karta hai.

So:

```text
GET /health
     ↓
health.routes.ts
     ↓
healthCheck()
     ↓
JSON response
```

---

# 12. `/health` API ka complete flow

Browser:

```text
GET http://localhost:3000/health
```

Flow:

```text
Browser
   ↓
localhost:3000
   ↓
Node.js
   ↓
Express
   ↓
Helmet
   ↓
CORS
   ↓
JSON Middleware
   ↓
Request Logger
   ↓
Health Router
   ↓
Health Controller
   ↓
HTTP 200
   ↓
JSON Response
```

Response:

```json
{
  "status": "ok",
  "service": "eventmesh-api"
}
```

---

# 13. Error Handling

Production application mein errors normal hain:

```text
Invalid input
Database failure
Redis failure
External API timeout
Unexpected exception
```

Har controller mein manually error response likhne ke bajay hum centralized error handler use kar rahe hain.

Architecture:

```text
Controller
    ↓
throw error
    ↓
Central Error Middleware
    ↓
Consistent HTTP response
```

---

# 14. `AppError`

Humne custom error banaya:

```ts
throw new AppError(
  "Event not found",
  404,
  "EVENT_NOT_FOUND"
);
```

Isme:

```text
message    → human-readable information
statusCode → HTTP status
code       → machine-readable error code
```

Example response:

```json
{
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event not found"
  }
}
```

Isse frontend/client predictable error format receive karta hai.

---

# 15. Error Middleware

Error middleware:

```text
(error, req, res, next)
```

signature use karta hai.

Express ise error handler ke roop mein identify karta hai.

Important:

```text
Normal middleware
(req, res, next)

Error middleware
(error, req, res, next)
```

Error handler ko routes ke baad register karte hain.

---

# 16. Configuration

Environment variables directly har file mein use karne ke bajay central configuration banayi:

```text
config/env.ts
```

Example:

```text
PORT
DATABASE_URL
REDIS_URL
HMAC_SECRET
```

Future mein sab environment configuration centrally manage hogi.

`.env`:

```text
actual local values/secrets
```

`.env.example`:

```text
required variable names
```

`.env` GitHub par nahi jaana chahiye.

---

# 17. TypeScript configuration

Root:

```text
tsconfig.json
```

common TypeScript configuration provide karta hai.

API:

```text
apps/api/tsconfig.json
```

root config ko extend karta hai.

Important settings:

```text
strict: true
```

Type safety enforce karta hai.

Development:

```text
tsx
```

TypeScript directly run karta hai.

Build:

```text
tsc
```

TypeScript ko JavaScript mein compile karta hai.

Production:

```text
node dist/server.js
```

---

# 18. Development vs Production Flow

### Development

```text
TypeScript
   ↓
tsx
   ↓
Node.js
```

### Production

```text
TypeScript
   ↓
tsc
   ↓
JavaScript / dist
   ↓
Node.js
```

---

# 19. Git Strategy

Hum project ko ek giant commit mein nahi bana rahe.

Current history:

```text
chore: initialize monorepo
        ↓
feat: add express api server
        ↓
refactor: structure express api layers
        ↓
feat: add error handling and request logging
```

Goal:

> Har commit ek meaningful development milestone represent kare.

Future examples:

```text
feat: add prisma database schema
feat: implement event ingestion
feat: add redis connection
feat: add bullmq event queue
feat: implement webhook worker
feat: add exponential retry policy
feat: implement dead letter queue
```

Isse GitHub project ka genuine development history dikhega.

---

# 20. Abhi humne kya achieve kiya?

Current EventMesh backend:

```text
                  EVENTMESH API
                       │
                       ▼
                  Node.js
                       │
                       ▼
                   Express
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Helmet         CORS       JSON Parser
                       │
                       ▼
                Request Logger
                       │
                       ▼
                    Routes
                       │
                       ▼
                 Controllers
                       │
                       ▼
                HTTP Response
                       │
                       ▼
              Central Error Handler
```

Currently sirf `/health` actual endpoint hai.

---

# 21. Most Important Mental Model

1 month baad EventMesh kholne se pehle ye yaad karo:

```text
server.ts
    ↓
starts server

app.ts
    ↓
configures Express

middleware
    ↓
pre-processes request

route
    ↓
decides where request goes

controller
    ↓
handles HTTP request/response

service
    ↓
business/application logic

repository
    ↓
database interaction

database
    ↓
persistent data
```

Future EventMesh request:

```text
POST /v1/events
        ↓
Express
        ↓
Authentication
        ↓
Rate Limiting
        ↓
Validation
        ↓
Route
        ↓
Controller
        ↓
Event Service
        ↓
PostgreSQL
        ↓
BullMQ / Redis
        ↓
Worker
        ↓
Webhook Consumer
```

**Yahi EventMesh ka core backend flow banega.**

---

## One-line revision

> **Server request accept karta hai → middleware request process karta hai → route request ko controller tak bhejta hai → controller application/service logic trigger karta hai → data layer database se interact karti hai → response client ko return hota hai → errors centralized handler se manage hote hain.**
