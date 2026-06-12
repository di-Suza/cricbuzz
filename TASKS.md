# Auth API Task Split

Bhai log, auth module me 5 APIs banani hain:

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Important: Hum access + refresh token flow follow karenge.

- Access token response body me jayega.
- Refresh token `httpOnly` cookie me set hoga.
- Access token frontend memory/Redux state me rakhega.
- Refresh token DB session me store hoga.
- Logout pe current refresh token/session revoke hoga.
- Logout all ka support bhi session model ke through possible rahega.

## Common Auth Flow

```txt
Login success
  -> accessToken generate
  -> refreshToken generate
  -> refreshToken hash karke DB session me save
  -> refreshToken httpOnly cookie me set
  -> accessToken response me return

Normal protected API
  -> Authorization: Bearer <accessToken>
  -> authenticate middleware public key se verify karega
  -> req.user set hoga
  -> authorize role check karega

Access token expire/page refresh
  -> frontend /api/auth/refresh call karega
  -> browser refresh cookie automatically bhejega
  -> backend refresh token verify karega
  -> DB session valid hai ya nahi check karega
  -> new accessToken response me return karega

Logout
  -> refresh cookie read
  -> matching session revoke/blacklist
  -> refresh cookie clear
```

## Session Model Plan

Ek auth session model banana hoga, suggested folder:

```txt
api/src/modules/auth/session/
  authSession.model.js
  authSession.repository.js
  authSession.service.js
```

Suggested fields:

- `userId`
- `refreshTokenHash`
- `role`
- `userAgent`
- `ipAddress`
- `expiresAt`
- `revokedAt`
- `revokedReason`
- `createdAt`
- `updatedAt`

Field meaning:

- `userId`: jis user ki session hai, `User` model ka reference.
- `refreshTokenHash`: raw refresh token nahi save karna; SHA-256 hash save karna.
- `role`: login ke time user ka role snapshot.
- `userAgent`: browser/device info, example Chrome/Postman/mobile browser.
- `ipAddress`: login kis IP se hua.
- `expiresAt`: refresh session kab expire hogi.
- `revokedAt`: logout/logout-all ke baad revoke time; `null` means active session.
- `revokedReason`: revoke ka reason, example `LOGOUT`, `LOGOUT_ALL`, `TOKEN_ROTATED`.
- `createdAt`/`updatedAt`: Mongoose timestamps.

Indexes ka purpose:

- `refreshTokenHash` se refresh/logout lookup fast hoga.
- `userId` se user ki sessions fast milengi.
- `expiresAt` se expired session cleanup easy hoga.
- `revokedAt` se active vs revoked session filter hoga.
- `{ userId, revokedAt, expiresAt }` logout-all/current active sessions ke kaam aayega.

Rules:

- Raw refresh token DB me save nahi karna.
- Refresh token ka hash save karna.
- Refresh pe DB session valid hona chahiye.
- Logout pe session revoke karna.
- Logout all ke liye same user ke all active sessions revoke kar sakte hain.

Common service methods available rahenge:

- `createSession(user, refreshToken, req)`
- `findValidSession(refreshToken)`
- `revokeSession(refreshToken, reason)`
- `revokeAllUserSessions(userId, reason)`
- `deleteExpiredSessions()`

Repository methods available rahenge:

- `create(payload)`
- `findByRefreshTokenHash(refreshTokenHash)`
- `findActiveByRefreshTokenHash(refreshTokenHash)`
- `revokeByRefreshTokenHash(refreshTokenHash, reason)`
- `revokeAllByUserId(userId, reason)`
- `deleteExpiredSessions()`

## Member 1 - Register API

API:

```txt
POST /api/auth/register
```

Goal:

User creation ko role-based banana.

Access rules:

- `SUPER_ADMIN` can create:
  - `ADMIN`
  - `SCORER`
  - optionally another `SUPER_ADMIN` only if we explicitly allow it
- `ADMIN` can create:
  - `SCORER`
- `SCORER` cannot create anyone.
- Public unauthenticated register production me allow nahi karna.

Expected middleware:

```txt
authenticate
authorize(SUPER_ADMIN, ADMIN)
validateRequest(registerRules)
```

Business rules:

- Email unique hona chahiye.
- Password hash with bcrypt.
- Role body me required/validated hona chahiye.
- `ADMIN` agar `ADMIN` ya `SUPER_ADMIN` create kare to `403 Forbidden`.
- `SCORER` agar hit kare to `403 Forbidden`.
- Existing email pe `409 Conflict`.
- Created user response me password kabhi nahi jana chahiye.

Edge cases:

- Missing token.
- Invalid/expired access token.
- Invalid role.
- Duplicate email.
- Weak password.
- Admin trying to create admin.
- Admin trying to create super admin.
- Scorer trying to create user.

Response shape:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "...",
      "email": "...",
      "role": "SCORER"
    }
  }
}
```

Note:

Register API should not auto-login newly created user. User creation aur login separate rakho.

## Member 2 - Login API

API:

```txt
POST /api/auth/login
```

Goal:

All roles ka login handle karna:

- `SUPER_ADMIN`
- `ADMIN`
- `SCORER`

Flow:

```txt
email/password validate
  -> user find with password
  -> bcrypt compare
  -> accessToken generate
  -> refreshToken generate
  -> authSessionService.createSession(user, refreshToken, req)
  -> refresh cookie set
  -> accessToken + user return
```

Business rules:

- Deleted/inactive user login nahi kar sakta.
- Wrong email/password pe generic error: `Invalid email or password`.
- Response me password nahi jana chahiye.
- Refresh token raw DB me save nahi karna.
- Session me user-agent/ip store karna useful rahega.

Cookie:

- `httpOnly: true`
- `sameSite` env se
- `secure` env se
- name env se: `REFRESH_COOKIE_NAME`
- maxAge env se: `REFRESH_COOKIE_MAX_AGE_MS`

Response shape:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "...",
      "email": "...",
      "role": "ADMIN"
    },
    "accessToken": "..."
  }
}
```

Edge cases:

- User not found.
- Password mismatch.
- User soft deleted.
- JWT key missing/invalid.
- Session create fail.
- Cookie set but DB session fail should not happen; DB session create first, then cookie set.

## Member 3 - Get Me API

API:

```txt
GET /api/auth/me
```

Goal:

Current logged-in user ka profile return karna.

Expected middleware:

```txt
authenticate
```

Flow:

```txt
Authorization: Bearer <accessToken>
  -> authenticate public key se verify
  -> req.user.id
  -> DB se fresh user fetch
  -> password exclude
  -> response return
```

Business rules:

- Token valid hona chahiye.
- User DB me exist karna chahiye.
- User deleted/inactive hai to unauthorized/not found.
- Response me password nahi jana chahiye.

Response shape:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "...",
      "email": "...",
      "role": "SUPER_ADMIN"
    }
  }
}
```

Edge cases:

- Missing bearer token.
- Expired token.
- Invalid token type, example refresh token sent as bearer.
- User deleted after token issued.

## Member 4 - Refresh API

API:

```txt
POST /api/auth/refresh
```

Goal:

Refresh cookie se new access token issue karna.

Flow:

```txt
read refresh token from cookie
  -> verify refresh token using public key
  -> tokenType should be refresh
  -> authSessionService.findValidSession(refreshToken)
  -> user fetch
  -> new accessToken generate
  -> response return
```

Business rules:

- Refresh token cookie missing ho to `401`.
- Refresh token invalid/expired ho to `401`.
- DB session revoked/missing ho to `401`.
- User deleted/inactive ho to `401`.
- Access token only response body me dena.
- Refresh token rotation optional hai:
  - Simple version: same refresh token valid rahega until expiry/logout.
  - Stronger version: every refresh pe new refresh token issue + old session revoke.

Response shape:

```json
{
  "success": true,
  "data": {
    "accessToken": "..."
  }
}
```

Edge cases:

- Cookie missing.
- Refresh token expired.
- Refresh token valid JWT but DB session missing.
- Session revoked.
- User not found/deleted.
- Access token accidentally passed instead of refresh token.

## Member 5 - Logout API

API:

```txt
POST /api/auth/logout
```

Optional future API:

```txt
POST /api/auth/logout-all
```

Goal:

Current refresh session revoke karna and cookie clear karna.

Flow:

```txt
read refresh token from cookie
  -> if present, verify/hash
  -> authSessionService.revokeSession(refreshToken, 'LOGOUT')
  -> clear refresh cookie
  -> success response
```

Business rules:

- Logout idempotent hona chahiye.
- Cookie missing ho tab bhi success return kar sakte hain.
- Matching session mile to `revokedAt` set karo.
- `revokedReason = LOGOUT`.
- Cookie clear always.

Logout all flow:

```txt
authenticate access token
  -> req.user.id
  -> authSessionService.revokeAllUserSessions(req.user.id, 'LOGOUT_ALL')
  -> current refresh cookie clear
```

Blacklist/session concept:

- Hum separate token blacklist collection nahi banayenge initially.
- Auth session table hi blacklist/revocation ka kaam karegi.
- Revoked session ka refresh token dobara use nahi hoga.

Response shape:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

Edge cases:

- Cookie missing.
- Invalid refresh token.
- Session already revoked.
- Logout all without access token.

## Final Responsibility Map

```txt
Member 1 -> Register + role-based user creation
Member 2 -> Login + access token + refresh cookie + session create
Member 3 -> Get me + current user profile
Member 4 -> Refresh + session validation + new access token
Member 5 -> Logout/logout-all + session revoke + cookie clear
```

## Shared Files To Coordinate

Members should coordinate before editing these:

- `api/src/modules/auth/auth.route.js`
- `api/src/modules/auth/auth.controller.js`
- `api/src/modules/auth/auth.service.js`
- `api/src/modules/auth/session/authSession.model.js`
- `api/src/modules/auth/session/authSession.repository.js`
- `api/src/modules/auth/session/authSession.service.js`
- `api/src/modules/auth/validators/auth.validator.js`
- `api/src/shared/utils/jwtToken.js`
- `api/src/shared/utils/authCookie.js`
- `api/src/shared/middleware/auth.js`

Best approach:

One member owns shared route/controller merge, baaki members service methods and validators carefully add karein.
