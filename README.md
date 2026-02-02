# @michael-nussbaumer/nuxt-directus

[![npm version](https://img.shields.io/npm/v/@michael-nussbaumer/nuxt-directus.svg)](https://www.npmjs.com/package/@michael-nussbaumer/nuxt-directus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-live-brightgreen.svg)](https://michael-nussbaumer.github.io/nuxt-directus-module/)
[![Nuxt](https://img.shields.io/badge/Nuxt-3%20%7C%204-00DC82.svg)](https://nuxt.com)

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

📚 **[Full Documentation Site](https://michael-nussbaumer.github.io/nuxt-directus-module/)**

Comprehensive guides for all module features:

- **[Getting Started](https://michael-nussbaumer.github.io/nuxt-directus-module/getting-started/installation)** - Installation, setup, and basic usage
- **[Configuration](https://michael-nussbaumer.github.io/nuxt-directus-module/getting-started/configuration)** - Module options and environment variables
- **[Authentication](https://michael-nussbaumer.github.io/nuxt-directus-module/guides/authentication)** - Login, logout, registration, and user management
- **[API Usage](https://michael-nussbaumer.github.io/nuxt-directus-module/guides/api)** - CRUD operations, queries, and filtering
- **[Real-time WebSocket](https://michael-nussbaumer.github.io/nuxt-directus-module/guides/realtime)** - Live subscriptions and event handling
- **[Middleware](https://michael-nussbaumer.github.io/nuxt-directus-module/guides/middleware)** - Route protection and authentication flows
- **[Permissions](https://michael-nussbaumer.github.io/nuxt-directus-module/guides/permissions)** - Advanced access control
- **[Type Generation](https://michael-nussbaumer.github.io/nuxt-directus-module/guides/type-generation)** - Automatic TypeScript types from OpenAPI schema
- **[Examples](https://michael-nussbaumer.github.io/nuxt-directus-module/examples/examples)** - Code examples and use cases

Or browse the [docs folder](./docs) in this repository.

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
- `customRequest(path, options)` - Custom endpoint

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

https://github.com/Michael-Nussbaumer/nuxt-directus-module

## Documentation Site

The documentation is hosted on GitHub Pages. To set it up for the first time, see [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md).

Visit: https://michael-nussbaumer.github.io/nuxt-directus-module/
