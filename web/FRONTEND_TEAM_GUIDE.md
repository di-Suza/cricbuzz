# Frontend Team Guide

Ye guide frontend team ke liye hai taaki sabko project ka structure, auth flow, routing, RTK Query aur role based UI ka flow quickly samajh aa jaye.

## 1. Frontend Kaha Hai?

Frontend ka pura code `web/` folder ke andar hai.

```txt
web/
  src/
    app/
    shared/
    features/
```

`app/` me app level setup hai, `shared/` me common cheeze hain, aur `features/` me feature-wise code hai.

## 2. App Folder

```txt
src/app/
  providers.jsx
  router.jsx
  routes.config.jsx
  store.js
```

`store.js`
Redux store yahi setup hai. Isme `auth` slice aur RTK Query `baseApi` reducer/middleware connect hai.

`providers.jsx`
App ko Redux Provider aur auth bootstrap ke andar wrap karta hai.

`router.jsx`
React Router ka route setup hai. Public routes, protected routes, forbidden aur not found yahi define hote hain.

`routes.config.jsx`
Ye role based dashboard ka main source hai. Sidebar, protected routes, aur module access isi config se decide hota hai.

## 3. Shared Folder

```txt
src/shared/
  api/
  components/
  constants/
```

`shared/api/baseApi.js`
RTK Query ka base setup hai. Yahi se har API call jaati hai.

Important flow:
- Access token Redux state se uthta hai.
- Request me `Authorization: Bearer <token>` lagta hai.
- Refresh cookie automatically browser se jaati hai because `credentials: 'include'`.
- Agar API 401 deti hai to `/auth/refresh` call hoti hai.
- Mutex use hua hai taaki ek time pe sirf ek refresh request chale, baaki API calls wait karein.
- New access token aate hi Redux state me set hota hai aur original API retry hoti hai.

`shared/components/`
Common UI wrappers:
- `PublicLayout.jsx`: public pages ke liye layout.
- `ProtectedLayout.jsx`: dashboard layout, sidebar, header.
- `RoleRoute.jsx`: protected route + role check.
- `GuestRoute.jsx`: login page ko logged-in user se hide karta hai.
- `ModulePage.jsx`: generic module page skeleton.
- `LoadingScreen.jsx`: bootstrap/loading screen.

`shared/constants/`
Roles and permissions:
- `roles.js`: `SUPER_ADMIN`, `ADMIN`, `SCORER`
- `permissions.js`: role based action permissions.

## 4. Features Folder

```txt
src/features/
  auth/
  dashboard/
  home/
  users/
  series/
  teams/
  squads/
  players/
  matches/
  playing-xi/
  scoring/
  commentary/
  errors/
```

Har feature apne folder me rahega. Example:

```txt
features/users/
  api/
  pages/
```

Feature ka API code `api/` me, page/components `pages/` me.

## 5. Auth Flow

Auth ka code:

```txt
features/auth/
  api/authApi.js
  pages/LoginPage.jsx
  store/authSlice.js
  store/AuthBootstrap.jsx
```

Login flow:
1. User login form submit karta hai.
2. `useLoginMutation()` call hoti hai.
3. Backend access token response me deta hai.
4. Refresh token httpOnly cookie me set hota hai.
5. `authSlice` ke extraReducers automatically `user` aur `accessToken` state me set kar dete hain.

App refresh/tab reopen flow:
1. `AuthBootstrap` app start par `/auth/refresh` call karta hai.
2. Refresh cookie valid hai to backend new access token deta hai.
3. Access token Redux me set hota hai.
4. Phir `getMe` call hoti hai taaki current user state me aa jaye.

Logout flow:
1. `/auth/logout` call hoti hai.
2. Backend refresh session revoke karta hai aur cookie clear hoti hai.
3. Frontend auth state clear kar deta hai.

## 6. Public Aur Protected Routes

Public routes:
- `/` home page, sab users access kar sakte hain.
- `/login` sirf logged-out user ke liye.

Protected routes:
- `/dashboard`
- `/users`
- `/series`
- `/teams`
- `/squads`
- `/players`
- `/matches`
- `/playing-xi`
- `/scoring`
- `/commentary`

Protected routes me access tabhi milega jab:
- Access token available ho.
- User ka role route ke allowed roles me ho.

## 7. Role Based UI

Main role config `src/app/routes.config.jsx` me hai.

Example:

```js
{
  id: 'users',
  path: 'users',
  label: 'Users',
  roles: [SUPER_ADMIN],
  element: <UsersPage />,
  nav: true,
}
```

Iska matlab:
- Sidebar me Users tab sirf `SUPER_ADMIN` ko dikhega.
- Direct URL hit karega unauthorized user, to `Forbidden` page milega.
- Backend me bhi final protection `authorize(...)` se hi hogi.

Frontend role UI convenience hai, backend RBAC real security hai.

## 8. Users Feature

Current Users feature:

```txt
features/users/
  api/usersApi.js
  pages/UsersPage.jsx
```

`usersApi.js`
- `GET /users` se users list fetch karta hai.
- `GET /users/:id` query ready hai.

`UsersPage.jsx`
- Admins/scorers ki list dikhata hai.
- Create User button hai.
- Modal me role, name, email, password fields hain.
- Create user existing `POST /auth/register` API se connected hai.
- Success ke baad users list auto refresh hoti hai.

Edit/Delete buttons UI me visible hain but disabled hain, kyuki backend edit/delete APIs abhi nahi bani. Jab wo APIs banengi tab isi feature me mutations add karni hain.

## 9. Naya Feature Kaise Add Karna Hai?

Example maan lo `venues` feature add karna hai:

```txt
features/venues/
  api/venuesApi.js
  pages/VenuesPage.jsx
```

Steps:
1. Feature folder banao.
2. RTK Query API file banao.
3. Page component banao.
4. `routes.config.jsx` me route add karo.
5. `permissions.js` me action permission add karo agar page ke andar buttons role based dikhane hain.

Route config add karte hi:
- Sidebar me item aa jayega.
- Role guard apply ho jayega.
- Dashboard modules list me item aa jayega.

## 10. Important Rules

- Access token localStorage me save nahi karna.
- Access token Redux memory state me rahega.
- Refresh token httpOnly cookie me rahega.
- API calls hamesha RTK Query se karni hain.
- Role based route config ko single source rakhna hai.
- UI hide/show frontend karega, but backend permissions must always exist.
- Common components `shared/` me, feature-specific code `features/<feature>/` me.

Bas bhai, ye architecture follow karoge to frontend clean, scalable aur team-friendly rahega.
