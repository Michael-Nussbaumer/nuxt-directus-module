# @michael-nussbaumer/nuxt-directus

[![npm version](https://img.shields.io/npm/v/@Michael-Nussbaumer/nuxt-directus.svg)](https://www.npmjs.com/package/@michael-nussbaumer/nuxt-directus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready Nuxt 4 module that integrates Directus SDK with authentication, configurable global auth middleware, and automatic TypeScript type generation from Directus OpenAPI schema.

## Features

- ✅ **Directus SDK Integration** - Seamless integration with @directus/sdk
- 🔐 **Authentication Composables** - Login, logout, register, verify email, and more
- 🛡️ **Global Auth Middleware** - Configurable route protection with page meta
- 📘 **TypeScript Type Generation** - Auto-generate types from Directus OpenAPI schema
- ⚙️ **Flexible Configuration** - Customize behavior via module options
- 🚀 **Nuxt 4 Ready** - Built for Nuxt 4 with full TypeScript support

## Installation

```bash
pnpm add @michael-nussbaumer/nuxt-directus
```

## Quick Start

### 1. Add Module to `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
    modules: ["@michael-nussbaumer/nuxt-directus"],

    directus: {
        enableGlobalMiddleware: true,
        auth: {
            loginPath: "/auth/login",
            afterLoginPath: "/",
        },
        types: {
            enabled: true,
            openApiUrl: "http://directus.local/server/specs/oas",
            output: "./schema/schema.d.ts",
            authHeaderEnv: "DIRECTUS_OPENAPI_TOKEN",
        },
    },
});
```

### 2. Set Environment Variables

Create a `.env` file:

```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_OPENAPI_TOKEN=Bearer your-token-here
```

### 3. Use Auth Composable

```vue
<script setup lang="ts">
const { login, user, isAuthenticated, logout } = useDirectusAuth();

const handleLogin = async () => {
    await login({
        email: "user@example.com",
        password: "password",
    });
};
</script>
```

## Page Meta Authentication

Protect your routes using page meta:

### Public Page

```typescript
definePageMeta({
    auth: false,
});
```

### Protected Page (Default)

```typescript
definePageMeta({
    auth: true,
});
```

### Unauthenticated Only (Login Page)

```typescript
definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: "/dashboard",
    },
});
```

### Custom Redirects

```typescript
definePageMeta({
    auth: {
        navigateUnauthenticatedTo: "/custom-login",
    },
});
```

## Documentation

Comprehensive guides for all module features:

- **[Getting Started](./docs/getting-started.md)** - Installation, setup, and basic usage
- **[Configuration](./docs/configuration.md)** - Module options and environment variables
- **[Authentication](./docs/authentication.md)** - Login, logout, registration, and user management
- **[API Usage](./docs/api.md)** - CRUD operations, queries, and filtering
- **[Real-time WebSocket](./docs/realtime.md)** - Live subscriptions and event handling
- **[Middleware](./docs/middleware.md)** - Route protection and authentication flows
- **[Type Generation](./docs/type-generation.md)** - Automatic TypeScript types from OpenAPI schema

## Quick Reference

### Module Options

```typescript
{
  enableGlobalMiddleware: true,
  auth: {
    loginPath: '/auth/login',
    registerPath: '/auth/register',
    afterLoginPath: '/',
    afterLogoutPath: '/auth/login'
  },
  types: {
    enabled: true,
    openApiUrl: 'http://directus.local/server/specs/oas',
    output: './schema/schema.d.ts',
    authHeaderEnv: 'DIRECTUS_OPENAPI_TOKEN'
  }
}
```

### Composables

#### `useDirectusAuth()`

Authentication methods:

- `login(credentials)` - Authenticate user
- `logout()` - End session
- `register(data)` - Create account
- `fetchUser()` - Get current user
- `verifyEmail(token)` - Verify email
- `requestPasswordReset(email)` - Request reset
- `resetPassword(token, password)` - Reset password

#### `useDirectusApi()`

API operations:

- `getItems(collection, query)` - Fetch multiple items
- `getItem(collection, id, query)` - Fetch single item
- `createOne(collection, data)` - Create item
- `createMany(collection, data)` - Create multiple items
- `updateOne(collection, id, data)` - Update item
- `updateMany(collection, ids, data)` - Update multiple items
- `deleteOne(collection, id)` - Delete item
- `deleteMany(collection, ids)` - Delete multiple items
- `customRequest(method, path, options)` - Custom endpoint

#### `useDirectusRealtime()`

WebSocket subscriptions:

- `subscribe(collection, event, callback, options)` - Listen to events
- `unsubscribe(uid)` - Remove specific subscription
- `unsubscribeCollection(collection)` - Remove all for collection
- `unsubscribeAll()` - Remove all subscriptions

## Development

### Setup

```bash
pnpm install
```

### Development Server

```bash
pnpm run dev
```

### Build

```bash
pnpm run build
```

### Playground

The module includes a playground for testing:

```bash
cd playground
pnpm run dev
```

## License

MIT License © 2026 michael-nussbaumer Communications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

https://github.com/michael-nussbaumerCommunications/nuxt-directus-module
