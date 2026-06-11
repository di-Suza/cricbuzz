# Cricket Project Team Guide

Bhai log, ye root guide hai. Project do parts me split hai:

- `api/` me apna backend server hai.
- `web/` me apna frontend React app hai.
- Root `.gitignore` se hi kaam chalega. `api/` aur `web/` ke andar separate `.gitignore` nahi rakhna.
- Root `package.json` sirf helper scripts ke liye hai. Isme main app code nahi hai.

Root se commands:

```bash
npm run dev:api
npm run dev:web
npm run seed:super-admin
npm run check:api
npm run build:web
```

Matlab baar-baar `cd api` ya `cd web` karna compulsory nahi hai.

## 1. Folder Map

```txt
cricbuzz/
  package.json        -> root helper scripts only
  .gitignore          -> common ignore file
  TEAM_GUIDE.md       -> ye guide
  api/                -> backend server
  web/                -> frontend React app
```

## 2. `api/` Ka Kaam

`api/` backend hai. Yahan Express server, MongoDB connection, JWT auth, RBAC, Socket.IO, validations, logging aur security middleware hai.

Backend request flow:

```txt
server.js
  -> app.js
    -> route
      -> middleware
        -> controller
          -> service
            -> repository
              -> model
```

Simple meaning:

- `server.js`: HTTP server start karta hai, DB connect karta hai, Socket.IO attach karta hai.
- `app.js`: Express app setup karta hai, middleware lagata hai, routes mount karta hai.
- `route`: API endpoint define karta hai.
- `middleware`: auth, role check, validation, logger, security.
- `controller`: request leta hai, service call karta hai, response bhejta hai.
- `service`: business logic.
- `repository`: sirf DB calls.
- `model`: Mongoose schema.

Rule simple hai: controller thin, service smart, repository DB-only.

## 3. `web/` Ka Kaam

`web/` frontend app hai.

Tech:

- React
- Vite 7
- Tailwind CSS

Abhi web app intentionally blank hai. Frontend team yahin se UI start karegi.

Important files:

- `web/index.html`: Vite entry HTML
- `web/src/main.jsx`: React mount
- `web/src/App.jsx`: blank app component
- `web/src/index.css`: Tailwind directives
- `web/tailwind.config.js`: Tailwind config
- `web/vite.config.js`: Vite config

## 4. Root `package.json`

Root package ka kaam sirf scripts shortcut dena hai.

Use:

```bash
npm run dev:api
```

Ye internally chalata hai:

```bash
npm --prefix api run dev
```

Use:

```bash
npm run dev:web
```

Ye internally chalata hai:

```bash
npm --prefix web run dev
```

Super admin seed:

```bash
npm run seed:super-admin
```

Iske liye `api/.env` me ye values honi chahiye:

```txt
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=strong-password-here
```

Production me ye values secret manager ya protected env se dena, code me hardcode ya commit mat karna.

Root package me app dependencies mat daalna jab tak truly workspace-level dependency na ho.

## 5. API Core Files

### `api/src/server.js`

Entry point hai.

Kaam:

- Express app ko HTTP server me wrap karta hai.
- Socket.IO attach karta hai.
- `connectDB()` call karta hai.
- Port listen karta hai.

### `api/src/app.js`

Express app ka main setup.

Yahan ye middleware lagte hain:

- `pino-http` request logger
- `helmet` security headers
- `cors`
- `express.json`
- `express.urlencoded`
- global rate limiter
- routes
- `notFound`
- `errorHandler`

Yahin public aur admin routes mount hote hain.

### `api/src/config/env.js`

Env validation yahan hoti hai using Zod.

Important: Zod sirf env validation ke liye use hoga. API validation ke liye `express-validator`.

### `api/src/config/db.js`

MongoDB connection class.

### `api/src/config/logger.js`

Pino logger config.

Sensitive headers redact karta hai, jaise authorization/cookie.

## 6. API Shared Layer

Folder:

```txt
api/src/shared/
```

### `constants/`

- `roles.js`: `SUPER_ADMIN`, `ADMIN`, `SCORER`
- `matchStatus.js`: match lifecycle status

### `errors/`

Custom errors:

- `BadRequestError`
- `UnauthorizedError`
- `ForbiddenError`
- `NotFoundError`
- `ConflictError`

Service me errors isi se throw karo.

### `middleware/`

Important files:

- `auth.js`: JWT verify + RBAC
- `validateRequest.js`: express-validator result handle
- `requestLogger.js`: pino HTTP logging
- `security.js`: helmet + rate limit
- `notFound.js`: 404
- `errorHandler.js`: final JSON error response

### `validators/common.js`

Common express-validator helpers:

- `body`
- `param`
- `query`
- `objectIdParam`
- `idParamRules`

## 7. API Auth/RBAC

Roles:

- `SUPER_ADMIN`: full access
- `ADMIN`: master data + match operations
- `SCORER`: live match operations only

Flow:

```txt
login/register
  -> JWT token
  -> Authorization: Bearer <token>
  -> authenticate
  -> authorize(...)
  -> controller
```

Auth module:

```txt
api/src/modules/auth/
  auth.route.js
  auth.controller.js
  auth.service.js
  validators/auth.validator.js
```

## 8. Admin Module Pattern

Har admin module same pattern follow karega:

```txt
moduleName/
  moduleName.model.js
  moduleName.repository.js
  moduleName.service.js
  moduleName.controller.js
  moduleName.route.js
  validators/
    moduleName.validator.js
  dto/
    moduleName.dto.js
  interfaces/
    moduleName.interface.js
```

### `model.js`

Mongoose schema.

### `repository.js`

Sirf database queries.

### `service.js`

Business logic.

### `controller.js`

Request/response adapter.

### `route.js`

Endpoint + middleware wiring.

### `validators/`

API validation using `express-validator`.

### `dto/`

Response/input shape documentation.

### `interfaces/`

JS project me documentation-style contract.

## 9. Current API Modules

Admin modules:

- `auth`
- `users`
- `series`
- `team`
- `player`
- `squad`
- `match`
- `playing-xi`
- `score`
- `commentary`

Public modules:

- `home`
- `match`
- `series`
- `team`
- `player`
- `commentary`
- `search`
- `points-table`

Public modules `api/src/modules/user/` ke andar hain aur read-only/cached surface ke liye hain.

## 10. Socket.IO

File:

```txt
api/src/sockets/socketGateway.js
```

Room format:

```txt
match:{matchId}
```

Use case:

```js
emitToMatch(matchId, 'score.updated', payload);
```

DB write successful hone ke baad hi socket emit karna.

## 11. Team Member Ka Workflow

Maan lo tumhe `series` module mila.

1. `series.model.js` me schema banao.
2. `series.repository.js` me DB methods banao.
3. `series.service.js` me business logic likho.
4. `series.controller.js` me service call karo.
5. `validators/series.validator.js` me express-validator rules banao.
6. `series.route.js` me endpoint wire karo.
7. `app.js` me route mount already hai ya nahi check karo.

Yahi pattern har module me follow karna.

## 12. Coding Rules

- API files ESM me hain: `import/export` use karo.
- `require/module.exports` mat use karo.
- Controller me business logic mat daalo.
- Service me business logic daalo.
- Repository me sirf DB query.
- API validation: `express-validator`.
- Env validation: `Zod`.
- Logs ke liye Pino logger.
- Security headers ke liye Helmet already app pe laga hai.
- Global rate limit app pe laga hai.
- Root se scripts run kar sakte ho.

## 13. Final Mental Model

```txt
Frontend web/ se request aayegi
  -> API app.js middleware pass karega
  -> route hit hogi
  -> controller service call karega
  -> service repository/model se kaam karegi
  -> response frontend ko jayega
```

Bas isi discipline me kaam karna hai, project clean rahega.
